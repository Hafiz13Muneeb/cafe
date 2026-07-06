// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated, selectAuthLoading, fetchMe } from './store/slices/authSlice';
import { selectTheme } from './store/slices/themeSlice';
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
import ChatWidget from './components/common/ChatWidget';

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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-[#8A9A5B]" />
          <p className="mt-4 text-[#3E2723]">Loading...</p>
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

// LoginRoute now simply renders AdminLogin – authentication state is handled inside.
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

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <Router>
      {/* ✅ Global toast container */}
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      
      <FaviconManager>
        <Routes>
          {/* Public routes */}
          <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/menu/:slug" element={<PublicLayout><CustomerMenu /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterCafe /></PublicLayout>} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Login – now handles both logged-in and logged-out states */}
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

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FaviconManager>
    </Router>
  );
}

export default App;