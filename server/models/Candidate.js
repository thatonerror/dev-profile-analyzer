const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  skills: { type: String, required: true },
  experience: { type: String, required: true },
  employerEmail: { type: String, required: true },
  roomId: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true }, // recruiter email
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema);