import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// GitHub API
export const fetchGithubStats = async (username) => {
  const response = await apiClient.get(`/github/${username}`);
  return response.data;
};

// LeetCode API
export const fetchLeetcodeStats = async (username) => {
  const response = await apiClient.get(`/leetcode/${username}`);
  return response.data;
};

// HackerRank API
export const fetchHackerrankStats = async (username) => {
  const response = await apiClient.get(`/hackerrank/${username}`);
  return response.data;
};

// Resume Upload - FIXED
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file); // Must match multer field name
  
  console.log('📤 Uploading:', file.name, file.type, file.size);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('📊 Upload progress:', percent + '%');
      }
    });
    
    console.log('✅ Upload success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    throw error;
  }
};

// AI Analysis
export const analyzeProfile = async (resumeData, githubData, leetcodeData, hackerrankData) => {
  const response = await apiClient.post('/analyze', { 
    resumeData, 
    githubData, 
    leetcodeData,
    hackerrankData
  });
  return response.data;
};