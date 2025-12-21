import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  // =========================================================
  // RESTORE SESSION (silent validation)
  // =========================================================
  const restoreSession = async () => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');

    if (!token || !savedRole) {
      setLoading(false);
      return;
    }

    setRole(savedRole);

    try {
      const res =
        savedRole === 'helper'
          ? await authAPI.getHelperMe()
          : await authAPI.getMe();

      setUser(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error;

      // 🔥 logout ONLY for real auth failure
      if (
        status === 401 &&
        (msg === 'Invalid token' || msg === 'Token expired')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
        setRole(null);
      }
      // otherwise: ignore error, DO NOT logout
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================
  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, role } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setRole(role);

    // fetch user AFTER login
    await restoreSession();
    return role;
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  const value = {
    user,
    role,
    loading,
    login,
    logout,
    isAuthenticated: !!localStorage.getItem('token'), // ✅ IMPORTANT
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
