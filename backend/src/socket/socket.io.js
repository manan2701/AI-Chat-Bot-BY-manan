const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const messageModel = require("../models/message.model");
const aiService = require("../service/ai.service");
const { queryMemory, createMemory } = require("../service/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const { token } = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!token) {
      next(new Error("Not Authenticated please login"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await userModel.findById({ _id: decoded.userId });

      if (!user) {
        return next(new Error("No user found"));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token please login agin."));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      const [message, vector] = await Promise.all([
        messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: messagePayload.content,
          role: "user",
        }),
        aiService.generateVectors(messagePayload.content),
      ]);

      await createMemory({
        id: message._id,
        values: vector,
        metadata: {
          userId: socket.user._id,
          chatId: messagePayload.chat,
          text: messagePayload.content,
        },
      });

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vector,
          limit: 3,
          metadata: { user: { $eq: "68d2619a9790a292fdd5da5c" } },
        }),
        messageModel.find({
          chat: messagePayload.chat,
        }).sort({ createdAt: -1 }).limit(20).lean().then(messages => messages.reverse()),
      ]);

      const stm = chatHistory.map((chat) => {
        return {
          role: chat.role,
          parts: [{ text: chat.content }],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `
                    
                    these are some previous messages from the chat, use them to generate a response

                    ${memory.map((item) => item.metadata.text).join("\n")}
                `,
            },
          ],
        },
      ];

      const response = await aiService.generateResponse([...ltm, ...stm]);

      socket.emit("ai-response", {
        message: response,
      });

      const [responseMesage, responseVector] = await Promise.all([
        messageModel.create({
          user: socket.user._id,  
          chat: messagePayload.chat,
          content: response,
          role: "model",
        }),
        aiService.generateVectors(response),
      ]);

      await createMemory({
        id: responseMesage._id,
        values: responseVector,
        metadata: {
          userId: socket.user._id,
          chatId: messagePayload.chat,
          text: response,
        },
      });
    });
  });
}

module.exports = initSocketServer;
