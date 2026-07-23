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

  // On mount: restore session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('adminData');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('adminData');
      }
    }
    setLoading(false);
  }, []);

  // Login – now calls backend API
  const login = async (username, password) => {
    setError('');
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('adminData', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        setError(response.data.message || 'Login failed');
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Network error. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Change password – calls backend
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      throw new Error(msg);
    }
  };

  // Logout – clear session on backend and frontend
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.debug('Logout error (ignored):', err.message);
    }
    localStorage.removeItem('adminData');
    setUser(null);
  };

  // Update user data (e.g., settings) – keeps localStorage in sync
  const updateUserData = (updatedData) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('adminData', JSON.stringify(newUser));

      // Also update cafeSettings separately if needed (keep existing behaviour)
      const settings = {
        cafeName: newUser.cafeName,
        whatsappNumber: newUser.whatsappNumber,
        tables: newUser.tables,
        logoUrl: newUser.logoUrl,
        faviconUrl: newUser.faviconUrl,
        slug: newUser.slug,
        theme: newUser.theme,
      };
      localStorage.setItem('cafeSettings', JSON.stringify(settings));
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    changePassword,
    updateUserData,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};