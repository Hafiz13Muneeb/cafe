// src/pages/AdminLogin.jsx - Admin login page (works for both superadmin and owners)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';

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
    if (!username.trim() || !password.trim()) {
      return;
    }
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    // If login fails, error is already set in context
    // If successful, the useEffect will redirect
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

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'hover:opacity-90 active:scale-95 shadow-md'
              }`}
              style={{
                backgroundColor: loading ? '#9ca3af' : 'var(--primary-color)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(212, 168, 67, 0.3)',
              }}
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
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