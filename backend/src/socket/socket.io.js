const { Server } = require('socket.io');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const messageModel = require('../models/message.model');
const aiService = require('../service/ai.service');
const {queryMemory, createMemory} = require('../service/vector.service');
const { text } = require('express');


function initSocketServer(httpServer) {
    const io = new Server(httpServer,{});

    io.use(async (socket, next) => {
        const {token} = cookie.parse(socket.handshake.headers?.cookie || "");

        if(!token){
            next(new Error("Not Authenticated please login"));
        }        

        try {
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await userModel.findById({_id: decoded.userId});

            if(!user) {
                return next(new Error("No user found"));
            }
            socket.user = user;
            next();

        } catch (err) {
            next(new Error("Invalid token please login agin."));
        }
        
    })

    io.on("connection", (socket) => {
        socket.on("ai-message", async (messagePayload) => {

            const createChat = await messageModel.create({
                user : socket.user._id,
                chat : messagePayload.chat,
                content : messagePayload.content,
                role : "user"
            })

            const vector = await aiService.generateVectors(messagePayload.content);

            const memory = await queryMemory({
                queryVector : vector,
                limit : 3,
                metadata : { user: { $eq: "68d2619a9790a292fdd5da5c" } }
            });

            await createMemory({
                id : createChat._id,
                values : vector,
                metadata : {
                    userId : socket.user._id,
                    chatId : messagePayload.chat,
                    text : messagePayload.content
                }
            })

            const chatHistory = await messageModel.find({chat : messagePayload.chat})

            const stm = chatHistory.map((chat)=>{
                return {
                    role : chat.role,
                    parts : [{text : chat.content}]
                }
            })

            const ltm = [{
                role : "user",
                parts : [{
                    text : `
                    
                    You are a helpful assistant that helps users with their queries. Use the context from the user to provide better responses. If you don't know the answer, just say that you don't know. Never make up an answer.

                    ${memory.map((item) => item.metadata.text).join("\n")}
                `}]
            }];

            const response = await aiService.generateResponse([...ltm,...stm]);

            const responseMesage = await messageModel.create({
                user : socket.user._id,
                chat : messagePayload.chat,
                content : response,
                role : "model"
            })

            const responseVector = await aiService.generateVectors(response);

            await createMemory({
                id : responseMesage._id,
                values : responseVector,
                metadata : {
                    userId : socket.user._id,
                    chatId : messagePayload.chat,
                    text : response
                }
            })
            
            socket.emit("ai-response",{
                message : response
            });
            
        })      
    });
};

module.exports = initSocketServer;


