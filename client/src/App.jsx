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
import OwnerFAQManagement from './pages/OwnerFAQManagement';
import ChatWidget from './components/common/ChatWidget';

// ------------------- Layouts -------------------
const PublicLayout = ({ children }) => (
  <>
    {children}
    <ChatWidget />
  </>
);

// ------------------- Route Guards -------------------
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

  const isOnboardingComplete =
    user?.cafeName &&
    user?.whatsappNumber &&
    user?.tables &&
    user.tables.length > 0;

  // Redirect to onboarding if not complete (and not already there)
  if (!isOnboardingComplete && location.pathname !== '/admin/onboarding') {
    return <Navigate to="/admin/onboarding" replace />;
  }

  // If onboarding is complete and user tries to access onboarding page, send to dashboard
  if (isOnboardingComplete && location.pathname === '/admin/onboarding') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

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

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// ------------------- Favicon Manager -------------------
const FaviconManager = ({ children }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isMenuRoute = location.pathname.startsWith('/menu/'); // now matches both /menu and /menu/:slug

  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.rel = 'icon';
    const faviconUrl = isMenuRoute ? theme?.faviconUrl : (theme?.faviconUrl || '/vite.svg');
    link.href = faviconUrl || '/vite.svg';
    if (!document.querySelector("link[rel*='icon']")) {
      document.head.appendChild(link);
    }
  }, [theme, isMenuRoute]);

  return children;
};

// ------------------- App -------------------
function App() {
  return (
    <Router>
      <FaviconManager>
        <Routes>
          {/* Public routes with ChatWidget */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/home"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />

          {/* ✅ FIX: Added dynamic route for menu with slug, keep fallback without slug */}
          <Route
            path="/menu/:slug"
            element={
              <PublicLayout>
                <CustomerMenu />
              </PublicLayout>
            }
          />
          <Route
            path="/menu"
            element={
              <PublicLayout>
                <CustomerMenu />
              </PublicLayout>
            }
          />

          {/* Login – only accessible when not authenticated */}
          <Route
            path="/admin"
            element={
              <PublicOnlyRoute>
                <AdminLogin />
              </PublicOnlyRoute>
            }
          />

          {/* Onboarding – protected, but redirects if already complete */}
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
          <Route
            path="/admin/faqs"
            element={
              <ProtectedRoute>
                <OwnerFAQManagement />
              </ProtectedRoute>
            }
          />

          {/* Catch‑all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FaviconManager>
    </Router>
  );
}

export default App;