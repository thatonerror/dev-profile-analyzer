const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    // HackerRank doesn't have public API, use web scraping (ethical)
    const response = await axios.get(`https://www.hackerrank.com/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    let badges = [], totalScore = 0, challenges = 0;

    // Extract badges and stats (these selectors may change)
    $('.badges-container .badge').each((i, el) => {
      badges.push($(el).attr('title') || `Badge ${i + 1}`);
    });

    // Extract challenge count
    const challengeText = $('.profile-stats .stat-item').first().text();
    challenges = parseInt(challengeText.match(/(\d+)/)?.[0]) || 0;

    const data = {
      username,
      badges: badges.slice(0, 10),
      totalBadges: badges.length,
      challengesSolved: challenges,
      profileUrl: `https://www.hackerrank.com/${username}`
    };

    res.json(data);
    
  } catch (error) {
    // Graceful fallback
    res.json({
      username,
      badges: [],
      totalBadges: 0,
      challengesSolved: 0,
      error: 'HackerRank profile not public or unavailable',
      note: 'HackerRank requires public profile for stats'
    });
  }
});

module.exports = router;
