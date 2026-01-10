// client/src/utils/apiUrl.js

/**
 * Get the base API URL without /api suffix
 * Handles both:
 * - http://localhost:5000
 * - https://thenewdevprof.onrender.com
 * - https://thenewdevprof.onrender.com/api
 */
export const getBaseUrl = () => {
  let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Remove trailing /api if present
  if (apiUrl.endsWith('/api')) {
    apiUrl = apiUrl.replace(/\/api$/, '');
  }
  
  // Remove trailing slash
  apiUrl = apiUrl.replace(/\/$/, '');
  
  return apiUrl;
};

/**
 * Get full API endpoint URL
 * @param {string} endpoint - API endpoint (e.g., '/auth/google', 'github/username')
 * @returns {string} Full URL (e.g., 'https://thenewdevprof.onrender.com/api/auth/google')
 */
export const getApiUrl = (endpoint) => {
  const baseUrl = getBaseUrl();
  
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Add /api prefix if not already present in endpoint
  const finalEndpoint = cleanEndpoint.startsWith('/api') 
    ? cleanEndpoint 
    : `/api${cleanEndpoint}`;
  
  return `${baseUrl}${finalEndpoint}`;
};

// Export for direct use
export default {
  getBaseUrl,
  getApiUrl
};