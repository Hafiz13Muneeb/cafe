// src/pages/AdminLogin.jsx - Admin login page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return; // Error will be shown by the login function
    }
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-500 rounded-full shadow-lg shadow-green-200 mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your menu</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Username field */}
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password field */}
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-2.5 rounded-lg font-semibold text-white
                flex items-center justify-center gap-2
                transition-all duration-200
                ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 active:scale-95 shadow-md shadow-green-200'
                }
              `}
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

          {/* Footer note */}
          <p className="text-xs text-gray-400 text-center mt-4">
            Protected area • Authorized access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;