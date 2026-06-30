// src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const authError = sessionStorage.getItem('authError');
    if (authError) {
      setError(authError);
      sessionStorage.removeItem('authError');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password.trim());
      if (result.success) {
        if (result.user?.role === 'superadmin') {
          navigate('/admin/super');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F5F5DC]">
      <div className="w-full max-w-md bg-white border-2 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-full bg-[#8A9A5B] border-2 border-[#3E2723] mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#3E2723]">Admin Login</h1>
          <p className="text-xs sm:text-sm text-[#3E2723]/60 mt-1">
            Enter your credentials to access the dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 font-bold flex items-center gap-2 text-sm sm:text-base">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={User}
            required
            disabled={loading}
            autoComplete="username"
          />
          <Input
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            leftIcon={Lock}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="bg-[#8A9A5B] border-2 border-[#3E2723] text-white hover:bg-[#78884d]"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;