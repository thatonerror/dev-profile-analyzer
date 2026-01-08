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

    // Keep original text for better extraction
    const originalText = text;
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const fullText = originalText.substring(0, 5000);

    // Extract structured data
    const emailMatch = normalizedText.match(/[\w\.\-]+@[\w\.\-]+\.\w{2,}/i);
    const phoneMatch = normalizedText.match(/(?:\+?91[-\s]?)?[6-9]\d{9}|\(\d{3}\)\s?\d{3}-\d{4}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    // Enhanced name extraction
    let nameMatch = extractName(originalText);

    const parsedData = {
      name: nameMatch,
      email: emailMatch ? emailMatch[0] : 'Email not found',
      phone: phoneMatch ? phoneMatch[0] : 'Phone not found',
      skills: extractSkills(normalizedText),
      experience: extractExperience(originalText),
      education: extractEducation(originalText),
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

function extractName(text) {
  // Method 1: First line (most common in resumes)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const firstLine = lines[0]?.trim();
  
  if (firstLine && firstLine.length > 2 && firstLine.length < 50) {
    // Check if it's all caps (common resume format)
    if (/^[A-Z\s]+$/.test(firstLine) && firstLine.split(' ').length >= 2) {
      console.log('✅ Name extracted (First Line - All Caps):', firstLine);
      return firstLine;
    }
    // Check if it's title case
    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)+$/.test(firstLine)) {
      console.log('✅ Name extracted (First Line - Title Case):', firstLine);
      return firstLine;
    }
  }
  
  // Method 2: Look for "NAME:" pattern
  const namePatterns = [
    /(?:name|NAME)[:;\s-]+([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/,
    /^([A-Z][A-Z\s]{5,40})$/m
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      console.log('✅ Name extracted (Pattern Match):', match[1].trim());
      return match[1].trim();
    }
  }
  
  console.log('⚠️ Name not found');
  return 'Name not found';
}

function extractSkills(text) {
  // More precise skill matching with word boundaries
  const skillsMap = {
    // Programming Languages
    'Python': /\bPython\b/i,
    'JavaScript': /\bJavaScript\b|\bJS\b/i,
    'TypeScript': /\bTypeScript\b|\bTS\b/i,
    'Java': /\bJava\b(?!Script)/i, // Exclude JavaScript
    'C\\+\\+': /\bC\+\+\b/i,
    'C#': /\bC#\b/i,
    'C': /\bC\b(?![\+#])/i, // Exclude C++ and C#
    'Ruby': /\bRuby\b/i,
    'PHP': /\bPHP\b/i,
    'Swift': /\bSwift\b/i,
    'Kotlin': /\bKotlin\b/i,
    'Go': /\bGolang\b|\bGo\b(?=\s|,|\.|\)|$)/i, // More specific Go matching
    'Rust': /\bRust\b/i,
    'Scala': /\bScala\b/i,
    
    // Frontend
    'React': /\bReact(\.js)?\b/i,
    'Angular': /\bAngular\b/i,
    'Vue': /\bVue(\.js)?\b/i,
    'Next.js': /\bNext(\.js)?\b/i,
    'HTML': /\bHTML5?\b/i,
    'CSS': /\bCSS3?\b/i,
    'Tailwind': /\bTailwind\b/i,
    'Bootstrap': /\bBootstrap\b/i,
    
    // Backend
    'Node.js': /\bNode(\.js)?\b/i,
    'Express': /\bExpress(\.js)?\b/i,
    'Django': /\bDjango\b/i,
    'Flask': /\bFlask\b/i,
    'Spring': /\bSpring\b/i,
    'ASP.NET': /\bASP\.NET\b/i,
    
    // Databases
    'MongoDB': /\bMongoDB\b/i,
    'PostgreSQL': /\bPostgreSQL\b|\bPostgres\b/i,
    'MySQL': /\bMySQL\b/i,
    'Redis': /\bRedis\b/i,
    'SQLite': /\bSQLite\b/i,
    'SQL': /\bSQL\b(?!ite)/i,
    
    // DevOps & Cloud
    'Docker': /\bDocker\b/i,
    'Kubernetes': /\bKubernetes\b|\bK8s\b/i,
    'AWS': /\bAWS\b|\bAmazon Web Services\b/i,
    'Azure': /\bAzure\b/i,
    'GCP': /\bGCP\b|\bGoogle Cloud\b/i,
    'Git': /\bGit\b(?!Hub|Lab)/i,
    'GitHub': /\bGitHub\b/i,
    'Jenkins': /\bJenkins\b/i,
    'CI/CD': /\bCI\/CD\b/i,
    
    // Other
    'REST API': /\bREST\b|\bRESTful\b/i,
    'GraphQL': /\bGraphQL\b/i,
    'Microservices': /\bMicroservices\b/i,
    'Agile': /\bAgile\b/i,
    'Scrum': /\bScrum\b/i,
    'Machine Learning': /\bMachine Learning\b|\bML\b/i,
    'Deep Learning': /\bDeep Learning\b/i,
    'TensorFlow': /\bTensorFlow\b/i,
    'PyTorch': /\bPyTorch\b/i
  };
  
  const foundSkills = [];
  
  for (const [skill, pattern] of Object.entries(skillsMap)) {
    if (pattern.test(text)) {
      foundSkills.push(skill);
    }
  }
  
  console.log('🔧 Skills found:', foundSkills);
  return foundSkills.length > 0 ? foundSkills.join(', ') : 'Skills not found';
}

function extractExperience(text) {
  // Look for work experience section
  const expPatterns = [
    /(?:work\s+)?experience[\s\S]{0,500}(?:20\d{2}|present)/i,
    /(?:employment|professional)\s+(?:history|experience)[\s\S]{0,500}(?:20\d{2}|present)/i
  ];
  
  for (const pattern of expPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Count years mentioned
      const years = match[0].match(/20\d{2}/g);
      if (years && years.length > 0) {
        return `Found ${Math.floor(years.length / 2)} position(s)`;
      }
    }
  }
  
  return 'Experience section not clearly identified';
}

function extractEducation(text) {
  const degreePatterns = [
    /B\.?Tech|Bachelor|B\.?E\.|B\.?Sc/i,
    /M\.?Tech|Master|M\.?E\.|M\.?Sc|MBA/i,
    /Ph\.?D|Doctorate/i
  ];
  
  for (const pattern of degreePatterns) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      return match[0];
    }
  }
  
  return 'Degree not found';
}

module.exports = { parseResume };