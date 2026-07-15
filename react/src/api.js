import axios from 'axios';
import { notifyFromOutsideReact } from './contexts/NotificationBridge';

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

api.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toLowerCase();
        if (['post', 'put', 'patch', 'delete'].includes(method) && response.data?.message) {
            notifyFromOutsideReact({ type: 'success', message: response.data.message });
        }
        return response;
    },
    (error) => {
        const isValidationError = error.response?.status === 422;

        if (!error.config?.skipErrorToast && !isValidationError) {
            const message = error.response?.data?.message || 'Something went wrong. Please try again.';
            notifyFromOutsideReact({ type: 'error', message });
        }
        return Promise.reject(error);
    }
);
export default api;