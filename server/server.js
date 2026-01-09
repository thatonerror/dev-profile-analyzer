const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

dotenv.config();
const { parseResume } = require('./utils/parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads folder');
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://dev-prof-analyzer-arvind.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for Render
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.originalname.match(/\.(pdf|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dev Profile Analyzer API ✅',
    geminiKey: process.env.GEMINI_API_KEY ? `Set (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : 'Missing',
    endpoints: {
      github: '/api/github/:username',
      leetcode: '/api/leetcode/:username', 
      hackerrank: '/api/hackerrank/:username',
      upload: '/api/upload (POST multipart)',
      analyze: '/api/analyze (POST)',
      chat: '/api/chat (POST)'
    }
  });
});

// ============================================
// CHAT ROUTE - WITH EXTENSIVE DEBUGGING
// ============================================
app.post('/api/chat', async (req, res) => {
  console.log('🎯 Chat endpoint hit');
  
  try {
    // Detailed API Key Check
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY environment variable not found!');
      return res.status(500).json({ 
        success: false, 
        error: 'Gemini API key not configured in environment variables.' 
      });
    }

    const apiKeyPrefix = process.env.GEMINI_API_KEY.substring(0, 10);
    console.log(`🔑 API Key found: ${apiKeyPrefix}...`);

    const { messages, profileData } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No messages provided' 
      });
    }

    console.log('✅ Messages:', messages.length);

    // Build simple context
    let context = 'You are a helpful career advisor for software developers. Provide clear, actionable advice.\n\n';
    
    if (profileData) {
      if (profileData.resumeData) {
        context += `Resume: ${profileData.resumeData.name}, Skills: ${profileData.resumeData.skills}\n`;
      }
      if (profileData.githubData) {
        context += `GitHub: ${profileData.githubData.username}, ${profileData.githubData.publicRepos} repos\n`;
      }
      if (profileData.leetcodeData) {
        context += `LeetCode: ${profileData.leetcodeData.totalSolved} solved\n`;
      }
      if (profileData.aiAnalysis) {
        context += `AI Score: ${profileData.aiAnalysis.overallScore}/100\n`;
      }
    }

    const lastMessage = messages[messages.length - 1].content;
    const prompt = `${context}\nUser Question: ${lastMessage}\n\nProvide a helpful response:`;

    console.log('📝 Prompt length:', prompt.length);

    // Try multiple model configurations
    const modelConfigs = [
      {
        name: 'gemini-pro',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
      },
      {
        name: 'gemini-1.5-flash',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
      },
      {
        name: 'gemini-1.5-pro',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
      }
    ];

    let lastError = null;
    
    for (const config of modelConfigs) {
      try {
        console.log(`🔄 Trying model: ${config.name}...`);
        
        const geminiResponse = await fetch(
          `${config.url}?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              }
            })
          }
        );

        console.log(`📡 Response status: ${geminiResponse.status}`);

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.log(`❌ ${config.name} failed:`, errorText);
          lastError = errorText;
          continue; // Try next model
        }

        const data = await geminiResponse.json();
        
        if (data.error) {
          console.log(`❌ ${config.name} API error:`, data.error);
          lastError = data.error.message;
          continue;
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (reply) {
          console.log(`✅ Success with ${config.name}!`);
          return res.json({ 
            success: true, 
            message: reply.trim(),
            model: config.name,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        console.log(`❌ ${config.name} exception:`, err.message);
        lastError = err.message;
        continue;
      }
    }

    // If all models failed
    throw new Error(`All models failed. Last error: ${lastError}`);

  } catch (err) {
    console.error('🚨 Chat Error:', err.message);
    console.error('🚨 Stack:', err.stack);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process chat request',
      details: err.message
    });
  }
});

// ============================================
// OTHER ROUTES
// ============================================
app.use('/api/github', require('./routes/github'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/hackerrank', require('./routes/hackerrank'));
app.use('/api/upload', upload.single('resume'), require('./routes/upload'));
app.use('/api/analyze', require('./routes/analyze'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('🚨 ERROR:', error.message);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (5MB max)' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: error.message });
});

const server = app.listen(PORT, () => {
  console.clear();
  console.log('='.repeat(60));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📱 Client: http://localhost:5173`);
  console.log(`📁 Uploads: ${uploadsDir}`);
  console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  if (process.env.GEMINI_API_KEY) {
    console.log(`   Preview: ${process.env.GEMINI_API_KEY.substring(0, 15)}...`);
  }
  console.log('✅ All APIs ready');
  console.log('='.repeat(60));
});

module.exports = app;