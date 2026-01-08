const express = require('express');
const { parseResume } = require('../utils/parser');
const router = express.Router();

// NOTE: multer middleware is applied in server.js
router.post('/', async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('📁 File:', req.file);
    
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ 
        error: 'No file uploaded',
        details: 'Please select a PDF or DOCX file'
      });
    }

    console.log('✅ File uploaded:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
    
    // Parse the resume
    const parsedData = await parseResume(req.file.path);
    
    res.json({
      success: true,
      filename: req.file.originalname,
      parsedData
    });
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    res.status(500).json({ 
      error: 'Failed to process resume',
      details: error.message 
    });
  }
});

module.exports = router;