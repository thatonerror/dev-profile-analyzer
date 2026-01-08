import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

const fetchWithRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.warn(`Attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// GitHub API
export const fetchGithubStats = async (username) => {
  return fetchWithRetry(() => 
    apiClient.get(`/github/${username}`).then(res => res.data)
  );
};

// LeetCode API
export const fetchLeetcodeStats = async (username) => {
  return fetchWithRetry(() => 
    apiClient.get(`/leetcode/${username}`).then(res => res.data)
  );
};

// Resume Upload
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  return apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // 30 seconds for file upload
  }).then(res => res.data);
};

// AI Analysis
export const analyzeProfile = async (resumeData, githubData, leetcodeData) => {
  return apiClient.post('/analyze', { 
    resumeData, 
    githubData, 
    leetcodeData 
  }).then(res => res.data);
};
