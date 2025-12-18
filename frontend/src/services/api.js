import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =========================================================
// REQUEST INTERCEPTOR – attach JWT
// =========================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// RESPONSE INTERCEPTOR – ✅ FIXED
// =========================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Logout ONLY when token is invalid / expired
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }

    // ❗ DO NOT logout on 403
    return Promise.reject(error);
  }
);

// =========================================================
// AUTH APIs
// =========================================================
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  signupHelper: (data) => api.post('/auth/signup/helper', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getHelperMe: () => api.get('/auth/helper/me'),
  toggleAvailability: (data) =>
    api.patch('/auth/helper/availability', data),
};


// =========================================================
// REQUEST APIs
// =========================================================
export const requestsAPI = {
  create: (data) => api.post('/requests', data),
  getMy: () => api.get('/requests/my'),
  getAvailable: () => api.get('/requests/available'),
  accept: (id) => api.patch(`/requests/${id}/accept`),
  complete: (id) => api.patch(`/requests/${id}/complete`),
};

// =========================================================
// RATINGS APIs
// =========================================================
export const ratingsAPI = {
  create: (data) => api.post('/ratings', data),
  getMy: () => api.get('/ratings/my'),
};

// =========================================================
// ADMIN APIs
// =========================================================
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingHelpers: () => api.get('/admin/helpers/pending'),
  verifyHelper: (id) => api.patch(`/admin/helpers/${id}/verify`),
};

export default api;