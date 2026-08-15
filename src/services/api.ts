import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to requests
api.interceptors.request.use((config) => {
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
