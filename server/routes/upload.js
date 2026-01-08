const express = require('express');
const path = require('path');
const router = express.Router();

// ✅ CORRECT IMPORT - destructure the function
const { parseResume } = require('../utils/parser');

// Test the import immediately
if (typeof parseResume !== 'function') {
  console.error('❌ parseResume is not a function! Check utils/parser.js export');
  process.exit(1);
} else {
  console.log('✅ parseResume imported successfully');
}

// Multer middleware is applied in server.js
router.post('/', async (req, res) => {
  console.log('📤 Upload endpoint hit');
  console.log('📁 Request file:', req.file);
  
  try {
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ 
        error: 'No file uploaded',
        success: false
      });
    }

    console.log('✅ File received:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    
    // Parse the resume
    console.log('🔄 Starting parse...');
    const parsedData = await parseResume(req.file.path);
    console.log('✅ Parse complete:', parsedData);
    
    res.json({
      success: true,
      filename: req.file.originalname,
      parsedData
    });
    
  } catch (error) {
    console.error('❌ Upload route error:', error);
    res.status(500).json({ 
      error: 'Failed to process resume',
      details: error.message,
      success: false
    });
  }
});

module.exports = router;