import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');

    if (token && savedRole) {
      setRole(savedRole);
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token, role } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setRole(role);

    await fetchCurrentUser();
    return role;
  };

  const signup = async (data, isHelper = false) => {
    const response = isHelper
      ? await authAPI.signupHelper(data)
      : await authAPI.signup(data);

    const { token, role } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setRole(role);

    await fetchCurrentUser();
    return role;
  };

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
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
