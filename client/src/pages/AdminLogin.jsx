// src/pages/AdminLogin.jsx - Admin login page (refactored)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'superadmin') {
        navigate('/admin/super');
      } else {
        navigate('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, var(--bg-color), #f1f5f9)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="inline-block p-4 rounded-full shadow-lg mb-4"
            style={{ backgroundColor: 'var(--primary-color)', boxShadow: '0 8px 30px rgba(212, 168, 67, 0.25)' }}
          >
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Admin Login</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to manage your menu</p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              required
              placeholder="Enter your username"
              leftIcon={User}
            />

            <Input
              label="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Enter your password"
              leftIcon={Lock}
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              fullWidth
              className="py-2.5"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            Protected area • Authorized access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;