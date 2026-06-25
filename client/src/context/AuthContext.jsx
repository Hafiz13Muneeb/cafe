// src/context/AuthContext.jsx - Admin authentication state
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

// Create context
const AuthContext = createContext();

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load token and admin from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminData');
    if (token && storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
      // Set token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setError('');
      const response = await axios.post('/auth/login', { username, password });
      
      if (response.data.success) {
        const adminData = response.data.data;
        const token = adminData.token;
        
        // Store token and admin data in localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(adminData));
        
        // Set token in axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setAdmin(adminData);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    // Remove token from axios defaults
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  // Update admin settings locally after updating
  const updateAdminData = (updatedData) => {
    if (admin) {
      const newAdmin = { ...admin, ...updatedData };
      setAdmin(newAdmin);
      localStorage.setItem('adminData', JSON.stringify(newAdmin));
    }
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    updateAdminData,
    isAuthenticated: !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};