const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const chatSchema = new mongoose.Schema({
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Emit existing chat history to the user
  Chat.find().then(messages => {
    socket.emit('loadMessages', messages);
  });

  // Listen for incoming messages from client
  socket.on('message', (data) => {
    const newMessage = new Chat({ sender: data.sender, message: data.message });
    newMessage.save().then(() => {
      io.emit('message', data);  // Broadcast to all users
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
