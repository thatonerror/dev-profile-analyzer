const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function parseResume(filePath) {
  console.log('🔍 Parsing file:', filePath);
  
  // Verify file exists
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found: ' + filePath);
  }
  
  let text = '';
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    // Read file buffer
    const dataBuffer = fs.readFileSync(filePath);
    console.log('📦 File size:', dataBuffer.length, 'bytes');
    
    if (ext === '.pdf') {
      console.log('📄 Processing PDF...');
      const data = await pdfParse(dataBuffer);
      text = data.text;
      console.log('✅ PDF text extracted:', text.length, 'chars');
    } else if (ext === '.docx') {
      console.log('📝 Processing DOCX...');
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      text = result.value;
      console.log('✅ DOCX text extracted:', text.length, 'chars');
    } else {
      throw new Error('Unsupported file type: ' + ext);
    }

    // Validate text extraction
    if (!text || text.trim().length < 10) {
      console.warn('⚠️ Very short text extracted, file might be corrupted or empty');
    }

    // Clean text
    text = text.replace(/\s+/g, ' ').trim();
    const fullText = text.substring(0, 5000);
    console.log('✅ Final text length:', fullText.length);

    // Extract structured data with better patterns
    const emailMatch = text.match(/[\w\.\-]+@[\w\.\-]+\.\w{2,}/i);
    const phoneMatch = text.match(/(?:\+?91[-\s]?)?[6-9]\d{9}|\(\d{3}\)\s?\d{3}-\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    // Better name extraction
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let nameMatch = null;
    
    // Try first few lines for name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 3 && line.length < 50 && /^[A-Z][a-zA-Z\s]+$/.test(line)) {
        nameMatch = line;
        break;
      }
    }

    const parsedData = {
      name: nameMatch || 'Name not found',
      email: emailMatch ? emailMatch[0] : 'Email not found',
      phone: phoneMatch ? phoneMatch[0] : 'Phone not found',
      skills: extractSkills(text),
      fullText: fullText.substring(0, 2000),
      success: true
    };

    console.log('✅ Parsed data:', parsedData);
    
    return parsedData;
    
  } catch (error) {
    console.error('❌ Parse error:', error.message);
    throw new Error(`Parse failed: ${error.message}`);
  } finally {
    // Cleanup - delete file after processing
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Cleaned up file:', filePath);
      }
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError.message);
    }
  }
}

function extractSkills(text) {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'HTML', 'CSS', 'TypeScript', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Jenkins', 'CI/CD',
    'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
  ];
  
  const foundSkills = [];
  const textLower = text.toLowerCase();
  
  for (const skill of commonSkills) {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }
  
  return foundSkills.length > 0 ? foundSkills.join(', ') : 'Skills not found';
}

module.exports = { parseResume };