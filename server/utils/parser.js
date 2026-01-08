const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function parseResume(filePath) {
  console.log('🔍 parseResume called with:', filePath);
  
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found at path: ' + filePath);
  }
  
  const fileStats = fs.statSync(filePath);
  console.log('📊 File stats:', { size: fileStats.size, exists: true });
  
  let text = '';
  const ext = path.extname(filePath).toLowerCase();
  console.log('📝 File extension:', ext);
  
  try {
    const dataBuffer = fs.readFileSync(filePath);
    console.log('📦 Buffer loaded, size:', dataBuffer.length, 'bytes');
    
    if (ext === '.pdf') {
      console.log('📄 Processing as PDF...');
      const data = await pdfParse(dataBuffer);
      text = data.text;
      console.log('✅ PDF parsed, text length:', text.length);
    } else if (ext === '.docx') {
      console.log('📝 Processing as DOCX...');
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      text = result.value;
      console.log('✅ DOCX parsed, text length:', text.length);
    } else {
      throw new Error('Unsupported file type: ' + ext);
    }

    if (!text || text.trim().length < 10) {
      console.warn('⚠️ Very short text extracted');
      text = 'Unable to extract sufficient text from file';
    }

    // Keep original text for better name extraction
    const originalText = text;
    text = text.replace(/\s+/g, ' ').trim();
    const fullText = text.substring(0, 5000);

    // Extract structured data
    const emailMatch = text.match(/[\w\.\-]+@[\w\.\-]+\.\w{2,}/i);
    const phoneMatch = text.match(/(?:\+?91[-\s]?)?[6-9]\d{9}|\(\d{3}\)\s?\d{3}-\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    // IMPROVED NAME EXTRACTION
    let nameMatch = 'Name not found';
    
    // Method 1: Try to find name at the very beginning (first line)
    const firstLine = originalText.split('\n')[0].trim();
    if (firstLine.length > 2 && firstLine.length < 50 && /^[A-Z\s]+$/.test(firstLine)) {
      nameMatch = firstLine;
      console.log('✅ Name extracted (Method 1 - First Line):', nameMatch);
    } else {
      // Method 2: Look for patterns like "NAME: John Doe" or just capitalized words
      const namePatterns = [
        /(?:name|NAME)[:;\s-]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/,
        /^([A-Z][A-Z\s]{2,40})$/m,
        /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/m
      ];
      
      for (const pattern of namePatterns) {
        const match = originalText.match(pattern);
        if (match) {
          nameMatch = match[1].trim();
          console.log('✅ Name extracted (Method 2 - Pattern Match):', nameMatch);
          break;
        }
      }
    }

    const parsedData = {
      name: nameMatch,
      email: emailMatch ? emailMatch[0] : 'Email not found',
      phone: phoneMatch ? phoneMatch[0] : 'Phone not found',
      skills: extractSkills(text),
      fullText: fullText.substring(0, 2000),
      success: true
    };

    console.log('✅ Final parsed data:', parsedData);
    
    return parsedData;
    
  } catch (error) {
    console.error('❌ Parse error:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  } finally {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ File deleted:', filePath);
      }
    } catch (cleanupError) {
      console.error('⚠️ Cleanup failed:', cleanupError.message);
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

// ✅ CORRECT EXPORT - Use module.exports for Node.js
module.exports = { parseResume };