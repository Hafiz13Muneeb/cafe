// src/pages/SuperAdminSettings.jsx - Complete superadmin settings with profile, security, and global theme
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { User, Lock, Palette, Save, Upload, Eye, EyeOff } from 'lucide-react';
import SettingsLayout from '../components/layout/SettingsLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const SuperAdminSettings = () => {
  const { user, updateUserData } = useAuth();
  const { theme, updateTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [globalTheme, setGlobalTheme] = useState({
    primaryColor: '#d4a843',
    secondaryColor: '#b8860b',
    mode: 'light',
    faviconUrl: '',
  });
  const faviconInputRef = useRef(null);
  const [faviconPreview, setFaviconPreview] = useState('');

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const res = await api.get('/settings/global');
        if (res.data.success) {
          const data = res.data.data;
          setGlobalTheme({
            primaryColor: data.primaryColor || '#d4a843',
            secondaryColor: data.secondaryColor || '#b8860b',
            mode: data.mode || 'light',
            faviconUrl: data.faviconUrl || '',
          });
          setFaviconPreview(data.faviconUrl || '');
        }
      } catch (err) {
        console.error('Failed to fetch global settings:', err);
      }
    };
    fetchGlobalSettings();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put('/auth/update-profile', { username, email });
      if (res.data.success) {
        updateUserData({ username, email });
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New password and confirmation do not match', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/auth/change-password', { oldPassword, newPassword, confirmPassword });
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to change password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const payload = {
        primaryColor: globalTheme.primaryColor,
        secondaryColor: globalTheme.secondaryColor,
        mode: globalTheme.mode,
      };
      const res = await api.put('/settings/global', payload);
      if (res.data.success) {
        updateTheme({ primaryColor: payload.primaryColor, secondaryColor: payload.secondaryColor, mode: payload.mode });
        setMessage({ text: 'Theme updated successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update theme', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFaviconUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('favicon', file);
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put('/settings/global/favicon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const url = res.data.data.faviconUrl;
        setFaviconPreview(url);
        setGlobalTheme(prev => ({ ...prev, faviconUrl: url }));
        updateTheme({ faviconUrl: url });
        setMessage({ text: 'Favicon updated successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update favicon', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <SettingsLayout title="Settings" subtitle="SuperAdmin" navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="bg-[#F5F5DC] p-4 sm:p-6 border-2 border-[#3E2723] min-h-[400px]">
        {message.text && (
          <div className={`mb-4 p-3 border-2 border-[#3E2723] font-bold text-sm sm:text-base ${message.type === 'success' ? 'bg-[#8A9A5B] text-white' : 'bg-red-300 text-[#3E2723]'}`}>
            {message.text}
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
              <Save size={16} className="inline mr-1" /> {loading ? 'Saving...' : 'Update Profile'}
            </Button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <Input
                label="Current Password"
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-9 text-[#3E2723]"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <Input
                label="New Password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-9 text-[#3E2723]"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-9 text-[#3E2723]"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        )}

        {activeTab === 'appearance' && (
          <form onSubmit={handleThemeSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#3E2723] mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={globalTheme.primaryColor}
                    onChange={(e) => setGlobalTheme({ ...globalTheme, primaryColor: e.target.value })}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                  />
                  <Input value={globalTheme.primaryColor} onChange={(e) => setGlobalTheme({ ...globalTheme, primaryColor: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#3E2723] mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={globalTheme.secondaryColor}
                    onChange={(e) => setGlobalTheme({ ...globalTheme, secondaryColor: e.target.value })}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                  />
                  <Input value={globalTheme.secondaryColor} onChange={(e) => setGlobalTheme({ ...globalTheme, secondaryColor: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#3E2723] mb-1">Mode</label>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {['light', 'dark'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setGlobalTheme({ ...globalTheme, mode: m })}
                    className={`px-3 sm:px-4 py-2 border-2 border-[#3E2723] font-bold transition text-sm sm:text-base ${
                      globalTheme.mode === m ? 'bg-[#8A9A5B] text-white' : 'bg-white text-[#3E2723]'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#3E2723] mb-1">Global Favicon</label>
              <div className="flex flex-wrap items-center gap-3">
                {faviconPreview && <img src={faviconPreview} alt="Favicon" className="w-10 h-10 border-2 border-[#3E2723] object-cover" />}
                <input
                  type="file"
                  accept="image/*"
                  ref={faviconInputRef}
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFaviconUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <Button type="button" variant="secondary" onClick={() => faviconInputRef.current.click()} className="text-sm sm:text-base">
                  <Upload size={16} className="inline mr-1" /> Upload Favicon
                </Button>
              </div>
            </div>

            <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
              <Save size={16} className="inline mr-1" /> {loading ? 'Saving...' : 'Save Theme'}
            </Button>
          </form>
        )}
      </div>
    </SettingsLayout>
  );
};

export default SuperAdminSettings;