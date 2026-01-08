const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { resumeData, githubData, leetcodeData, hackerrankData } = req.body;
    
    console.log('🤖 AI Analysis started');
    console.log('📄 Resume:', resumeData?.name);
    console.log('💻 GitHub:', githubData?.username || 'Not provided');
    console.log('🧩 LeetCode:', leetcodeData?.username || 'Not provided');
    console.log('🏆 HackerRank:', hackerrankData?.username || 'Not provided');
    
    // Build analysis based on available data
    const hasProfiles = githubData || leetcodeData || hackerrankData;
    
    const analysis = {
      summary: hasProfiles 
        ? `${resumeData?.name || 'Candidate'} is a skilled developer with experience in ${resumeData?.skills || 'various technologies'}. ${githubData ? `Active on GitHub with ${githubData.publicRepos} repositories and ${githubData.totalStars} stars.` : ''} ${leetcodeData ? `Solved ${leetcodeData.totalSolved} LeetCode problems.` : ''} ${hackerrankData ? `Earned ${hackerrankData.totalBadges} badges on HackerRank.` : ''}`
        : `${resumeData?.name || 'Candidate'} has strong technical skills including ${resumeData?.skills || 'various technologies'}. Consider adding GitHub, LeetCode, and HackerRank profiles for a more comprehensive analysis.`,
      
      technicalStrengths: [
        resumeData?.skills && `Skilled in: ${resumeData.skills}`,
        githubData && `Strong GitHub presence with ${githubData.publicRepos} public repositories`,
        githubData && githubData.totalStars > 0 && `${githubData.totalStars} total stars across repositories`,
        leetcodeData && `Solved ${leetcodeData.totalSolved} coding problems on LeetCode`,
        leetcodeData && leetcodeData.hardSolved > 0 && `Completed ${leetcodeData.hardSolved} hard-level problems`,
        hackerrankData && `Earned ${hackerrankData.totalBadges} HackerRank badges`,
        githubData?.topLanguages?.length > 0 && `Top programming languages: ${githubData.topLanguages.slice(0, 3).map(l => l.language).join(', ')}`
      ].filter(Boolean),
      
      improvementTips: [
        !githubData && 'Create a GitHub profile to showcase your projects and contributions',
        githubData && githubData.publicRepos < 5 && 'Build more public projects to demonstrate your skills to potential employers',
        githubData && githubData.totalStars < 10 && 'Create projects that solve real problems to attract more stars',
        !leetcodeData && 'Start solving problems on LeetCode to improve algorithmic thinking',
        leetcodeData && leetcodeData.totalSolved < 50 && 'Aim to solve at least 100 problems across all difficulty levels',
        leetcodeData && leetcodeData.hardSolved < 10 && 'Challenge yourself with more hard-level problems',
        !hackerrankData && 'Join HackerRank to participate in coding challenges and earn certifications',
        hackerrankData && hackerrankData.totalBadges < 5 && 'Participate in more challenges to earn additional badges',
        'Keep your resume updated with latest projects and achievements',
        'Contribute to open-source projects to gain real-world experience',
        'Build a portfolio website to showcase your work professionally'
      ].filter(Boolean).slice(0, 6)
    };
    
    console.log('✅ Analysis generated successfully');
    res.json(analysis);
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      details: error.message 
    });
  }
});

module.exports = router;
