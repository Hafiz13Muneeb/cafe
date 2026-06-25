// src/api/axios.js - Axios instance with base URL and interceptors
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // Proxied to backend in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
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
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401) {
      // Clear token if expired
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Avoid redirect loop: only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
        // Store the attempted URL so we can redirect back after login (optional)
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
        window.location.href = '/admin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;