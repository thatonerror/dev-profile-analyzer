const express = require('express');
const multer = require('multer');
const { parseResume } = require('../utils/parser');
const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.originalname.match(/\.(pdf|docx|doc)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files allowed!'), false);
    }
  }
});

// Upload and parse resume
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const parsedData = await parseResume(req.file.path, req.file.mimetype);
    
    res.json({
      success: true,
      filename: req.file.originalname,
      size: req.file.size,
      parsedData
    });
    
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ error: 'Failed to parse resume: ' + error.message });
  }
});

module.exports = router;
