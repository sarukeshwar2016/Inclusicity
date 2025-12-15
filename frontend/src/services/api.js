import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  signupHelper: (data) => api.post('/auth/signup/helper', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  toggleAvailability: () => api.patch('/auth/helper/availability'),
};

export const requestsAPI = {
  create: (data) => api.post('/requests', data),
  getMy: () => api.get('/requests/my'),
  getAvailable: () => api.get('/requests/available'),
  accept: (id) => api.patch(`/requests/${id}/accept`),
  complete: (id) => api.patch(`/requests/${id}/complete`),
};

export const ratingsAPI = {
  create: (data) => api.post('/ratings', data),
  getMy: () => api.get('/ratings/my'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingHelpers: () => api.get('/admin/helpers/pending'),
  verifyHelper: (id) => api.patch(`/admin/helpers/${id}/verify`),
};

export default api;
