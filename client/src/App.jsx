// src/App.jsx - Main App component with dynamic multi-tenant routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import CustomerMenu from './pages/CustomerMenu';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

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

function App() {
  return (
    <Router>
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

        {/* SuperAdmin dashboard – protected (superadmin only) */}
        <Route
          path="/admin/super"
          element={
            <ProtectedRoute requireSuperAdmin>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all – redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;