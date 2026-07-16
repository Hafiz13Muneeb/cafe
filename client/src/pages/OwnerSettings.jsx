// src/pages/OwnerSettings.jsx - Modularized with child components
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { Settings, Lock, Palette } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import CafeSettings from '../components/settings/CafeSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import SecuritySettings from '../components/settings/SecuritySettings';

const OwnerSettings = () => {
  const { user, updateUserData, changePassword } = useAuth();
  const { theme, updateTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('cafe');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- Shared states ---
  const [cafeName, setCafeName] = useState(user?.cafeName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');
  const [tables, setTables] = useState((user?.tables || []).join(', '));
  const [slug, setSlug] = useState(user?.slug || '');
  const [email, setEmail] = useState(user?.email || '');

  const [primaryColor, setPrimaryColor] = useState(user?.theme?.primaryColor || '#d4a843');
  const [secondaryColor, setSecondaryColor] = useState(user?.theme?.secondaryColor || '#b8860b');
  const [mode, setMode] = useState(user?.theme?.mode || 'light');

  const [logoPreview, setLogoPreview] = useState(user?.logoUrl || '');
  const [faviconPreview, setFaviconPreview] = useState(user?.faviconUrl || '');

  // Auto-generate slug when cafeName changes
  useEffect(() => {
    if (cafeName) {
      const generatedSlug = cafeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [cafeName]);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success) {
          const data = res.data.data;
          setCafeName(data.cafeName || '');
          setWhatsappNumber(data.whatsappNumber || '');
          setTables((data.tables || []).join(', '));
          setSlug(data.slug || '');
          setEmail(data.email || '');
          setLogoPreview(data.logoUrl || '');
          setFaviconPreview(data.faviconUrl || '');
          if (data.theme) {
            setPrimaryColor(data.theme.primaryColor || '#d4a843');
            setSecondaryColor(data.theme.secondaryColor || '#b8860b');
            setMode(data.theme.mode || 'light');
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // ----- Helper: Set message and auto-clear -----
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // ----- Cafe Settings Submit -----
  const handleCafeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const trimmedTables = tables
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (trimmedTables.length === 0) {
      showMessage('Please enter at least one table number/name.', 'error');
      setLoading(false);
      return;
    }
    if (!slug) {
      showMessage('Slug is required. Please enter a valid cafe name.', 'error');
      setLoading(false);
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      showMessage('Please enter a valid email address.', 'error');
      setLoading(false);
      return;
    }

    try {
      const payload = { cafeName, whatsappNumber, tables: trimmedTables, slug, email };
      const res = await api.put('/settings', payload);
      if (res.data.success) {
        updateUserData({ cafeName, whatsappNumber, tables: trimmedTables, slug, email });
        showMessage('Cafe settings saved successfully!');
      }
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to save cafe settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ----- Appearance Submit -----
  const handleAppearanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { primaryColor, secondaryColor, mode };
      const res = await api.put('/settings', payload);
      if (res.data.success) {
        updateUserData({ theme: { primaryColor, secondaryColor, mode } });
        updateTheme({ primaryColor, secondaryColor, mode });
        showMessage('Theme saved successfully!');
      }
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to save theme', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ----- Image Upload (Logo / Favicon) -----
  const handleImageUpload = async (file, type, setPreview) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);
    setLoading(true);
    try {
      const res = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const data = res.data.data;
        if (type === 'logo') setPreview(data.logoUrl || '');
        if (type === 'favicon') setPreview(data.faviconUrl || '');
        updateUserData({ logoUrl: data.logoUrl, faviconUrl: data.faviconUrl });
        showMessage(`${type} updated successfully!`);
      }
    } catch (err) {
      showMessage(err.response?.data?.message || `Failed to update ${type}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ----- Security (Password Change) -----
  const handleSecuritySubmit = async (oldPass, newPass, confirmPass, clearFields) => {
    if (newPass !== confirmPass) {
      showMessage('New password and confirmation do not match', 'error');
      return;
    }
    if (newPass.length < 6) {
      showMessage('New password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await changePassword(oldPass, newPass, confirmPass);
      showMessage('Password changed successfully!');
      clearFields();
    } catch (err) {
      showMessage(err.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
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
          className={`mb-4 p-3 border-2 border-[var(--border-color)] font-bold text-sm sm:text-base ${
            message.type === 'success' ? 'bg-primary text-white' : 'bg-red-300 text-[var(--text-color)]'
          }`}
          role="alert"
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-1 bg-[var(--bg-color)] border-2 border-[var(--border-color)] p-1 mb-6">
        {tabItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm sm:text-base font-bold transition-all ${
              activeTab === item.id
                ? 'bg-primary text-white border-2 border-[var(--border-color)]'
                : 'text-[var(--text-color)] hover:bg-[var(--text-color)]/10'
            }`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-[var(--bg-color)] p-4 sm:p-6 border-2 border-[var(--border-color)] min-h-[400px]">
        {activeTab === 'cafe' && (
          <CafeSettings
            cafeName={cafeName}
            setCafeName={setCafeName}
            whatsappNumber={whatsappNumber}
            setWhatsappNumber={setWhatsappNumber}
            tables={tables}
            setTables={setTables}
            slug={slug}
            setSlug={setSlug}
            email={email}
            setEmail={setEmail}
            logoPreview={logoPreview}
            setLogoPreview={setLogoPreview}
            faviconPreview={faviconPreview}
            setFaviconPreview={setFaviconPreview}
            loading={loading}
            onSubmit={handleCafeSubmit}
            onImageUpload={handleImageUpload}
          />
        )}

        {activeTab === 'appearance' && (
          <AppearanceSettings
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
            mode={mode}
            setMode={setMode}
            loading={loading}
            onSubmit={handleAppearanceSubmit}
          />
        )}

        {activeTab === 'security' && (
          <SecuritySettings
            loading={loading}
            onSubmit={handleSecuritySubmit}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnerSettings;