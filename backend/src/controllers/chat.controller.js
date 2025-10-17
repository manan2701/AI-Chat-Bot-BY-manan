const chatModel = require("../models/chat.model");

async function createChat(req, res) {
  const  userId  = req.userId;
  const { title } = req.body;
  
  try {
    const newChat = await chatModel.create({
      user: userId,
      title,
    });
    return res.status(201).json({ 
        message: "Chat created successfully", 
        chat: newChat
     });
  } catch (err) {
    return res.status(500).json({ 
        message: "Internal server error" 
    });
  }
}

async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user._id });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}

async function getMessages(req, res) {

    const chatId = req.params.id;

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messages
    })

}

module.exports = {
    createChat,
    getChats,
    getMessages
};
