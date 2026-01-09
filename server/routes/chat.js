const express = require('express');
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

    // Build comprehensive context from ALL profile data
    let context = 'You are an expert career advisor and developer profile analyst. ';
    context += 'Provide detailed, actionable advice based on the complete developer profile data below.\n\n';
    
    let hasData = false;
    
    // Add ALL available profile data to context
    if (profileData) {
      // Resume data context
      if (profileData.resumeData) {
        hasData = true;
        context += `=== RESUME INFORMATION ===\n`;
        if (profileData.resumeData.name && profileData.resumeData.name !== 'Name not found') {
          context += `Name: ${profileData.resumeData.name}\n`;
        }
        if (profileData.resumeData.email && profileData.resumeData.email !== 'Email not found') {
          context += `Email: ${profileData.resumeData.email}\n`;
        }
        if (profileData.resumeData.phone && profileData.resumeData.phone !== 'Phone not found') {
          context += `Phone: ${profileData.resumeData.phone}\n`;
        }
        if (profileData.resumeData.skills && profileData.resumeData.skills !== 'Skills not found') {
          context += `Skills: ${profileData.resumeData.skills}\n`;
        }
        if (profileData.resumeData.experience && profileData.resumeData.experience !== 'Experience section not clearly identified') {
          context += `Experience: ${profileData.resumeData.experience}\n`;
        }
        if (profileData.resumeData.education && profileData.resumeData.education !== 'Degree not found') {
          context += `Education: ${profileData.resumeData.education}\n`;
        }
        if (profileData.resumeData.fullText && profileData.resumeData.fullText.length > 50) {
          context += `Resume Summary: "${profileData.resumeData.fullText.substring(0, 500)}..."\n`;
        }
        context += '\n';
      }

      // GitHub data context
      if (profileData.githubData) {
        hasData = true;
        context += `=== GITHUB PROFILE ===\n`;
        context += `Username: @${profileData.githubData.username}\n`;
        if (profileData.githubData.name) {
          context += `Name: ${profileData.githubData.name}\n`;
        }
        context += `Public Repositories: ${profileData.githubData.publicRepos}\n`;
        context += `Total Stars Earned: ${profileData.githubData.totalStars}\n`;
        context += `Followers: ${profileData.githubData.followers}\n`;
        
        if (profileData.githubData.topLanguages) {
          context += `Primary Languages: ${profileData.githubData.topLanguages}\n`;
        }
        
        if (profileData.githubData.topRepos && profileData.githubData.topRepos.length > 0) {
          context += `Top Repositories:\n`;
          profileData.githubData.topRepos.forEach((repo, idx) => {
            context += `  ${idx + 1}. ${repo.name} (⭐ ${repo.stars}${repo.language ? `, ${repo.language}` : ''})\n`;
          });
        }
        context += '\n';
      }
      
      // LeetCode data context
      if (profileData.leetcodeData) {
        hasData = true;
        context += `=== LEETCODE STATISTICS ===\n`;
        context += `Username: ${profileData.leetcodeData.username}\n`;
        context += `Total Problems Solved: ${profileData.leetcodeData.totalSolved}\n`;
        context += `  - Easy: ${profileData.leetcodeData.easySolved}\n`;
        context += `  - Medium: ${profileData.leetcodeData.mediumSolved}\n`;
        context += `  - Hard: ${profileData.leetcodeData.hardSolved}\n`;
        if (profileData.leetcodeData.ranking && profileData.leetcodeData.ranking !== 'N/A') {
          context += `Global Ranking: ${profileData.leetcodeData.ranking}\n`;
        }
        
        // Calculate percentages
        if (profileData.leetcodeData.totalSolved > 0) {
          const easyPct = Math.round((profileData.leetcodeData.easySolved / profileData.leetcodeData.totalSolved) * 100);
          const medPct = Math.round((profileData.leetcodeData.mediumSolved / profileData.leetcodeData.totalSolved) * 100);
          const hardPct = Math.round((profileData.leetcodeData.hardSolved / profileData.leetcodeData.totalSolved) * 100);
          context += `Problem Distribution: ${easyPct}% Easy, ${medPct}% Medium, ${hardPct}% Hard\n`;
        }
        context += '\n';
      }
      
      // HackerRank data context
      if (profileData.hackerrankData) {
        hasData = true;
        context += `=== HACKERRANK PROFILE ===\n`;
        context += `Username: ${profileData.hackerrankData.username}\n`;
        context += `Challenges Solved: ${profileData.hackerrankData.challengesSolved}\n`;
        context += `Total Badges: ${profileData.hackerrankData.totalBadges}\n`;
        context += `Stars: ${profileData.hackerrankData.totalStars}\n`;
        if (profileData.hackerrankData.badges && profileData.hackerrankData.badges.length > 0) {
          context += `Recent Badges: ${profileData.hackerrankData.badges.join(', ')}\n`;
        }
        context += '\n';
      }
      
      // AI Analysis context
      if (profileData.aiAnalysis) {
        hasData = true;
        context += `=== AI PROFILE ANALYSIS ===\n`;
        context += `Overall Score: ${profileData.aiAnalysis.overallScore}/100\n`;
        
        if (profileData.aiAnalysis.scoreBreakdown) {
          context += `Score Breakdown:\n`;
          context += `  - Resume: ${profileData.aiAnalysis.scoreBreakdown.resume}/100\n`;
          context += `  - GitHub: ${profileData.aiAnalysis.scoreBreakdown.github}/100\n`;
          context += `  - LeetCode: ${profileData.aiAnalysis.scoreBreakdown.leetcode}/100\n`;
          context += `  - HackerRank: ${profileData.aiAnalysis.scoreBreakdown.hackerrank}/100\n`;
        }
        
        if (profileData.aiAnalysis.summary) {
          context += `Summary: ${profileData.aiAnalysis.summary}\n`;
        }
        
        if (profileData.aiAnalysis.technicalStrengths && profileData.aiAnalysis.technicalStrengths.length > 0) {
          context += `Technical Strengths:\n`;
          profileData.aiAnalysis.technicalStrengths.forEach((strength, idx) => {
            context += `  ${idx + 1}. ${strength}\n`;
          });
        }
        
        if (profileData.aiAnalysis.improvementAreas && profileData.aiAnalysis.improvementAreas.length > 0) {
          context += `Areas for Improvement:\n`;
          profileData.aiAnalysis.improvementAreas.forEach((area, idx) => {
            const areaText = typeof area === 'string' ? area : area.tip || area.area;
            const priority = typeof area === 'object' ? area.priority : '';
            context += `  ${idx + 1}. ${areaText}${priority ? ` (${priority} Priority)` : ''}\n`;
          });
        }
        
        if (profileData.aiAnalysis.careerRecommendations && profileData.aiAnalysis.careerRecommendations.length > 0) {
          context += `Career Recommendations:\n`;
          profileData.aiAnalysis.careerRecommendations.forEach((rec, idx) => {
            context += `  ${idx + 1}. ${rec}\n`;
          });
        }
        context += '\n';
      }
    }

    if (!hasData) {
      context += 'NOTE: No profile data has been uploaded yet. Encourage the user to upload their resume and connect their GitHub, LeetCode, or HackerRank profiles for personalized advice.\n\n';
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // Enhanced instructions based on question type
    let specificInstructions = '';
    const lowerMsg = lastUserMessage.toLowerCase();
    
    if (lowerMsg.includes('resume') || lowerMsg.includes('cv')) {
      specificInstructions = 'Focus on resume content, formatting, skills presentation, and actionable improvements. ';
    } else if (lowerMsg.includes('github') || lowerMsg.includes('repository') || lowerMsg.includes('repo')) {
      specificInstructions = 'Focus on GitHub activity, project quality, contributions, and repository recommendations. ';
    } else if (lowerMsg.includes('leetcode') || lowerMsg.includes('problem') || lowerMsg.includes('algorithm')) {
      specificInstructions = 'Focus on coding practice, algorithm skills, problem-solving patterns, and competitive programming. ';
    } else if (lowerMsg.includes('hackerrank')) {
      specificInstructions = 'Focus on HackerRank achievements, challenges, and skill certification. ';
    } else if (lowerMsg.includes('skill') || lowerMsg.includes('technology') || lowerMsg.includes('tech stack')) {
      specificInstructions = 'Focus on technical skills analysis, learning paths, and technology recommendations. ';
    } else if (lowerMsg.includes('career') || lowerMsg.includes('job') || lowerMsg.includes('role')) {
      specificInstructions = 'Focus on career guidance, job search strategies, role suitability, and professional development. ';
    } else if (lowerMsg.includes('improve') || lowerMsg.includes('better') || lowerMsg.includes('weakness')) {
      specificInstructions = 'Focus on specific, actionable improvements and balanced assessment. ';
    } else if (lowerMsg.includes('strength') || lowerMsg.includes('good') || lowerMsg.includes('best')) {
      specificInstructions = 'Highlight strengths while providing constructive guidance on leveraging them. ';
    } else if (lowerMsg.includes('score') || lowerMsg.includes('rating')) {
      specificInstructions = 'Explain the scoring system, what it means, and how to improve it. ';
    }

    specificInstructions += 'Be specific, actionable, and encouraging. Use bullet points for clarity when listing multiple items. ';

    // Build conversation history
    const conversation = messages
      .slice(-6) // Use last 6 messages for context
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
    
    const prompt = `${context}${specificInstructions}\n\nCONVERSATION HISTORY:\n${conversation}\n\nAssistant:`;

    // Call Gemini API
    const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            topP: 0.85,
            topK: 40
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                  'I apologize, but I could not generate a response at the moment. Please try rephrasing your question or try again.';

    res.json({ 
      success: true, 
      message: reply.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Chat API Error:', err.response?.data || err.message);
    
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