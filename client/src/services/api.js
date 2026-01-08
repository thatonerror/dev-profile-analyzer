import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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

// HackerRank API - Fixed
export const fetchHackerrankStats = async (username) => {
  return fetchWithRetry(() => 
    apiClient.get(`/hackerrank/${username}`).then(res => res.data)
  );
};

// Resume Upload - Fixed
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file); // Match backend field name
  
  console.log('📤 Uploading file:', file.name, file.size, 'bytes');
  
  return apiClient.post('/upload', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data'
    },
    timeout: 30000, // 30 seconds for large files
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log('Upload progress:', percentCompleted + '%');
    }
  }).then(res => {
    console.log('✅ Upload response:', res.data);
    return res.data;
  }).catch(err => {
    console.error('❌ Upload error:', err.response?.data || err.message);
    throw err;
  });
};

// AI Analysis
export const analyzeProfile = async (resumeData, githubData, leetcodeData, hackerrankData) => {
  return apiClient.post('/analyze', { 
    resumeData, 
    githubData, 
    leetcodeData,
    hackerrankData
  }).then(res => res.data);
};
