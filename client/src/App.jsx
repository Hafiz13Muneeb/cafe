// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated, selectAuthLoading, fetchMe } from './store/slices/authSlice';
import { selectTheme } from './store/slices/themeSlice';
import { syncCart } from './store/slices/cartSlice';
import Home from './pages/Home';
import CustomerMenu from './pages/CustomerMenu';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminSettings from './pages/SuperAdminSettings';
import OwnerSettings from './pages/OwnerSettings';
import SuperAdminCafeDetails from './pages/SuperAdminCafeDetails';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import OwnerAnalytics from './pages/OwnerAnalytics';
import QRCodePage from './pages/QRCodePage';
import SubscriptionPage from './pages/SubscriptionPage';
import RegisterCafe from './pages/RegisterCafe';
import Onboarding from './pages/Onboarding';
import Feedback from './pages/Feedback';
import SuperAdminNotifications from './pages/SuperAdminNotifications';
import ChatWidget from './components/common/ChatWidget';

// Helper: convert hex to RGB string
const hexToRgb = (hex) => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  // Parse 3-digit or 6-digit hex
  let r, g, b;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `${r}, ${g}, ${b}`;
};

const PublicLayout = ({ children }) => {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
};

const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const isSuperAdmin = user?.role === 'superadmin';

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-transparent"
            style={{ borderColor: 'var(--primary-color) transparent transparent transparent' }}
          />
          <p className="mt-4" style={{ color: 'var(--text-color)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

const RootRedirect = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'superadmin' ? '/admin/super' : '/admin/dashboard'} replace />;
  }
  return <Navigate to="/home" replace />;
};

const LoginRoute = () => {
  return <AdminLogin />;
};

const FaviconManager = ({ children }) => {
  const location = useLocation();
  const theme = useSelector(selectTheme);
  const isMenuRoute = location.pathname.startsWith('/menu/');

  useEffect(() => {
    if (!isMenuRoute) {
      const faviconUrl = theme?.faviconUrl || '';
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl || '/vite.svg';
      if (!document.querySelector("link[rel*='icon']")) {
        document.head.appendChild(link);
      }
    }
  }, [theme, isMenuRoute]);

  return children;
};

function App() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  // Fetch authenticated user on mount
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  // Cross‑tab cart sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        try {
          if (e.newValue === null) {
            dispatch(syncCart([]));
          } else {
            const cartItems = JSON.parse(e.newValue);
            dispatch(syncCart(cartItems));
          }
        } catch (err) {
          console.warn('Failed to sync cart from storage:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  // ✅ Apply theme to root CSS variables and toggle mode class
  useEffect(() => {
    const root = document.documentElement;
    if (theme) {
      const primaryColor = theme.primaryColor || '#d4a843';
      const secondaryColor = theme.secondaryColor || '#b8860b';
      root.style.setProperty('--primary-color', primaryColor);
      root.style.setProperty('--secondary-color', secondaryColor);
      // Convert primary color to RGB for transparency effects
      root.style.setProperty('--primary-color-rgb', hexToRgb(primaryColor));
      // Toggle dark/light mode class
      if (theme.mode === 'dark') {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
      } else {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
      }
    }
  }, [theme]);

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <FaviconManager>
        <Routes>
          {/* Public routes */}
          <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/menu/:slug" element={<PublicLayout><CustomerMenu /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterCafe /></PublicLayout>} />
          <Route path="/feedback" element={<PublicLayout><Feedback /></PublicLayout>} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Login */}
          <Route path="/admin" element={<LoginRoute />} />

          {/* Onboarding – protected */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Protected admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <OwnerAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/qr"
            element={
              <ProtectedRoute>
                <QRCodePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscription"
            element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/settings"
            element={
              <ProtectedRoute>
                <OwnerSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/super"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/super/:cafeSlug"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminCafeDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminNotifications />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FaviconManager>
    </Router>
  );
}

export default App;