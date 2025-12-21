import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // RESTORE SESSION (ON PAGE REFRESH)
  // =========================================================
  useEffect(() => {
    restoreSession();
  }, []);

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

      // Normalize response
      if (res.data?.user) {
        setUser(res.data.user); // admin & user
      } else {
        setUser(res.data); // helper
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setUser(null);
      setRole(null);
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

    try {
      const userRes =
        role === 'helper'
          ? await authAPI.getHelperMe()
          : await authAPI.getMe();

      if (userRes.data?.user) {
        setUser(userRes.data.user);
      } else {
        setUser(userRes.data);
      }
    } catch {
      setUser(null);
    }

    return role;
  };

  // =========================================================
  // SIGNUP
  // =========================================================
  const signup = async (data, isHelper = false) => {
    if (isHelper) await authAPI.signupHelper(data);
    else await authAPI.signup(data);
    return true;
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
    signup,
    logout,
    isAuthenticated: !!role, // 🔥 FIX IS HERE
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
localStorage.clear();
