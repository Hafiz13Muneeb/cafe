// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user from localStorage – no validation call
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminData');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        // Corrupted data – clear it
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        delete api.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setError('');
      const response = await api.post('/auth/login', { username, password });

      if (response.data.success) {
        const { user: userData, token } = response.data.data;

        if (userData.isBlocked) {
          setError('Your account has been blocked. Please contact support.');
          return { success: false, error: 'Account blocked' };
        }

        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Update user data
  const updateUserData = (updatedData) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('adminData', JSON.stringify(newUser));
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUserData,
    isAuthenticated: !!user,
    isSuperAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};