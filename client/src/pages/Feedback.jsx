// src/pages/Feedback.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';
import { Mail, MessageSquare, Send, RefreshCw, AlertCircle, CheckCircle, Coffee } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Feedback = () => {
  const user = useSelector(selectUser);
  const isLoggedIn = !!user;

  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendCooldown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter your feedback message.');
      return;
    }
    setOtpLoading(true);
    try {
      await api.post('/feedback/send-otp', { email: email.trim().toLowerCase() });
      toast.success('OTP sent to your email.');
      setOtpSent(true);
      setResendCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!message.trim()) {
      setError('Please enter your feedback message.');
      return;
    }
    if (!isLoggedIn) {
      if (!otp.trim() || otp.trim().length !== 6) {
        setError('Please enter a valid 6-digit OTP.');
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        message: message.trim(),
        type,
      };
      if (!isLoggedIn) {
        payload.otp = otp.trim();
      }
      await api.post('/feedback/submit', payload);
      setSuccess('Feedback submitted successfully! Thank you.');
      toast.success('Feedback submitted!');
      setMessage('');
      setOtp('');
      if (!isLoggedIn) {
        setEmail('');
        setOtpSent(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit feedback. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    try {
      await api.post('/feedback/send-otp', { email: email.trim().toLowerCase() });
      toast.success('OTP resent.');
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      <div
        className="w-full max-w-lg border-2 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <div className="text-center mb-6">
          <div
            className="inline-block p-4 rounded-full border-2 border-[#3E2723] mb-4"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <Coffee size={32} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
            Send Feedback
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isLoggedIn
              ? 'You are logged in. Submit feedback directly.'
              : 'We value your feedback. Please share your thoughts with us.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 font-bold flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 border-2 border-green-500 bg-green-100 text-green-700 font-bold flex items-center gap-2 text-sm">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {isLoggedIn ? (
          // Logged‑in flow: no OTP
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div
              className="p-3 border-2 border-[#3E2723] text-sm"
              style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
            >
              <p className="font-bold">Logged in as:</p>
              <p className="font-mono">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                Message *
              </label>
              <textarea
                className="w-full px-3 py-2 border-2 focus:outline-none"
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your feedback..."
                required
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-color)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <option value="general">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="complaint">Complaint</option>
                <option value="suggestion">Suggestion</option>
              </select>
            </div>
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              variant="primary"
            >
              {loading ? 'Submitting...' : (
                <>
                  <MessageSquare size={16} className="inline mr-2" /> Submit Feedback
                </>
              )}
            </Button>
          </form>
        ) : (
          // Guest flow: email + OTP
          <>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <Input
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={Mail}
                  required
                  placeholder="your@email.com"
                  type="email"
                  autoComplete="email"
                />
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                    Message *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border-2 focus:outline-none"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your feedback..."
                    required
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-color)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <option value="general">General</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  fullWidth
                  disabled={otpLoading}
                  variant="primary"
                >
                  {otpLoading ? 'Sending...' : (
                    <>
                      <Send size={16} className="inline mr-2" /> Send OTP
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div
                  className="p-3 border-2 border-[#3E2723] text-sm"
                  style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
                >
                  <p className="font-bold">A 6-digit code was sent to:</p>
                  <p className="font-mono">{email}</p>
                </div>
                <Input
                  label="Verification Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                />
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  variant="primary"
                >
                  {loading ? 'Submitting...' : (
                    <>
                      <MessageSquare size={16} className="inline mr-2" /> Submit Feedback
                    </>
                  )}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || otpLoading}
                    className="text-sm font-medium transition"
                    style={{
                      color: resendCooldown > 0 || otpLoading ? 'var(--text-secondary)' : 'var(--primary-color)',
                      cursor: resendCooldown > 0 || otpLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <RefreshCw size={14} className={`inline mr-1 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setError(''); setSuccess(''); }}
                    className="text-xs transition"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--text-color)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    Change email and retry
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="mt-6 border-t pt-4 text-center" style={{ borderColor: 'var(--border-color)' }}>
          <Link
            to="/"
            className="text-xs transition"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Feedback;