// src/App.jsx - Main App component with dynamic multi-tenant routing
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Home from './pages/Home';
import CustomerMenu from './pages/CustomerMenu';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminSettings from './pages/SuperAdminSettings';
import OwnerSettings from './pages/OwnerSettings';

// Protected route wrapper – redirects to login if not authenticated
const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { user, isAuthenticated, isSuperAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

// Favicon manager component – sets global or per-cafe favicon
const FaviconManager = ({ children }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isMenuRoute = location.pathname.startsWith('/menu/');

  useEffect(() => {
    // If it's a menu route, CustomerMenu will handle the favicon
    // For all other routes, use the global favicon
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
  return (
    <Router>
      <FaviconManager>
        <Routes>
          {/* Public landing page (static) */}
          <Route path="/" element={<Home />} />

          {/* Dynamic customer menu – /menu/:slug */}
          <Route path="/menu/:slug" element={<CustomerMenu />} />

          {/* Admin login – public */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin dashboard – protected (owner & superadmin) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Owner Settings – protected (owner only, not superadmin) */}
          <Route
            path="/admin/dashboard/settings"
            element={
              <ProtectedRoute>
                <OwnerSettings />
              </ProtectedRoute>
            }
          />

          {/* SuperAdmin dashboard – protected (superadmin only) */}
          <Route
            path="/admin/super"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* SuperAdmin Settings – protected (superadmin only) */}
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireSuperAdmin>
                <SuperAdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Catch-all – redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FaviconManager>
    </Router>
  );
}

export default App;