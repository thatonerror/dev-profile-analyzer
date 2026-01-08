const express = require('express');
const axios = require('axios');
const router = express.Router();

let leetcodeCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    // Check cache first
    const cacheKey = `leetcode_${username.toLowerCase()}`;
    const cached = leetcodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    // Try multiple LeetCode stats APIs (unofficial but working)
    const apis = [
      `https://leetcode-stats.tashif.codes/${username}`,
      `https://leetcode-stats-api.herokuapp.com/${username}`,
      `https://api.leetcode.com/graphql`, // Fallback
    ];

    let leetcodeData = null;
    
    for (const apiUrl of apis) {
      try {
        const response = await axios.get(apiUrl, {
          timeout: 5000,
          headers: { 'User-Agent': 'DevProfileAnalyzer' }
        });
        leetcodeData = response.data;
        break;
      } catch (apiError) {
        console.log(`LeetCode API ${apiUrl} failed:`, apiError.message);
        continue;
      }
    }

    // Fallback data structure if API fails
    if (!leetcodeData || Object.keys(leetcodeData).length === 0) {
      return res.status(404).json({ 
        error: 'LeetCode profile not found or private',
        username,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0
      });
    }

    // Normalize different API responses
    const normalizedData = {
      username: leetcodeData.username || username,
      totalSolved: leetcodeData.totalSolved || leetcodeData.submissions || 0,
      easySolved: leetcodeData.easySolved || leetcodeData.easy || 0,
      mediumSolved: leetcodeData.mediumSolved || leetcodeData.medium || 0,
      hardSolved: leetcodeData.hardSolved || leetcodeData.hard || 0,
      ranking: leetcodeData.ranking || leetcodeData.globalRanking || 'N/A',
      acceptanceRate: leetcodeData.acceptanceRate || 'N/A',
      contests: leetcodeData.contests || 0
    };

    // Cache result
    leetcodeCache.set(cacheKey, { data: normalizedData, timestamp: Date.now() });
    
    res.json(normalizedData);
    
  } catch (error) {
    console.error('LeetCode API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch LeetCode data',
      username,
      fallback: {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0
      }
    });
  }
});

module.exports = router;
