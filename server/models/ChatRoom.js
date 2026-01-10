/ server/models/ChatRoom.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['recruiter', 'candidate', 'employer']
    }
  },
  message: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  participants: {
    recruiter: {
      email: String,
      name: String,
      joinedAt: Date
    },
    candidate: {
      email: String,
      name: String,
      joinedAt: Date
    },
    employer: {
      email: String,
      name: String,
      joinedAt: Date
    }
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);