// src/pages/OwnerSettings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

  // Sync local state with Redux when user/theme changes
  useEffect(() => {
    if (user?.theme) {
      setPrimaryColor(user.theme.primaryColor || '#d4a843');
      setSecondaryColor(user.theme.secondaryColor || '#b8860b');
      setMode(user.theme.mode || 'light');
    }
    if (user?.currency) {
      setCurrency(user.currency);
    }
    if (user?.cafeName) {
      setCafeName(user.cafeName);
    }
    if (user?.whatsappNumber !== undefined) {
      setWhatsappNumber(user.whatsappNumber);
    }
    if (user?.tables) {
      setTables(user.tables.join(', '));
    }
    if (user?.logoUrl !== undefined) {
      setLogoPreview(user.logoUrl);
    }
    if (user?.faviconUrl !== undefined) {
      setFaviconPreview(user.faviconUrl);
    }
  }, [user]);

  // Also sync theme from Redux
  useEffect(() => {
    if (theme) {
      setPrimaryColor(theme.primaryColor || '#d4a843');
      setSecondaryColor(theme.secondaryColor || '#b8860b');
      setMode(theme.mode || 'light');
    }
  }, [theme]);

  const handleCafeSubmit = async (e) => {
    e.preventDefault();
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
        primaryColor,
        secondaryColor,
        mode,
      };
      const res = await api.put('/settings', payload);
      if (res.data.success) {
        const updatedData = {
          cafeName,
          whatsappNumber,
          tables: trimmedTables,
          currency: trimmedCurrency,
          theme: { primaryColor, secondaryColor, mode },
        };
        // ✅ Dispatch Redux actions instead of context functions
        dispatch(updateUser(updatedData));
        dispatch(updateThemeAction({ primaryColor, secondaryColor, mode }));
        setMessage({ text: 'Settings saved successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
            message.type === 'success' ? 'bg-[#8A9A5B] text-white' : 'bg-red-300 text-[#3E2723]'
          }`}
          role="alert"
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-1 bg-[#EAE0C8] border-2 border-[#3E2723] p-1 mb-6">
        {tabItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm sm:text-base font-bold transition-all ${
              activeTab === item.id
                ? 'bg-[#8A9A5B] text-white border-2 border-[#3E2723]'
                : 'text-[#3E2723] hover:bg-[#3E2723]/10'
            }`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-[#F5F5DC] p-4 sm:p-6 border-2 border-[#3E2723] min-h-[400px]">
        {activeTab === 'cafe' && (
          <form onSubmit={handleCafeSubmit} className="space-y-4">
            <Input
              label="Cafe Name"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              required
              aria-label="Cafe name"
            />
            <Input
              label="WhatsApp Number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 03001234567"
              required
              aria-label="WhatsApp number"
            />
            <Input
              label="Table Numbers / Names"
              value={tables}
              onChange={(e) => setTables(e.target.value)}
              onBlur={handleTablesBlur}
              placeholder="1, 2, 3, 4, 5 (comma separated)"
              required
              aria-label="Table numbers or names"
            />
            <Input
              label="Currency Symbol"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="e.g. Rs, $, €"
              required
              aria-label="Currency symbol"
              helpText="This currency will be used for displaying prices on your public menu."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="logoUpload">
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
                    aria-label="Upload logo"
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
                <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="faviconUpload">
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
                    aria-label="Upload favicon"
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

            <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
              <Save size={16} className="inline mr-1" /> {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        )}

        {activeTab === 'appearance' && (
          <form onSubmit={handleCafeSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="primaryColor">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                    aria-label="Primary color picker"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                    aria-label="Primary color hex"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#3E2723] mb-1" htmlFor="secondaryColor">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 p-0 border-2 border-[#3E2723] cursor-pointer"
                    aria-label="Secondary color picker"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                    aria-label="Secondary color hex"
                  />
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
                    onClick={() => setMode(m)}
                    className={`px-3 sm:px-4 py-2 border-2 border-[#3E2723] font-bold transition text-sm sm:text-base ${
                      mode === m ? 'bg-[#8A9A5B] text-white' : 'bg-white text-[#3E2723]'
                    }`}
                    aria-label={`Switch to ${m} mode`}
                    aria-pressed={mode === m}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
              <Save size={16} className="inline mr-1" /> {loading ? 'Saving...' : 'Save Theme'}
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
                aria-label="Current password"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-9 text-[#3E2723]"
                aria-label={showOld ? 'Hide password' : 'Show password'}
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
                aria-label="New password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-9 text-[#3E2723]"
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
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
                aria-label="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-9 text-[#3E2723]"
                aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'}
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