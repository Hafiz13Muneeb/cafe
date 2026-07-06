// src/pages/RegisterCafe.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { User, Mail, Coffee, Lock, AlertCircle, CheckCircle, Send, RefreshCw } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../api/axios';
import toast from 'react-hot-toast';

const RegisterCafe = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    cafeName: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredUsername, setRegisteredUsername] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');
  const timerRef = useRef(null);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username.trim() || !formData.email.trim() || !formData.cafeName.trim() || !formData.password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const registerRes = await api.post('/auth/register', {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        cafeName: formData.cafeName.trim(),
        password: formData.password.trim(),
      });

      if (registerRes.data.success) {
        // Registration succeeded → store credentials and send OTP
        setRegisteredEmail(formData.email.trim().toLowerCase());
        setRegisteredUsername(formData.username.trim());
        setRegisteredPassword(formData.password.trim());
        setSuccess('Account created! Sending verification code...');
        await sendOTP(formData.email.trim().toLowerCase());
        setOtpSent(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Something went wrong.';

      // Handle 429 Too Many Requests
      if (status === 429) {
        setError('Too many registration attempts. Please wait a minute and try again.');
        toast.error('Too many attempts. Please wait.');
        setLoading(false);
        return;
      }

      // Check if user already exists → attempt auto-login
      if (msg.toLowerCase().includes('already taken') || msg.toLowerCase().includes('already exists')) {
        setError('Account already exists. Attempting to log you in...');
        try {
          const loginResult = await dispatch(loginUser({
            username: formData.username.trim(),
            password: formData.password.trim(),
          }));
          if (loginUser.fulfilled.match(loginResult)) {
            toast.success('Welcome back! You are now logged in.');
            const user = loginResult.payload;
            navigate(user?.role === 'superadmin' ? '/admin/super' : '/admin/dashboard');
          } else {
            setError('Incorrect password for existing account. Please try again.');
          }
        } catch (loginErr) {
          setError('Login attempt failed. Please try again.');
        }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send OTP
  const sendOTP = async (email) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await api.post('/auth/send-otp', { email });
      toast.success('Verification code sent to your email.');
      setResendCooldown(60);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      if (status === 429) {
        setOtpError('Too many OTP requests. Please wait a minute before trying again.');
        toast.error('Too many OTP requests. Please wait.');
      } else {
        setOtpError(msg);
        toast.error(msg);
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError('Please enter a valid 6-digit code.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      await api.post('/auth/verify-otp', {
        email: registeredEmail,
        otp: otp.trim(),
      });
      setOtpVerified(true);
      toast.success('Email verified successfully!');

      // Now log the user in and go to onboarding
      const loginResult = await dispatch(loginUser({
        username: registeredUsername,
        password: registeredPassword,
      }));
      if (loginUser.fulfilled.match(loginResult)) {
        toast.success('Welcome! Please complete your cafe setup.');
        setTimeout(() => navigate('/onboarding'), 500);
      } else {
        // Should not happen, but fallback
        setTimeout(() => navigate('/admin'), 2000);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      if (status === 429) {
        setOtpError('Too many verification attempts. Please wait a minute.');
        toast.error('Too many attempts. Please wait.');
      } else {
        setOtpError(msg);
        toast.error(msg);
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 4: Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await sendOTP(registeredEmail);
  };

  // If OTP step is active, show OTP form
  if (otpSent && !otpVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F5F5DC]">
        <div className="w-full max-w-md bg-white border-2 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-block p-4 rounded-full bg-[#8A9A5B] border-2 border-[#3E2723] mb-4">
              <Mail size={32} className="text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3E2723]">Verify Your Email</h2>
            <p className="text-sm text-[#3E2723]/60 mt-1">
              We sent a 6‑digit code to <strong>{registeredEmail}</strong>
            </p>
          </div>

          {otpError && (
            <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 font-bold flex items-center gap-2 text-sm sm:text-base">
              <AlertCircle size={18} />
              <span>{otpError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-4">
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
              disabled={otpLoading}
              className="bg-[#8A9A5B] border-2 border-[#3E2723] text-white hover:bg-[#78884d]"
            >
              {otpLoading ? 'Verifying...' : (
                <>
                  <Send size={16} className="inline mr-2" /> Verify
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || otpLoading}
              className={`text-sm font-medium transition ${
                resendCooldown > 0 || otpLoading
                  ? 'text-[#3E2723]/40 cursor-not-allowed'
                  : 'text-[#8A9A5B] hover:underline'
              }`}
            >
              <RefreshCw size={14} className={`inline mr-1 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>

          <div className="mt-4 border-t border-[#3E2723]/20 pt-4">
            <p className="text-xs text-center text-[#3E2723]/40">
              <Link to="/admin" className="text-[#8A9A5B] hover:underline">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F5F5DC]">
      <div className="w-full max-w-md bg-white border-2 border-[#3E2723] shadow-[8px_8px_0px_0px_#3E2723] p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-block p-4 rounded-full bg-[#8A9A5B] border-2 border-[#3E2723] mb-4">
            <Coffee size={32} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#3E2723]">Create Your Cafe</h1>
          <p className="text-xs sm:text-sm text-[#3E2723]/60 mt-1">Start your digital menu journey today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 font-bold flex items-center gap-2 text-sm sm:text-base">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 border-2 border-green-500 bg-green-100 text-green-700 font-bold flex items-center gap-2 text-sm sm:text-base">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            leftIcon={User}
            required
            placeholder="Choose a username"
            autoComplete="username"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            leftIcon={Mail}
            required
            placeholder="your@email.com"
            autoComplete="email"
          />
          <Input
            label="Cafe Name"
            name="cafeName"
            value={formData.cafeName}
            onChange={handleChange}
            leftIcon={Coffee}
            required
            placeholder="My Awesome Cafe"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            leftIcon={Lock}
            required
            placeholder="Min 6 characters"
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            leftIcon={Lock}
            required
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            className="bg-[#8A9A5B] border-2 border-[#3E2723] text-white hover:bg-[#78884d]"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 border-t border-[#3E2723]/20 pt-4">
          <p className="text-xs text-center text-[#3E2723]/40">
            Already have an account?{' '}
            <Link to="/admin" className="text-[#8A9A5B] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterCafe;