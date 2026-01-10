// server/routes/verification.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Candidate = require('../models/Candidate');
const ChatRoom = require('../models/ChatRoom');
const { sendVerificationEmail, sendCandidateNotification } = require('../utils/emailService');

const router = express.Router();

// Submit candidate form
router.post('/submit', async (req, res) => {
  try {
    const { name, email, skills, experience, employerEmail, recruiterEmail } = req.body;

    // Validate required fields
    if (!name || !email || !skills || !experience || !employerEmail || !recruiterEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Generate unique room ID
    const roomId = uuidv4();

    // Create candidate entry
    const candidate = new Candidate({
      name,
      email,
      skills,
      experience,
      employerEmail,
      roomId,
      createdBy: recruiterEmail,
      status: 'pending'
    });

    await candidate.save();
    console.log('✅ Candidate saved:', candidate._id);

    // Create chat room
    const chatRoom = new ChatRoom({
      roomId,
      candidateId: candidate._id,
      participants: {
        recruiter: {
          email: recruiterEmail,
          name: 'Recruiter',
          joinedAt: new Date()
        },
        candidate: {
          email,
          name,
          joinedAt: null
        },
        employer: {
          email: employerEmail,
          name: 'Employer',
          joinedAt: null
        }
      },
      messages: [],
      status: 'active'
    });

    await chatRoom.save();
    console.log('✅ Chat room created:', roomId);

    // Generate chat link
    const chatLink = `${process.env.CLIENT_URL}/chat/${roomId}`;

    // Send emails
    const emailResults = await Promise.allSettled([
      sendVerificationEmail(employerEmail, name, chatLink),
      sendCandidateNotification(email, name, chatLink)
    ]);

    console.log('📧 Email results:', emailResults);

    res.json({
      success: true,
      message: 'Verification initiated successfully',
      data: {
        candidateId: candidate._id,
        roomId,
        chatLink,
        emailStatus: {
          employer: emailResults[0].status === 'fulfilled' ? 'sent' : 'failed',
          candidate: emailResults[1].status === 'fulfilled' ? 'sent' : 'failed'
        }
      }
    });

  } catch (error) {
    console.error('❌ Submit error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit verification request',
      details: error.message 
    });
  }
});

// Get chat room details
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const chatRoom = await ChatRoom.findOne({ roomId })
      .populate('candidateId')
      .lean();

    if (!chatRoom) {
      return res.status(404).json({ 
        success: false, 
        error: 'Chat room not found' 
      });
    }

    res.json({
      success: true,
      data: chatRoom
    });

  } catch (error) {
    console.error('❌ Get room error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch chat room',
      details: error.message 
    });
  }
});

// Get all verifications (for recruiter dashboard)
router.get('/list', async (req, res) => {
  try {
    const { recruiterEmail } = req.query;

    const candidates = await Candidate.find({ 
      createdBy: recruiterEmail 
    })
    .sort({ createdAt: -1 })
    .lean();

    res.json({
      success: true,
      data: candidates
    });

  } catch (error) {
    console.error('❌ List error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch verifications',
      details: error.message 
    });
  }
});

module.exports = router;