import axios from 'axios';

// Dynamically resolve API URL based on environment (local vs production: https://liteapi.easytaka.com/api)
export const getApiBaseUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL;

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // When running on production domain lite.easytaka.com or *.easytaka.com
    if (
      hostname.includes('easytaka.com') ||
      (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && import.meta.env.PROD)
    ) {
      if (envApiUrl && !envApiUrl.includes('localhost') && !envApiUrl.includes('127.0.0.1')) {
        return envApiUrl;
      }
      return 'https://liteapi.easytaka.com/api';
    }
  }

  // Local development fallback
  return envApiUrl || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic interceptor to ensure requests always target correct runtime baseURL
api.interceptors.request.use((config) => {
  if (!config.baseURL || config.baseURL.includes('localhost') && typeof window !== 'undefined' && window.location.hostname.includes('easytaka.com')) {
    config.baseURL = getApiBaseUrl();
  }

  const token = localStorage.getItem('esytaka_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized if not on login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('esytaka_token');
        localStorage.removeItem('esytaka_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
