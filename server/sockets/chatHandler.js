// server/sockets/chatHandler.js
const ChatRoom = require('../models/ChatRoom');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Join a chat room
    socket.on('join-room', async ({ roomId, user }) => {
      try {
        console.log(`👤 ${user.name} joining room: ${roomId}`);

        // Join the socket room
        socket.join(roomId);

        // Update participant join time in database
        const chatRoom = await ChatRoom.findOne({ roomId });
        
        if (chatRoom) {
          // Update join time based on role
          if (user.role === 'candidate') {
            chatRoom.participants.candidate.joinedAt = new Date();
          } else if (user.role === 'employer') {
            chatRoom.participants.employer.joinedAt = new Date();
            chatRoom.participants.employer.name = user.name; // Update employer name
          }
          
          await chatRoom.save();

          // Notify other users in the room
          socket.to(roomId).emit('user-joined', {
            user: user.name,
            role: user.role,
            timestamp: new Date()
          });

          // Send existing messages to the new user
          socket.emit('load-messages', chatRoom.messages);

          console.log(`✅ ${user.name} joined room ${roomId}`);
        } else {
          socket.emit('error', { message: 'Chat room not found' });
        }

      } catch (error) {
        console.error('❌ Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send message
    socket.on('send-message', async ({ roomId, message, sender }) => {
      try {
        console.log(`💬 Message in ${roomId} from ${sender.name}`);

        // Save message to database
        const chatRoom = await ChatRoom.findOne({ roomId });
        
        if (chatRoom) {
          const newMessage = {
            sender: {
              name: sender.name,
              email: sender.email,
              role: sender.role
            },
            message,
            timestamp: new Date()
          };

          chatRoom.messages.push(newMessage);
          await chatRoom.save();

          // Broadcast message to all users in the room
          io.to(roomId).emit('receive-message', newMessage);

          console.log(`✅ Message saved and broadcast to room ${roomId}`);
        }

      } catch (error) {
        console.error('❌ Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ roomId, user }) => {
      socket.to(roomId).emit('user-typing', { user: user.name });
    });

    socket.on('stop-typing', ({ roomId }) => {
      socket.to(roomId).emit('user-stop-typing');
    });

    // Leave room
    socket.on('leave-room', ({ roomId, user }) => {
      console.log(`👋 ${user.name} leaving room: ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { user: user.name });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('🔌 User disconnected:', socket.id);
    });
  });
};