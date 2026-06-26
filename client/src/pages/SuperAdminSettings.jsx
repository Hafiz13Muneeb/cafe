// src/pages/SuperAdminSettings.jsx - SuperAdmin settings (profile, theme)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { LogOut, Save, KeyRound, Palette, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const SuperAdminSettings = () => {
  const { user, logout, updateUserData } = useAuth();
  const { theme, updateTheme, loadGlobalSettings } = useTheme();
  const navigate = useNavigate();

  // Profile state
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Theme state
  const [globalTheme, setGlobalTheme] = useState({
    primaryColor: theme?.primaryColor || '#d4a843',
    secondaryColor: theme?.secondaryColor || '#b8860b',
    mode: theme?.mode || 'light',
  });
  const [themeLoading, setThemeLoading] = useState(false);
  const [themeError, setThemeError] = useState('');
  const [themeSuccess, setThemeSuccess] = useState('');

  // Load global theme on mount (if not already loaded)
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await api.get('/settings/global');
        if (response.data.success) {
          setGlobalTheme(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch global theme:', err);
      }
    };
    fetchTheme();
  }, []);

  // --- Profile handlers ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setProfileError('');
    setProfileSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const response = await api.put('/auth/update-profile', {
        username: profile.username,
        email: profile.email,
      });
      if (response.data.success) {
        const updatedUser = response.data.data;
        updateUserData(updatedUser);
        setProfileSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // --- Password handlers ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const response = await api.put('/auth/change-password', passwordForm);
      if (response.data.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- Theme handlers ---
  const handleThemeChange = (e) => {
    const { name, value } = e.target;
    setGlobalTheme(prev => ({ ...prev, [name]: value }));
    setThemeError('');
    setThemeSuccess('');
  };

  const handleThemeSubmit = async (e) => {
    e.preventDefault();
    setThemeLoading(true);
    setThemeError('');
    setThemeSuccess('');
    try {
      const response = await api.put('/settings/global', globalTheme);
      if (response.data.success) {
        setThemeSuccess('Global theme updated successfully!');
        updateTheme(globalTheme);
        await loadGlobalSettings();
      }
    } catch (err) {
      setThemeError(err.response?.data?.message || 'Failed to update global theme');
    } finally {
      setThemeLoading(false);
    }
  };

  // --- Logout ---
  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Settings</h1>
            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>SuperAdmin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/super')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Dashboard"
            >
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Dashboard</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={22} style={{ color: 'var(--primary-color)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Profile Settings</h2>
            </div>
            {profileError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{profileSuccess}</span>
              </div>
            )}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleProfileChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={profileLoading}
                className="px-4 py-2 text-white rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <Save size={18} />
                {profileLoading ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={22} style={{ color: 'var(--primary-color)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Change Password</h2>
            </div>
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-2 text-white rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Global Theme Settings */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={22} style={{ color: 'var(--primary-color)' }} />
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Global Theme</h2>
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>App-wide</span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Changes here affect the entire application – all dashboards, customer menu, and login page.
            </p>
            {themeError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{themeError}</span>
              </div>
            )}
            {themeSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{themeSuccess}</span>
              </div>
            )}
            <form onSubmit={handleThemeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Primary Color</label>
                  <input
                    type="color"
                    name="primaryColor"
                    value={globalTheme.primaryColor}
                    onChange={handleThemeChange}
                    className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
                  <input
                    type="color"
                    name="secondaryColor"
                    value={globalTheme.secondaryColor}
                    onChange={handleThemeChange}
                    className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Theme Mode</label>
                  <select
                    name="mode"
                    value={globalTheme.mode}
                    onChange={handleThemeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={themeLoading}
                className="px-4 py-2 text-white rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {themeLoading ? 'Saving...' : 'Apply Global Theme'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;