// src/api/axios.js - Axios instance with base URL, interceptors, and dynamic menu support
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // Proxied to backend in development
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🆕 Send cookies (httpOnly JWT) with every request
});

// 🆕 Request interceptor – no need to add token manually; cookie is sent automatically
api.interceptors.request.use(
  (config) => {
    // We no longer inject Authorization header; the cookie is sent by the browser
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
    const { response, config } = error;
    const status = response?.status;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Helper: check if a request is public (no auth required)
    const isPublicRequest = config?.url?.startsWith('/menu/') || config?.url === '/settings/global';

    // Handle 401 Unauthorized (token expired or invalid)
    if (status === 401) {
      // Clear any leftover user data from localStorage (if still present)
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');

      // Only redirect if we're on a protected admin page (not login, not public)
      if (typeof window !== 'undefined') {
        const isAdminRoute = currentPath.startsWith('/admin');
        const isLoginPage = currentPath === '/admin';
        const isPublicRoute = currentPath.startsWith('/menu/') || currentPath === '/';

        // If on a protected admin page (not login and not public), redirect to login
        if (isAdminRoute && !isLoginPage && !isPublicRoute) {
          // Store the attempted URL for redirect after login
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
          window.location.href = '/admin';
        }
        // If already on login page, just stay there (no redirect loop)
        // If on public route, do nothing – let the component handle it
      }
    }

    // Handle 403 Forbidden (account blocked)
    if (status === 403) {
      // If it's a public request, just reject and let component handle
      if (isPublicRequest) {
        return Promise.reject(error);
      }

      // For all other 403 errors, treat as account blocked (admin panel)
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
    // We can reuse the public menu endpoint which returns cafe data
    const response = await api.get(`/menu/${slug}`);
    return response.data.data.cafe;
  } catch (error) {
    console.error('Error fetching cafe settings:', error);
    throw error;
  }
};

export default api;