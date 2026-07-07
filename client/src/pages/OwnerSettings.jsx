// src/pages/OwnerSettings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUser, updateUser } from '../store/slices/authSlice';
import { selectTheme, updateTheme as updateThemeAction } from '../store/slices/themeSlice';
import api from '../api/axios';
import { Settings, Lock, Palette, Upload, Save, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const OwnerSettings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const theme = useSelector(selectTheme);

  // ✅ Check if user has an active paid subscription
  const isPaid = user?.subscription?.plan === 'paid' && user?.subscription?.status === 'active';

  const [activeTab, setActiveTab] = useState('cafe');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [cafeName, setCafeName] = useState(user?.cafeName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [tables, setTables] = useState((user?.tables || []).join(', '));
  const [currency, setCurrency] = useState(user?.currency || 'Rs');

  const [primaryColor, setPrimaryColor] = useState(theme?.primaryColor || '#d4a843');
  const [secondaryColor, setSecondaryColor] = useState(theme?.secondaryColor || '#b8860b');
  const [mode, setMode] = useState(theme?.mode || 'light');

  const [logoPreview, setLogoPreview] = useState(user?.logoUrl || '');
  const [faviconPreview, setFaviconPreview] = useState(user?.faviconUrl || '');
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Ref to prevent concurrent theme saves
  const isSavingRef = useRef(false);

  // Fetch current settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success) {
          const data = res.data.data;
          setCafeName(data.cafeName || '');
          setWhatsappNumber(data.whatsappNumber || '');
          setTables((data.tables || []).join(', '));
          setLogoPreview(data.logoUrl || '');
          setFaviconPreview(data.faviconUrl || '');
          setCurrency(data.currency || 'Rs');
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Sync with Redux
  useEffect(() => {
    if (user?.theme) {
      setPrimaryColor(user.theme.primaryColor || '#d4a843');
      setSecondaryColor(user.theme.secondaryColor || '#b8860b');
      setMode(user.theme.mode || 'light');
    }
    if (user?.currency) setCurrency(user.currency);
    if (user?.cafeName) setCafeName(user.cafeName);
    if (user?.whatsappNumber !== undefined) setWhatsappNumber(user.whatsappNumber);
    if (user?.tables) setTables(user.tables.join(', '));
    if (user?.logoUrl !== undefined) setLogoPreview(user.logoUrl);
    if (user?.faviconUrl !== undefined) setFaviconPreview(user.faviconUrl);
  }, [user]);

  useEffect(() => {
    if (theme) {
      setPrimaryColor(theme.primaryColor || '#d4a843');
      setSecondaryColor(theme.secondaryColor || '#b8860b');
      setMode(theme.mode || 'light');
    }
  }, [theme]);

  // ----- Cafe Settings Submit -----
  const handleCafeSubmit = async (e) => {
    e.preventDefault();
    // If not paid, just show a message (though button is disabled, safety check)
    if (!isPaid) {
      setMessage({ text: 'Upgrade to a paid plan to save cafe settings.', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const trimmedTables = tables
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (trimmedTables.length === 0) {
        setMessage({ text: 'Please enter at least one table number/name.', type: 'error' });
        setLoading(false);
        return;
      }

      const trimmedCurrency = currency.trim();
      if (!trimmedCurrency || trimmedCurrency.length === 0) {
        setMessage({ text: 'Currency symbol cannot be empty.', type: 'error' });
        setLoading(false);
        return;
      }
      if (trimmedCurrency.length > 10) {
        setMessage({ text: 'Currency symbol must be 10 characters or less.', type: 'error' });
        setLoading(false);
        return;
      }

      const payload = {
        cafeName,
        whatsappNumber,
        tables: trimmedTables,
        currency: trimmedCurrency,
      };

      const res = await api.put('/settings', payload);
      if (res.data.success) {
        const updatedData = {
          cafeName,
          whatsappNumber,
          tables: trimmedTables,
          currency: trimmedCurrency,
        };
        dispatch(updateUser(updatedData));
        setMessage({ text: 'Settings saved successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ----- Theme Settings Submit (with debounce & rate-limit handling) -----
  const handleThemeSubmit = async (e) => {
    e?.preventDefault();

    // ✅ Prevent concurrent requests
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    console.log('🟢 Theme submit called – URL: /settings/theme');
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        primaryColor,
        secondaryColor,
        mode,
      };
      const res = await api.put('/settings/theme', payload);
      if (res.data.success) {
        dispatch(updateThemeAction({ primaryColor, secondaryColor, mode }));
        setMessage({ text: 'Theme updated successfully!', type: 'success' });
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Failed to update theme';

      if (status === 429) {
        setMessage({ text: 'Too many requests. Please wait a moment before trying again.', type: 'error' });
      } else if (status === 403) {
        setMessage({ text: 'Theme customization requires a paid subscription. Please upgrade.', type: 'error_subscription' });
      } else {
        setMessage({ text: msg, type: 'error' });
      }
    } finally {
      setLoading(false);
      isSavingRef.current = false; // ✅ allow next request
    }
  };

  // ----- Image Upload -----
  const handleImageUpload = async (file, type) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);
    try {
      setLoading(true);
      const res = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const data = res.data.data;
        if (type === 'logo') setLogoPreview(data.logoUrl || '');
        if (type === 'favicon') setFaviconPreview(data.faviconUrl || '');
        dispatch(updateUser({ logoUrl: data.logoUrl, faviconUrl: data.faviconUrl }));
        setMessage({ text: `${type} updated successfully!`, type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || `Failed to update ${type}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ----- Password Change -----
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

  const handleTablesBlur = () => {
    const trimmed = tables
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .join(', ');
    setTables(trimmed);
  };

  const tabItems = [
    { id: 'cafe', label: 'Cafe Settings', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <DashboardLayout title="Settings" subtitle={user?.cafeName}>
      {message.text && (
        <div
          className={`mb-4 p-3 border-2 border-[#3E2723] font-bold text-sm sm:text-base ${
            message.type === 'success' ? 'text-white' : ''
          }`}
          style={
            message.type === 'success'
              ? { backgroundColor: 'var(--primary-color)' }
              : { backgroundColor: '#fca5a5', color: 'var(--text-color)' }
          }
          role="alert"
          aria-live="polite"
        >
          <span>{message.text}</span>
          {message.type === 'error_subscription' && (
            <Link
              to="/admin/subscription"
              className="ml-3 underline font-bold hover:opacity-80 transition"
              style={{ color: 'var(--primary-color)' }}
            >
              Upgrade Now →
            </Link>
          )}
        </div>
      )}

      <div
        className="flex flex-wrap gap-1 border-2 border-[#3E2723] p-1 mb-6"
        style={{ backgroundColor: 'var(--secondary-color)' }}
      >
        {tabItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm sm:text-base font-bold transition-all border-2"
            style={{
              backgroundColor: activeTab === item.id ? 'var(--primary-color)' : 'transparent',
              color: activeTab === item.id ? '#ffffff' : 'var(--text-color)',
              borderColor: activeTab === item.id ? '#3E2723' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) {
                e.target.style.backgroundColor = 'rgba(var(--primary-color-rgb), 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div
        className="p-4 sm:p-6 border-2 border-[#3E2723] min-h-[400px]"
        style={{ backgroundColor: 'var(--bg-color)' }}
      >
        {/* CAFE TAB */}
        {activeTab === 'cafe' && (
          <form onSubmit={handleCafeSubmit} className="space-y-4">
            <Input
              label="Cafe Name"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              required
            />
            <Input
              label="WhatsApp Number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 03001234567"
              required
            />
            <Input
              label="Table Numbers / Names"
              value={tables}
              onChange={(e) => setTables(e.target.value)}
              onBlur={handleTablesBlur}
              placeholder="1, 2, 3, 4, 5 (comma separated)"
              required
            />
            <Input
              label="Currency Symbol"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="e.g. Rs, $, €"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }} htmlFor="logoUpload">
                  Logo
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Cafe logo preview"
                      className="w-12 h-12 border-2 border-[#3E2723] object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={logoInputRef}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleImageUpload(e.target.files[0], 'logo');
                      }
                    }}
                    className="hidden"
                    id="logoUpload"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => logoInputRef.current.click()}
                    className="text-sm sm:text-base"
                  >
                    <Upload size={16} className="inline mr-1" /> Upload Logo
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-color)' }} htmlFor="faviconUpload">
                  Favicon
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {faviconPreview && (
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="w-10 h-10 border-2 border-[#3E2723] object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={faviconInputRef}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleImageUpload(e.target.files[0], 'favicon');
                      }
                    }}
                    className="hidden"
                    id="faviconUpload"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => faviconInputRef.current.click()}
                    className="text-sm sm:text-base"
                  >
                    <Upload size={16} className="inline mr-1" /> Upload Favicon
                  </Button>
                </div>
              </div>
            </div>

            {/* ✅ Cafe Save Button – Disabled for free users */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !isPaid}
                className="w-full sm:w-auto"
                title={!isPaid ? 'Upgrade to a paid plan to save cafe settings' : ''}
              >
                <Save size={16} className="inline mr-1" />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
              {!isPaid && (
                <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Lock size={14} /> Upgrade to save changes
                </span>
              )}
            </div>
          </form>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="primaryColor">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="secondaryColor">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Mode</label>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {['light', 'dark'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className="px-3 sm:px-4 py-2 border-2 border-[#3E2723] font-bold transition text-sm sm:text-base"
                    style={{
                      backgroundColor: mode === m ? 'var(--primary-color)' : 'var(--card-bg)',
                      color: mode === m ? '#ffffff' : 'var(--text-color)',
                    }}
                    onMouseEnter={(e) => {
                      if (mode !== m) {
                        e.target.style.backgroundColor = 'var(--secondary-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (mode !== m) {
                        e.target.style.backgroundColor = 'var(--card-bg)';
                      }
                    }}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="primary"
              disabled={loading}
              onClick={handleThemeSubmit}
              className="w-full sm:w-auto"
            >
              <Save size={16} className="inline mr-1" /> {loading ? 'Saving...' : 'Save Theme'}
            </Button>
          </div>
        )}

        {/* SECURITY TAB */}
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
                className="absolute right-3 top-9"
                style={{ color: 'var(--text-color)' }}
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
                className="absolute right-3 top-9"
                style={{ color: 'var(--text-color)' }}
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
                className="absolute right-3 top-9"
                style={{ color: 'var(--text-color)' }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerSettings;