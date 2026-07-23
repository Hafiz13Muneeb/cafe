// src/api/axios.js - Axios instance with base URL including /api
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  // ✅ Include /api in the base URL
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Required for session cookies
});

// Request interceptor – no need to add token manually; cookie is sent automatically
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    const status = response?.status;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Helper: check if a request is public (no auth required)
    const isPublicRequest = config?.url?.startsWith('/menu/') || config?.url === '/settings/global';

    // Handle 401 Unauthorized (session expired or invalid)
    if (status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      if (typeof window !== 'undefined') {
        const isAdminRoute = currentPath.startsWith('/admin');
        const isLoginPage = currentPath === '/admin';
        const isPublicRoute = currentPath.startsWith('/menu/') || currentPath === '/';
        if (isAdminRoute && !isLoginPage && !isPublicRoute) {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
          window.location.href = '/admin';
        }
      }
    }

    // Handle 403 Forbidden (account blocked)
    if (status === 403) {
      if (isPublicRequest) {
        return Promise.reject(error);
      }
      const message = response?.data?.message || 'Your account has been blocked. Please contact support.';
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
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
    const response = await api.get(`/menu/${slug}`);
    return response.data.data.cafe;
  } catch (error) {
    console.error('Error fetching cafe settings:', error);
    throw error;
  }
};

export default api;