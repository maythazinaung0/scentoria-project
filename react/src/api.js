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

// Debounce success toasts: rapid-fire updates (e.g. clicking +/- repeatedly)
// collapse into a single toast shown after things settle, instead of one per request.
let successToastTimer = null;
let pendingSuccessMessage = null;

function queueSuccessToast(message) {
  pendingSuccessMessage = message;
  if (successToastTimer) clearTimeout(successToastTimer);
  successToastTimer = setTimeout(() => {
    notifyFromOutsideReact({ type: 'success', message: pendingSuccessMessage });
    successToastTimer = null;
    pendingSuccessMessage = null;
  }, 600); // waits for a short quiet period before showing
}

api.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toLowerCase();
        if (
            ['post', 'put', 'patch', 'delete'].includes(method) &&
            response.data?.message &&
            !response.config?.skipSuccessToast
        ) {
            queueSuccessToast(response.data.message);
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