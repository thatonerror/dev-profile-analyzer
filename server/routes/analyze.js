const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/', async (req, res) => {
  try {
    const { resumeData, githubData, leetcodeData } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI service not configured',
        summary: 'Full analysis requires Gemini API key',
        technicalStrengths: ['Setup Gemini API for complete analysis'],
        improvementTips: ['Add GEMINI_API_KEY to .env file']
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an expert technical recruiter analyzing developer profiles.

RESUME:
${JSON.stringify(resumeData, null, 2)}

GITHUB (${githubData?.username || 'N/A'}):
- Repos: ${githubData?.publicRepos || 0}
- Stars: ${githubData?.totalStars || 0}
- Languages: ${githubData?.topLanguages?.map(l => l.language).join(', ') || 'N/A'}

LEETCODE (${leetcodeData?.username || 'N/A'}):
- Total: ${leetcodeData?.totalSolved || 0}
- Easy: ${leetcodeData?.easySolved || 0} | Medium: ${leetcodeData?.mediumSolved || 0} | Hard: ${leetcodeData?.hardSolved || 0}

Generate JSON response:
{
  "summary": "Two sentence professional summary (max 100 words)",
  "technicalStrengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "improvementTips": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"]
}

Focus on: MERN stack, full-stack skills, problem-solving ability, project quality.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let analysis;
    
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback analysis
      analysis = {
        summary: "Strong developer profile with good project presence. Needs more hard LeetCode problems and detailed resume projects.",
        technicalStrengths: [
          "Active GitHub presence with multiple repositories",
          "Basic competitive programming exposure", 
          "Resume shows relevant technical skills"
        ],
        improvementTips: [
          "Solve 50+ hard LeetCode problems for top companies",
          "Add GitHub repo links to resume projects section",
          "Quantify achievements (e.g., 'Reduced load time by 40%')"
        ]
      };
    }

    res.json(analysis);
    
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    
    // Graceful fallback
    res.json({
      summary: "Analysis temporarily unavailable. Your profile shows good GitHub activity and coding practice.",
      technicalStrengths: ["Active developer with GitHub presence", "LeetCode practice established"],
      improvementTips: ["Solve more medium/hard problems", "Deploy projects to showcase live demos", "Add quantifiable achievements"]
    });
  }
});

module.exports = router;
