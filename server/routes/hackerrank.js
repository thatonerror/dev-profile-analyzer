const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

let hackerrankCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  const cacheKey = `hackerrank_${username.toLowerCase()}`;
  
  // Cache check
  const cached = hackerrankCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.json(cached.data);
  }

  try {
    // Try fetching from HackerRank API endpoint first
    const apiUrl = `https://www.hackerrank.com/rest/hackers/${username}/profile_data`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `https://www.hackerrank.com/${username}`,
        'Origin': 'https://www.hackerrank.com'
      },
      timeout: 15000
    });

    const profileData = response.data;
    
    // Extract data from API response
    const badges = profileData.badges?.map(b => b.name || b.badge_name) || [];
    const challenges = profileData.solved_challenges_count || 0;
    const stars = profileData.stars || 0;

    const data = {
      username,
      challengesSolved: challenges,
      totalBadges: badges.length,
      totalStars: stars,
      badges: badges.length ? badges.slice(0, 8) : ['No badges yet'],
      profileUrl: `https://www.hackerrank.com/${username}`,
      lastUpdated: new Date().toISOString()
    };

    hackerrankCache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
    
  } catch (error) {
    console.error('HackerRank fetch error:', error.message);
    
    // Return fallback data instead of error
    const fallbackData = {
      username,
      challengesSolved: 0,
      totalBadges: 0,
      totalStars: 0,
      badges: ['Profile not found or private'],
      profileUrl: `https://www.hackerrank.com/${username}`,
      error: false, // Don't mark as error to avoid breaking UI
      lastUpdated: new Date().toISOString()
    };
    
    res.json(fallbackData);
  }
});

module.exports = router;