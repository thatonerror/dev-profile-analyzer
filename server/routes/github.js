const express = require('express');
const axios = require('axios');
const router = express.Router();

// Rate limit GitHub API calls
let githubCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    // Check cache first
    const cacheKey = `github_${username.toLowerCase()}`;
    const cached = githubCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    // Fetch user info
    const [userResponse, reposResponse] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, {
        headers: { 'User-Agent': 'DevProfileAnalyzer' }
      }),
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
        headers: { 'User-Agent': 'DevProfileAnalyzer' }
      })
    ]);

    const repos = reposResponse.data;
    
    // Calculate stats
    const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    const languages = {};
    repos.forEach(repo => {
      if (repo.language && repo.language !== null) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    
    const topLanguages = Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([language, count]) => ({ language, count }));

    const result = {
      username: userResponse.data.login,
      name: userResponse.data.name,
      avatar: userResponse.data.avatar_url,
      bio: userResponse.data.bio,
      publicRepos: userResponse.data.public_repos,
      followers: userResponse.data.followers,
      following: userResponse.data.following,
      totalStars,
      topLanguages,
      repos: repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 10)
        .map(r => ({
          name: r.name,
          description: r.description,
          stars: r.stargazers_count,
          language: r.language,
          url: r.html_url,
          updated: r.updated_at
        }))
    };

    // Cache result
    githubCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    res.json(result);
    
  } catch (error) {
    console.error('GitHub API Error:', error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    if (error.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API rate limit exceeded' });
    }
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

module.exports = router;
