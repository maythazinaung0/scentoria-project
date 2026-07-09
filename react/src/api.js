import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/api',
  headers: { 
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  withXSRFToken: true,
});

// Interceptor to automatically attach Token if using Bearer token strategy
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token'); // Or wherever you store your auth token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;