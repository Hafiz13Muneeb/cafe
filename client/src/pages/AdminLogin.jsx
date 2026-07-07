// src/pages/AdminLogin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser, selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import {
  Lock,
  User,
  Users,
  AlertCircle,
  Coffee,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tour state
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Refs for spotlight elements
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const loginBtnRef = useRef(null);
  const demoBtnRef = useRef(null);
  const createAccountRef = useRef(null);

  // Check if we should show the tour
  useEffect(() => {
    const hasUserData = localStorage.getItem('adminData');
    const hasCookie = document.cookie.split(';').some((c) => c.trim().startsWith('token='));
    const tourShown = localStorage.getItem('tourShown');

    if (hasUserData || hasCookie || tourShown) {
      setShowTour(false);
    } else {
      setShowTour(true);
      setTourStep(0);
    }
  }, []);

  useEffect(() => {
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
      const resultAction = await dispatch(loginUser({
        username: username.trim(),
        password: password.trim(),
      }));

      if (loginUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        if (user?.role === 'superadmin') {
          navigate('/admin/super');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError(resultAction.payload || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('Demo');
    setPassword('demo123');
    setError('');
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    window.location.reload();
  };

  // ---------- TOUR CONFIG ----------
  const tourSteps = [
    {
      target: usernameRef,
      icon: User,
      title: 'Enter Your Username',
      description: 'Type your cafe username. Use the demo credentials or your own.',
    },
    {
      target: passwordRef,
      icon: Lock,
      title: 'Enter Your Password',
      description: 'Your password is securely stored. Try the demo password: "demo123".',
    },
    {
      target: loginBtnRef,
      icon: CheckCircle,
      title: 'Login to Dashboard',
      description: 'Click here to access your admin panel and start managing your menu.',
    },
    {
      target: demoBtnRef,
      icon: Coffee,
      title: 'Quick Demo',
      description: 'Click here to auto‑fill the demo credentials and test the app instantly.',
    },
    {
      target: createAccountRef,
      icon: Users,
      title: 'New to CafeFlow?',
      description: 'Create your own cafe account and start your digital menu today.',
    },
  ];

  const totalSteps = tourSteps.length;
  const currentStepData = tourSteps[tourStep];

  const handleNext = () => {
    if (tourStep < totalSteps - 1) {
      setTourStep(tourStep + 1);
    } else {
      localStorage.setItem('tourShown', 'true');
      setShowTour(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tourShown', 'true');
    setShowTour(false);
  };

  const handlePrev = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  const getTargetRect = () => {
    const ref = currentStepData?.target?.current;
    if (!ref) return null;
    return ref.getBoundingClientRect();
  };

  const targetRect = getTargetRect();

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const tooltipHeight = 240;
    let top, left;
    const leftPos = Math.max(20, Math.min(targetRect.left + targetRect.width / 2 - 160, window.innerWidth - 360));
    if (spaceBelow > tooltipHeight + 20) {
      top = targetRect.bottom + 16;
    } else if (spaceAbove > tooltipHeight + 20) {
      top = targetRect.top - tooltipHeight - 16;
    } else {
      top = (viewportHeight - tooltipHeight) / 2;
      return { top: `${top}px`, left: '50%', transform: 'translateX(-50%)' };
    }
    return { top: `${top}px`, left: `${leftPos}px`, transform: 'none' };
  };

  const tooltipStyle = getTooltipPosition();

  // ------------------------------------------------------------
  // If user is already logged in, show a special message
  // ------------------------------------------------------------
  if (isAuthenticated && user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
        <div
          className="w-full max-w-md border-2 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8 text-center"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
        >
          <div
            className="inline-block p-4 rounded-full border-2 border-[#3E2723] mb-4"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <CheckCircle size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>You are already logged in</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Signed in as <strong>{user.username}</strong> ({user.role === 'superadmin' ? 'Super Admin' : 'Owner'}).
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            If you want to sign in with a different account, please log out first.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={() => navigate(user.role === 'superadmin' ? '/admin/super' : '/admin/dashboard')}
              className="w-full justify-center"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="w-full justify-center"
            >
              <LogOut size={16} className="inline mr-2" /> Logout
            </Button>
          </div>
          <div className="mt-4 border-t border-[#3E2723]/20 pt-4">
            <Link to="/register" className="text-xs hover:underline" style={{ color: 'var(--primary-color)' }}>
              Create another account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Normal login form (user not authenticated)
  // ------------------------------------------------------------
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      {showTour && targetRect && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            className="absolute pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              borderRadius: '6px',
              boxShadow: `0 0 0 4px var(--primary-color), 0 0 20px rgba(var(--primary-color-rgb), 0.6)`,
              transition: 'all 0.3s ease',
            }}
          />
          <div
            className="absolute border-4 border-[#3E2723] shadow-[8px_8px_0px_0px_var(--primary-color)] p-5 max-w-xs w-72 pointer-events-auto"
            style={{
              top: tooltipStyle.top,
              left: tooltipStyle.left,
              transform: tooltipStyle.transform || 'none',
              backgroundColor: 'var(--card-bg)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full transition"
                  style={{
                    backgroundColor: idx === tourStep ? 'var(--primary-color)' : 'var(--bg-color)',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-1.5 rounded-full border-2 border-[#3E2723]"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <currentStepData.icon size={18} className="text-white" />
              </div>
              <h3 className="font-bold text-base" style={{ color: 'var(--text-color)' }}>{currentStepData.title}</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{currentStepData.description}</p>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={tourStep === 0}
                className={`text-sm font-bold transition ${
                  tourStep === 0 ? 'cursor-not-allowed opacity-30' : 'hover:text-primary'
                }`}
                style={tourStep === 0 ? { color: 'var(--text-secondary)' } : { color: 'var(--text-color)' }}
              >
                Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  className="text-xs font-bold transition hover:opacity-70"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 text-white font-bold border-2 border-[#3E2723] shadow-[3px_3px_0px_0px_#3E2723] hover:shadow-none transition text-xs"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  {tourStep === totalSteps - 1 ? 'Finish' : 'Next'}
                  {tourStep < totalSteps - 1 && <ChevronRight size={14} className="inline ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="w-full max-w-md border-2 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <div className="text-center mb-6">
          <div
            className="inline-block p-4 rounded-full border-2 border-[#3E2723] mb-4"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Admin Login</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
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
          <div ref={usernameRef}>
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={User}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div ref={passwordRef}>
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
          </div>

          <div ref={loginBtnRef}>
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              variant="primary"
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
          </div>
        </form>

        <div className="mt-6 border-t border-[#3E2723]/20 pt-4">
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            Demo credentials:{' '}
            <button
              ref={demoBtnRef}
              type="button"
              onClick={fillDemoCredentials}
              className="font-mono font-medium underline-offset-2 hover:underline transition cursor-pointer"
              style={{ color: 'var(--text-color)' }}
            >
              demo / demo123
            </button>
            <span style={{ color: 'var(--text-secondary)' }} className="ml-1">(click to auto‑fill)</span>
          </p>
        </div>

        <p ref={createAccountRef} className="text-xs text-center mt-3" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="hover:underline font-medium" style={{ color: 'var(--primary-color)' }}>
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;