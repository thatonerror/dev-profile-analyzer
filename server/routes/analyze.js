const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { resumeData, githubData, leetcodeData, hackerrankData } = req.body;

    // ---------- SCORE CALCULATION ----------
    let resumeScore = 0;
    let githubScore = 0;
    let leetcodeScore = 0;
    let hackerrankScore = 0;

    // Resume scoring
    if (resumeData?.skills && resumeData.skills.length > 0) resumeScore += 40;
    if (resumeData?.experience && !resumeData.experience.includes('not')) resumeScore += 30;
    if (resumeData?.education && !resumeData.education.includes('not')) resumeScore += 30;

    // GitHub scoring
    if (githubData) {
      githubScore += Math.min(githubData.publicRepos * 5, 40);
      githubScore += Math.min(githubData.totalStars * 2, 40);
      githubScore += Math.min(githubData.followers * 2, 20);
    }

    // LeetCode scoring
    if (leetcodeData) {
      leetcodeScore += Math.min(leetcodeData.totalSolved, 100);
    }

    // HackerRank scoring
    if (hackerrankData) {
      hackerrankScore += Math.min(hackerrankData.totalBadges * 10, 100);
    }

    resumeScore = Math.min(resumeScore, 100);
    githubScore = Math.min(githubScore, 100);
    leetcodeScore = Math.min(leetcodeScore, 100);
    hackerrankScore = Math.min(hackerrankScore, 100);

    const overallScore = Math.round(
      (resumeScore + githubScore + leetcodeScore + hackerrankScore) / 4
    );

    // ---------- RESPONSE ----------
    const analysis = {
      overallScore,

      scoreBreakdown: {
        resume: resumeScore,
        github: githubScore,
        leetcode: leetcodeScore,
        hackerrank: hackerrankScore
      },

      profileStrength: {
        resume: {
          score: resumeScore,
          status: resumeScore >= 70 ? 'Strong' : resumeScore >= 40 ? 'Moderate' : 'Weak',
          details: 'Based on skills, education, and experience'
        },
        github: githubData && {
          score: githubScore,
          status: githubScore >= 70 ? 'Strong' : githubScore >= 40 ? 'Moderate' : 'Weak',
          details: `${githubData.publicRepos} repos, ${githubData.totalStars} stars`
        },
        leetcode: leetcodeData && {
          score: leetcodeScore,
          status: leetcodeScore >= 70 ? 'Strong' : leetcodeScore >= 40 ? 'Moderate' : 'Weak',
          details: `${leetcodeData.totalSolved} problems solved`
        },
        hackerrank: hackerrankData && {
          score: hackerrankScore,
          status: hackerrankScore >= 70 ? 'Strong' : hackerrankScore >= 40 ? 'Moderate' : 'Weak',
          details: `${hackerrankData.totalBadges || 0} badges earned`
        }
      },

      summary: `${resumeData?.name || 'Candidate'} has a solid foundation in ${
        resumeData?.skills || 'software development'
      }. The overall profile shows ${
        overallScore >= 70 ? 'strong' : overallScore >= 40 ? 'moderate' : 'early-stage'
      } readiness for technical roles.`,

      technicalStrengths: [
        resumeData?.skills && `Core skills: ${resumeData.skills}`,
        githubData && `GitHub projects: ${githubData.publicRepos}`,
        leetcodeData && `LeetCode solved: ${leetcodeData.totalSolved}`,
        hackerrankData && `HackerRank badges: ${hackerrankData.totalBadges}`
      ].filter(Boolean),

      improvementAreas: [
        githubScore < 50 && { area: 'GitHub', priority: 'High', tip: 'Build and deploy more real-world projects' },
        leetcodeScore < 50 && { area: 'DSA', priority: 'Medium', tip: 'Solve more medium and hard problems' },
        resumeScore < 70 && { area: 'Resume', priority: 'Medium', tip: 'Add quantified impact and metrics' }
      ].filter(Boolean),

      careerRecommendations: [
        'Apply for frontend / full-stack developer roles',
        'Build 2–3 production-grade projects',
        'Contribute to open source'
      ]
    };

    res.json(analysis);

  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

module.exports = router;
