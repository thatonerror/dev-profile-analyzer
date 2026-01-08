const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

async function parseResume(filePath, mimeType) {
  let text = '';
  
  try {
    // Parse PDF
    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } 
    // Parse DOCX
    else if (mimeType.includes('word') || filePath.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    }

    // Clean and normalize text
    text = text.replace(/\s+/g, ' ').trim();

    // Extract structured data
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
    const phoneRegex = /(\+?91[-.\s]?)?[6-9]\d{9}/; // India-focused
    
    const nameLines = text.split('\n').slice(0, 3).join(' ').match(/^[A-Z][a-z]+ [A-Z][a-z]+/);
    const skillsRegex = /(?:skills?|technologies?|tech stack):?\s*([\s\S]*?)(?=\n\n|$)/i;
    
    return {
      name: nameLines ? nameLines[0] : 'Name not found',
      email: text.match(emailRegex)?.[0] || 'Email not found',
      phone: text.match(phoneRegex)?.[0] || 'Phone not found',
      skills: text.match(skillsRegex)?.[1]?.replace(/[\n\r]/g, ', ') || 'Skills not extracted',
      fullText: text.substring(0, 4000), // Limit for AI
      rawLength: text.length
    };
    
  } catch (error) {
    console.error('Parse Error:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  } finally {
    // Cleanup
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = { parseResume };
