// src/api/axios.js - Axios instance with base URL, interceptors, and dynamic menu support
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api', // Proxied to backend in development
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies (httpOnly JWT) with every request
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

    // Helper: determine if this is a subscription/permission error (not account blocked)
    const isSubscriptionError = () => {
      const message = response?.data?.message || '';
      return (
        message.toLowerCase().includes('subscription') ||
        message.toLowerCase().includes('paid') ||
        message.toLowerCase().includes('upgrade') ||
        config?.url?.includes('/settings/theme') // known paid feature endpoint
      );
    };

    // Handle 401 Unauthorized (token expired or invalid)
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

    // Handle 403 Forbidden
    if (status === 403) {
      // If it's a public request, just reject and let component handle
      if (isPublicRequest) {
        return Promise.reject(error);
      }

      // If it's a subscription/permission error, do NOT redirect – let the component show the message
      if (isSubscriptionError()) {
        return Promise.reject(error);
      }

      // Otherwise, treat as account blocked and redirect to login
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