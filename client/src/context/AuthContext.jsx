// src/context/AuthContext.jsx - Single-cafe, no DB, .env + localStorage password
import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // Read credentials from .env
  const OWNER_USERNAME = import.meta.env.VITE_OWNER_USERNAME || 'admin';
  const OWNER_PASSWORD = import.meta.env.VITE_OWNER_PASSWORD || 'admin123';

  // On mount: check localStorage for existing session
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

  // Login – compare with .env or localStorage saved password
  const login = async (username, password) => {
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both username and password');
      return { success: false, error: 'Missing credentials' };
    }

    // Check against .env or saved password
    const savedPassword = localStorage.getItem('ownerPassword');
    const validPassword = savedPassword || OWNER_PASSWORD;

    if (trimmedUsername === OWNER_USERNAME && trimmedPassword === validPassword) {
      const userData = {
        username: OWNER_USERNAME,
        role: 'owner',
        cafeName: '',
        whatsappNumber: '',
        tables: [],
        logoUrl: '',
        faviconUrl: '',
        slug: '',
        theme: { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
      };

      // Merge saved settings
      const savedSettings = localStorage.getItem('cafeSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          Object.assign(userData, parsed);
        } catch (e) {}
      }

      localStorage.setItem('adminData', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } else {
      setError('Invalid username or password');
      return { success: false, error: 'Invalid credentials' };
    }
  };

  // Change password – saves to localStorage
  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    return new Promise((resolve, reject) => {
      if (newPassword !== confirmPassword) {
        reject(new Error('New password and confirmation do not match'));
        return;
      }
      if (newPassword.length < 6) {
        reject(new Error('New password must be at least 6 characters'));
        return;
      }

      const savedPassword = localStorage.getItem('ownerPassword') || import.meta.env.VITE_OWNER_PASSWORD || 'admin123';
      if (oldPassword !== savedPassword) {
        reject(new Error('Current password is incorrect'));
        return;
      }

      // Save new password
      localStorage.setItem('ownerPassword', newPassword);
      resolve({ success: true, message: 'Password changed successfully' });
    });
  };

  const logout = () => {
    localStorage.removeItem('adminData');
    setUser(null);
  };

  const updateUserData = (updatedData) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('adminData', JSON.stringify(newUser));

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