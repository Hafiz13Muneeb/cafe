// src/pages/AdminLogin.jsx - Redirect if already logged in
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const AdminLogin = () => {
  const { user, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const loginBtnRef = useRef(null);

  useEffect(() => {
    const hasToken = localStorage.getItem('adminToken');
    const hasUserData = localStorage.getItem('adminData');
    const hasCookie = document.cookie.split(';').some((c) => c.trim().startsWith('token='));
    const tourShown = localStorage.getItem('tourShown');

    if (hasToken || hasUserData || hasCookie || tourShown) {
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
      const result = await login(username.trim(), password.trim());
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Tour steps
  const tourSteps = [
    { target: usernameRef, icon: User, title: 'Enter Your Username', description: 'Type your cafe username.' },
    { target: passwordRef, icon: Lock, title: 'Enter Your Password', description: 'Your password is securely stored.' },
    { target: loginBtnRef, icon: CheckCircle, title: 'Login to Dashboard', description: 'Click here to access your admin panel.' },
  ];

  const totalSteps = tourSteps.length;
  const currentStepData = tourSteps[tourStep];

  const handleNext = () => {
    if (tourStep < totalSteps - 1) setTourStep(tourStep + 1);
    else { localStorage.setItem('tourShown', 'true'); setShowTour(false); }
  };
  const handleSkip = () => { localStorage.setItem('tourShown', 'true'); setShowTour(false); };
  const handlePrev = () => { if (tourStep > 0) setTourStep(tourStep - 1); };

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
    const tooltipHeight = 220;
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-color)] relative">
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
              boxShadow: `0 0 0 4px var(--primary-color), 0 0 20px rgba(var(--primary-color-rgb, 212, 168, 67), 0.6)`,
              transition: 'all 0.3s ease'
            }}
          />
          <div
            className="absolute bg-[var(--card-bg)] border-4 border-[var(--border-color)] p-5 max-w-xs w-72 pointer-events-auto"
            style={{
              top: tooltipStyle.top,
              left: tooltipStyle.left,
              transform: tooltipStyle.transform || 'none',
              boxShadow: '8px 8px 0px 0px var(--primary-color)'
            }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition ${idx === tourStep ? 'bg-primary' : 'bg-[var(--bg-color)]'}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-primary rounded-full border-2 border-[var(--border-color)]">
                <currentStepData.icon size={18} className="text-white" />
              </div>
              <h3 className="font-bold text-[var(--text-color)] text-base">{currentStepData.title}</h3>
            </div>
            <p className="text-sm text-[var(--text-color)]/70 mb-4">{currentStepData.description}</p>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={tourStep === 0}
                className={`text-sm font-bold transition ${tourStep === 0 ? 'text-[var(--text-color)]/30 cursor-not-allowed' : 'text-[var(--text-color)] hover:text-primary'}`}
              >
                Back
              </button>
              <div className="flex gap-2">
                <button onClick={handleSkip} className="text-xs font-bold text-[var(--text-color)]/50 hover:text-[var(--text-color)] transition">
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-primary text-white font-bold border-2 border-[var(--border-color)] shadow-[3px_3px_0px_0px_var(--border-color)] hover:shadow-none transition text-xs"
                >
                  {tourStep === totalSteps - 1 ? 'Finish' : 'Next'}
                  {tourStep < totalSteps - 1 && <ChevronRight size={14} className="inline ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-[var(--card-bg)] border-2 border-[var(--border-color)] shadow-[8px_8px_0px_0px_var(--border-color)] p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-full bg-primary border-2 border-[var(--border-color)] mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-color)]">Admin Login</h1>
          <p className="text-xs sm:text-sm text-[var(--text-color)]/60 mt-1">Enter your credentials to access the dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 font-bold flex items-center gap-2 text-sm sm:text-base">
            <AlertCircle size={18} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div ref={usernameRef}>
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} leftIcon={User} required disabled={loading} autoComplete="username" />
          </div>
          <div ref={passwordRef}>
            <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" leftIcon={Lock} required disabled={loading} autoComplete="current-password" />
          </div>
          <div ref={loginBtnRef}>
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> Logging in...
                </>
              ) : 'Login'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;