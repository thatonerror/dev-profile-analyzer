const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

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

// ============================================
// GOOGLE OAUTH CONFIGURATION
// ============================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        console.log('✅ Google auth successful for:', profile.emails[0].value);
        const user = {
          id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0].value,
          provider: 'google'
        };
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  
  console.log('🔐 Google OAuth configured');
} else {
  console.warn('⚠️  Google OAuth not configured (missing CLIENT_ID or CLIENT_SECRET)');
}

// JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ============================================
// MIDDLEWARE
// ============================================
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
app.use(cookieParser());

// Session middleware for Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Trust proxy
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// ============================================
// MULTER CONFIGURATION
// ============================================
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

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dev Profile Analyzer API ✅',
    geminiKey: process.env.GEMINI_API_KEY ? `Set (${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : '❌ Missing',
    googleAuth: process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Not configured',
    jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
    endpoints: {
      auth: {
        login: '/api/auth/google',
        callback: '/api/auth/google/callback',
        me: '/api/auth/me',
        logout: '/api/auth/logout'
      },
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
// AUTH ROUTES - FIXED VERSION
// ============================================

// Initiate Google OAuth
app.get('/api/auth/google', (req, res, next) => {
  console.log('🔵 Initiating Google OAuth...');
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// Google OAuth callback - WITH EXTENSIVE DEBUGGING
app.get('/api/auth/google/callback',
  (req, res, next) => {
    console.log('🔵 Google callback received');
    console.log('📍 Full callback URL:', req.url);
    console.log('📍 Query params:', req.query);
    
    passport.authenticate('google', { 
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}?error=google_auth_failed`,
      session: false 
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('✅ Authentication successful');
      console.log('👤 User data:', req.user);

      if (!req.user) {
        console.error('❌ No user data received from Google');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?error=no_user_data`);
      }

      // Validate JWT_SECRET exists
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET not configured!');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?error=jwt_secret_missing`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email,
          name: req.user.name,
          picture: req.user.picture
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('🔑 Token generated:', token.substring(0, 20) + '...');

      // Redirect to frontend with token
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const redirectUrl = `${clientUrl}/auth/callback?token=${token}`;
      
      console.log('🔄 Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Auth callback error:', error);
      console.error('Stack:', error.stack);
      
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}?error=token_generation_failed&message=${encodeURIComponent(error.message)}`);
    }
  }
);

// Get current user (protected route)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  console.log('👤 /auth/me called for user:', req.user.email);
  res.json({ 
    success: true, 
    user: req.user 
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  console.log('👋 User logged out');
  res.json({ success: true, message: 'Logged out successfully' });
});

// ============================================
// CHAT ROUTE
// ============================================
app.post('/api/chat', async (req, res) => {
  console.log('🎯 Chat endpoint hit');
  
  try {
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

    const modelConfigs = [
      {
        name: 'gemini-1.5-flash',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
      },
      {
        name: 'gemini-pro',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
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
          continue;
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

    throw new Error(`All models failed. Last error: ${lastError}`);

  } catch (err) {
    console.error('🚨 Chat Error:', err.message);
    
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

// ============================================
// ERROR HANDLERS
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

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

// ============================================
// START SERVER
// ============================================
const server = app.listen(PORT, () => {
  console.clear();
  console.log('='.repeat(60));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📱 Client: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`📁 Uploads: ${uploadsDir}`);
  console.log(`🔑 Gemini: ${process.env.GEMINI_API_KEY ? '✅' : '❌'}`);
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅' : '❌'}`);
  console.log(`🔒 JWT Secret: ${process.env.JWT_SECRET ? '✅' : '❌'}`);
  console.log('='.repeat(60));
});

module.exports = app;

// 
/*const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();
const { parseResume } = require('./utils/parser');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ============================================
// MONGODB CONNECTION
// ============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dev-profile-analyzer', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// SOCKET.IO SETUP
// ============================================
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket handlers
require('./sockets/chatHandler')(io);
console.log('✅ Socket.IO initialized');

// Make io accessible to routes
app.set('io', io);

// Create uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads folder');
}

// ============================================
// GOOGLE OAUTH CONFIGURATION
// ============================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        console.log('✅ Google auth successful for:', profile.emails[0].value);
        const user = {
          id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0].value,
          provider: 'google'
        };
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  
  console.log('🔐 Google OAuth configured');
} else {
  console.warn('⚠️  Google OAuth not configured');
}

// JWT Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// ============================================
// MULTER CONFIGURATION
// ============================================
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

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dev Profile Analyzer API ✅',
    features: {
      profileAnalysis: '✅',
      googleAuth: process.env.GOOGLE_CLIENT_ID ? '✅' : '❌',
      aiChat: process.env.GEMINI_API_KEY ? '✅' : '❌',
      backgroundVerification: '✅',
      realTimeChat: '✅'
    },
    endpoints: {
      auth: '/api/auth/*',
      verification: '/api/verification/*',
      profiles: '/api/github|leetcode|hackerrank/:username',
      upload: '/api/upload',
      analyze: '/api/analyze',
      chat: '/api/chat'
    }
  });
});

// ============================================
// AUTH ROUTES
// ============================================
app.get('/api/auth/google', (req, res, next) => {
  console.log('🔵 Initiating Google OAuth...');
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

app.get('/api/auth/google/callback',
  (req, res, next) => {
    console.log('🔵 Google callback received');
    passport.authenticate('google', { 
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}?error=google_auth_failed`,
      session: false 
    })(req, res, next);
  },
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?error=no_user_data`);
      }

      const token = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email,
          name: req.user.name,
          picture: req.user.picture
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ Auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?error=token_generation_failed`);
    }
  }
);

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ============================================
// EXISTING ROUTES
// ============================================
app.use('/api/github', require('./routes/github'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/hackerrank', require('./routes/hackerrank'));
app.use('/api/upload', upload.single('resume'), require('./routes/upload'));
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/chat', require('./routes/chat'));

// ============================================
// NEW VERIFICATION ROUTES
// ============================================
app.use('/api/verification', require('./routes/verification'));

// ============================================
// ERROR HANDLERS
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

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

// ============================================
// START SERVER
// ============================================
httpServer.listen(PORT, () => {
  console.clear();
  console.log('='.repeat(60));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📱 Client: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅' : '❌'}`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? '✅' : '❌'}`);
  console.log(`⚡ Socket.IO: ✅`);
  console.log('='.repeat(60));
});

module.exports = { app, io }; */