// src/App.jsx - Single-cafe version (removed superadmin, blog, contact, subscription)
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Home from './pages/Home';
import CustomerMenu from './pages/CustomerMenu';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import OwnerSettings from './pages/OwnerSettings';
import OwnerAnalytics from './pages/OwnerAnalytics';
import QRCodePage from './pages/QRCodePage';
import OnboardingSetup from './pages/OnboardingSetup';
// 🆕 Import FAQ Management page
import OwnerFAQManagement from './pages/OwnerFAQManagement';
import ChatWidget from './components/common/ChatWidget';

const PublicLayout = ({ children }) => {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

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

  // Check if user has completed onboarding
  const isOnboardingComplete =
    user?.cafeName &&
    user?.whatsappNumber &&
    user?.tables &&
    user.tables.length > 0;

  if (!isOnboardingComplete && location.pathname !== '/admin/onboarding') {
    return <Navigate to="/admin/onboarding" replace />;
  }

  return children;
};

const FaviconManager = ({ children }) => {
  const location = useLocation();
  const { theme } = useTheme();
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
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <FaviconManager>
        <Routes>
          {/* Public routes with ChatWidget */}
          <Route
            path="/"
            element={
              <PublicLayout>
                {isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Home />}
              </PublicLayout>
            }
          />
          <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
          
          {/* 🆕 Public menu routes – with and without slug */}
          <Route path="/menu/:slug" element={<PublicLayout><CustomerMenu /></PublicLayout>} />
          <Route path="/menu" element={<PublicLayout><CustomerMenu /></PublicLayout>} />

          {/* Login (no ChatWidget) */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Onboarding (protected) */}
          <Route
            path="/admin/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingSetup />
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
            path="/admin/dashboard/settings"
            element={
              <ProtectedRoute>
                <OwnerSettings />
              </ProtectedRoute>
            }
          />

          {/* 🆕 FAQ Management Page */}
          <Route
            path="/admin/faqs"
            element={
              <ProtectedRoute>
                <OwnerFAQManagement />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FaviconManager>
    </Router>
  );
}

export default App;