import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = "http://127.0.0.1:5000";

// =========================================================
// AXIOS INSTANCE
// =========================================================
const api = axios.create({
  baseURL: API_BASE_URL,
});

// =========================================================
// REQUEST INTERCEPTOR – attach JWT
// =========================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// RESPONSE INTERCEPTOR – FINAL & SAFE
// =========================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error;

    // ✅ Logout ONLY for real auth failure
    if (
      status === 401 &&
      (message === "Invalid token" || message === "Token expired")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// =========================================================
// AUTH APIs
// =========================================================
export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  signupHelper: (data) => api.post("/auth/signup/helper", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  getHelperMe: () => api.get("/auth/helper/me"),
  toggleAvailability: (data) =>
    api.patch("/auth/helper/availability", data),
};

// =========================================================
// REQUEST APIs
// =========================================================
export const requestsAPI = {
  create: (data) => api.post("/requests", data),
  getMy: () => api.get("/requests/my"),
  getAvailable: () => api.get("/requests/available"),

  accept: (id) => api.patch(`/requests/${id}/accept`),
  complete: (id) => api.patch(`/requests/${id}/complete`),

  cancelByUser: (id) => api.patch(`/requests/${id}/cancel`),
  cancelByHelper: (id) => api.patch(`/requests/${id}/cancel/helper`),
};

// =========================================================
// RATINGS APIs
// =========================================================
export const ratingsAPI = {
  create: (data) => api.post("/ratings", data),
  getMy: () => api.get("/ratings/my"),
};

// =========================================================
// ADMIN APIs
// =========================================================
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getPendingHelpers: () => api.get("/admin/helpers/pending"),
  verifyHelper: (id) => api.patch(`/admin/helpers/${id}/verify`),
};

// =========================================================
// SOCKET.IO (SINGLE INSTANCE)
// =========================================================
export const voiceSocket = io(API_BASE_URL, {
  autoConnect: false,
});

// =========================================================
// VOICE ROOM HELPERS (USER ONLY)
// =========================================================
// ... existing axios code ...

export const joinVoiceRoom = (room, name, role) => {
  if (!voiceSocket.connected) {
    voiceSocket.connect();
  }

  voiceSocket.emit("join_room", {
    token: localStorage.getItem("token"),
    room,
    name,
    role, // ✅ Pass the real name to the server
  }); 
};

export const leaveVoiceRoom = ({ room }) => {
  if (voiceSocket.connected) {
    voiceSocket.emit("leave_room", { room });
    voiceSocket.disconnect(); // ✅ Triggers the 'disconnect' cleanup on server
  }
};
// 🔥 DEBUG ONLY – expose socket for console testing
window.voiceSocket = voiceSocket;
window.joinVoiceRoom = joinVoiceRoom;
window.leaveVoiceRoom = leaveVoiceRoom;

export default api;
