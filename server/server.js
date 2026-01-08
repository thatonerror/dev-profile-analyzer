const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

dotenv.config();
const { parseResume } = require('./utils/parser');
console.log('🧪 Testing parseResume import:', typeof parseResume);
if (typeof parseResume !== 'function') {
  console.error('❌ CRITICAL: parseResume is not imported correctly!');
  process.exit(1);
}
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Create uploads folder FIRST
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads folder');
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// ✅ Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📂 Saving to:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    console.log('💾 Filename:', uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    console.log('🔍 Checking file:', file.originalname, file.mimetype);
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
    endpoints: {
      github: '/api/github/:username',
      leetcode: '/api/leetcode/:username', 
      hackerrank: '/api/hackerrank/:username',
      upload: '/api/upload (POST multipart)',
      analyze: '/api/analyze (POST)'
    }
  });
});

// API Routes
app.use('/api/github', require('./routes/github'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/hackerrank', require('./routes/hackerrank'));

// ✅ IMPORTANT: Upload route with multer middleware HERE
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
  console.log('✅ All APIs ready (GitHub/LeetCode/HR/CV)');
  console.log('='.repeat(60));
});

module.exports = app;