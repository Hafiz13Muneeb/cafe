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

  // 🆕 On mount: try to fetch the user profile using the cookie (if present)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Attempt to get the current user using the httpOnly cookie
        const response = await api.get('/auth/me');
        if (response.data.success) {
          const userData = response.data.data;
          setUser(userData);
          // Also store user data in localStorage for fast re-load (optional)
          localStorage.setItem('adminData', JSON.stringify(userData));
        } else {
          // Unexpected response – clear any stale data
          localStorage.removeItem('adminData');
          setUser(null);
        }
      } catch (err) {
        // 401 or other error means not authenticated – clear stored user
        console.debug('Not authenticated:', err.response?.status);
        localStorage.removeItem('adminData');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // If we have a stored user but no token (we don't store token anymore),
    // we still try to validate via cookie. If cookie is missing, /auth/me will return 401.
    fetchUser();
  }, []);

  // Login function – no token storage, token is set in httpOnly cookie
  const login = async (username, password) => {
    try {
      setError('');
      const response = await api.post('/auth/login', { username, password });

      if (response.data.success) {
        const { user: userData } = response.data.data;

        if (userData.isBlocked) {
          setError('Your account has been blocked. Please contact support.');
          return { success: false, error: 'Account blocked' };
        }

        // Store user data in localStorage (but NOT the token)
        localStorage.setItem('adminData', JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // 🆕 Logout – call logout endpoint to clear the cookie, then clear local state
  const logout = async () => {
    try {
      // Call logout endpoint to clear the httpOnly cookie on the server
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      // Always clear local state regardless of server response
      localStorage.removeItem('adminData');
      setUser(null);
      // Redirect to login page (handled by the caller)
    }
  };

  // Update user data – updates both state and localStorage
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