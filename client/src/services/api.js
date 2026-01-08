import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// GitHub API
export const fetchGithubStats = async (username) => {
  try {
    const response = await apiClient.get(`/github/${username}`);
    return response.data;
  } catch (error) {
    throw new Error(`GitHub: ${error.message}`);
  }
};

// LeetCode API
export const fetchLeetcodeStats = async (username) => {
  try {
    const response = await apiClient.get(`/leetcode/${username}`);
    return response.data;
  } catch (error) {
    throw new Error(`LeetCode: ${error.message}`);
  }
};

// HackerRank API
export const fetchHackerrankStats = async (username) => {
  try {
    const response = await apiClient.get(`/hackerrank/${username}`);
    return response.data;
  } catch (error) {
    throw new Error(`HackerRank: ${error.message}`);
  }
};

// Resume Upload with Progress Tracking
export const uploadResume = async (file, onProgress = null) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type) && !file.name.endsWith('.docx')) {
    throw new Error('Invalid file type. Please upload PDF or DOCX only.');
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit');
  }

  const formData = new FormData();
  formData.append('resume', file);
  
  console.log('📤 Uploading:', file.name, file.type, (file.size / 1024).toFixed(2) + 'KB');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('📊 Upload progress:', percent + '%');
          if (onProgress) {
            onProgress(percent);
          }
        }
      }
    });
    
    console.log('✅ Upload success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.message || error.message || 'Upload failed';
    throw new Error(errorMsg);
  }
};

// AI Analysis
export const analyzeProfile = async (data) => {
  try {
    const { resumeData, githubData, leetcodeData, hackerrankData } = data;
    
    // Validate at least one data source is provided
    if (!resumeData && !githubData && !leetcodeData && !hackerrankData) {
      throw new Error('No data provided for analysis');
    }

    const response = await apiClient.post('/analyze', { 
      resumeData, 
      githubData, 
      leetcodeData,
      hackerrankData
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Analysis: ${error.message}`);
  }
};

// Health check endpoint (optional but recommended)
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.warn('API health check failed:', error.message);
    return { status: 'error', message: error.message };
  }
};

export default {
  fetchGithubStats,
  fetchLeetcodeStats,
  fetchHackerrankStats,
  uploadResume,
  analyzeProfile,
  checkApiHealth,
};