// src/api/axios.js - Axios instance with base URL, interceptors, and dynamic menu support
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // Proxied to backend in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add admin token (for protected endpoints)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear token if expired
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Avoid redirect loop: only redirect if we're on a protected admin page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        // Only redirect to /admin if we're on a dashboard or admin route
        if (currentPath.startsWith('/admin/dashboard') || currentPath.startsWith('/admin/settings')) {
          sessionStorage.setItem('redirectAfterLogin', currentPath + window.location.search);
          window.location.href = '/admin';
        }
      }
    }

    // Handle 403 Forbidden (account blocked)
    if (error.response?.status === 403) {
      const message = error.response?.data?.message || 'Your account has been blocked. Please contact support.';
      // Show a user-friendly alert or redirect to a blocked page
      if (typeof window !== 'undefined') {
        // Clear session to force re-login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        // Redirect to login with error message
        sessionStorage.setItem('authError', message);
        window.location.href = '/admin';
      }
    }

    return Promise.reject(error);
  }
);

// Helper: Fetch public menu by cafe slug (no auth required)
export const fetchPublicMenu = async (slug) => {
  try {
    const response = await api.get(`/menu/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public menu:', error);
    throw error;
  }
};

// Helper: Get cafe settings by slug (for dynamic theming)
export const fetchCafeSettings = async (slug) => {
  try {
    // We can reuse the public menu endpoint which returns cafe data
    const response = await api.get(`/menu/${slug}`);
    return response.data.data.cafe;
  } catch (error) {
    console.error('Error fetching cafe settings:', error);
    throw error;
  }
};

export default api;