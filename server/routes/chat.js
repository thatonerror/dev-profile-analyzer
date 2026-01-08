const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { messages, profileData } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No messages provided or invalid format' 
      });
    }

    let context = 'You are a helpful career advisor. Provide guidance based on the developer profile.\n\n';
    
    // Add profile context if available
    if (profileData) {
      if (profileData.githubData) {
        context += `GitHub Profile:\n`;
        context += `- Username: ${profileData.githubData.username || 'N/A'}\n`;
        if (profileData.githubData.repos) {
          context += `- Public Repos: ${profileData.githubData.repos.length || 0}\n`;
        }
      }
      
      if (profileData.leetcodeData) {
        context += `LeetCode Stats:\n`;
        context += `- Total Solved: ${profileData.leetcodeData.totalSolved || 0}\n`;
      }
      
      if (profileData.hackerrankData) {
        context += `HackerRank Stats:\n`;
        context += `- Badges: ${profileData.hackerrankData.badges?.length || 0}\n`;
      }
      
      if (profileData.resumeData) {
        context += `Resume Analysis:\n`;
        if (profileData.resumeData.skills) {
          context += `- Skills: ${profileData.resumeData.skills.join(', ') || 'N/A'}\n`;
        }
      }
      
      context += '\n';
    }

    // Construct conversation
    const conversation = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
    
    const prompt = `${context}${conversation}\n\nAssistant:`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                  'I apologize, but I could not generate a response at the moment.';

    res.json({ 
      success: true, 
      message: reply.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Chat API Error:', err.response?.data || err.message);
    
    // More detailed error response
    const errorMessage = err.response?.data?.error?.message || 
                         err.message || 
                         'Failed to generate response';
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;