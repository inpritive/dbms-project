import axios from 'axios';

// Normalize API URL — must end with /api (e.g. https://your-app.onrender.com/api)
let API_URL = import.meta.env.VITE_API_URL || '/api';
if (API_URL !== '/api') {
  API_URL = API_URL.replace(/\/$/, '');
  if (!API_URL.endsWith('/api')) {
    API_URL = `${API_URL}/api`;
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { API_URL };
export default api;
