// src/pages/OnboardingSetup.jsx - First-time setup wizard for cafe owner
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { Coffee, Save, Upload, X } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const OnboardingSetup = () => {
  const { user, updateUserData } = useAuth();
  const { updateTheme } = useTheme();
  const navigate = useNavigate();

  // Form state
  const [cafeName, setCafeName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [tables, setTables] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#d4a843');
  const [secondaryColor, setSecondaryColor] = useState('#b8860b');
  const [mode, setMode] = useState('light');

  // Image states
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  // Auto-generate slug from cafeName
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFaviconPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const removeFavicon = () => {
    setFaviconFile(null);
    setFaviconPreview('');
    if (faviconInputRef.current) faviconInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate required fields
    if (!cafeName.trim()) {
      setError('Cafe name is required');
      setLoading(false);
      return;
    }
    if (!whatsappNumber.trim() || !/^[0-9]{10,15}$/.test(whatsappNumber.trim())) {
      setError('Please enter a valid WhatsApp number (10-15 digits)');
      setLoading(false);
      return;
    }
    const tableArray = tables
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (tableArray.length === 0) {
      setError('Please enter at least one table number/name');
      setLoading(false);
      return;
    }

    // Generate slug from cafe name
    const slug = generateSlug(cafeName.trim());

    try {
      const formData = new FormData();
      formData.append('cafeName', cafeName.trim());
      formData.append('whatsappNumber', whatsappNumber.trim());
      formData.append('tables', JSON.stringify(tableArray));
      formData.append('slug', slug);
      formData.append('primaryColor', primaryColor);
      formData.append('secondaryColor', secondaryColor);
      formData.append('mode', mode);

      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon', faviconFile);

      const response = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const data = response.data.data;

        const updatedUser = {
          ...user,
          cafeName: data.cafeName,
          whatsappNumber: data.whatsappNumber,
          tables: data.tables || [],
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          slug: data.slug || slug,
          theme: {
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
            mode: mode,
          },
        };
        updateUserData(updatedUser);
        updateTheme({ primaryColor, secondaryColor, mode });

        setSuccess('Setup complete! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F5F5DC] py-8">
      <div className="w-full max-w-2xl bg-white border-4 border-[#3E2723] shadow-primary p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-primary border-2 border-[#3E2723] mb-4">
            <Coffee size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Permanent_Marker'] text-[#3E2723]">
            Welcome to Your Cafe! ☕
          </h1>
          <p className="text-sm sm:text-base text-[#3E2723]/70 mt-1">
            Let's set up your cafe in just a few steps.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 border-2 border-red-500 bg-red-100 text-red-700 font-bold text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 border-2 border-[#3E2723] bg-primary text-white font-bold text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cafe Name */}
          <Input
            label="Cafe Name"
            value={cafeName}
            onChange={(e) => setCafeName(e.target.value)}
            required
            placeholder="Your Cafe Name"
          />

          {/* WhatsApp Number */}
          <Input
            label="WhatsApp Number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            required
            placeholder="03001234567 (10-15 digits)"
          />

          {/* Tables */}
          <Input
            label="Table Numbers / Names"
            value={tables}
            onChange={(e) => setTables(e.target.value)}
            required
            placeholder="1, 2, 3, 4, 5 (comma separated)"
          />

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-bold text-[#3E2723] mb-1">Logo (optional)</label>
            <div className="flex flex-wrap items-center gap-3">
              {logoPreview && (
                <div className="relative w-16 h-16 border-2 border-[#3E2723] overflow-hidden flex-shrink-0">
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                onChange={handleLogoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => logoInputRef.current?.click()}
                className="text-sm"
              >
                <Upload size={16} className="inline mr-1" /> Upload Logo
              </Button>
            </div>
          </div>

          {/* Favicon Upload */}
          <div>
            <label className="block text-sm font-bold text-[#3E2723] mb-1">Favicon (optional)</label>
            <div className="flex flex-wrap items-center gap-3">
              {faviconPreview && (
                <div className="relative w-10 h-10 border-2 border-[#3E2723] overflow-hidden flex-shrink-0">
                  <img src={faviconPreview} alt="Favicon preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeFavicon}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={faviconInputRef}
                onChange={handleFaviconChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => faviconInputRef.current?.click()}
                className="text-sm"
              >
                <Upload size={16} className="inline mr-1" /> Upload Favicon
              </Button>
            </div>
          </div>

          {/* Theme Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#3E2723] mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
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
              <label className="block text-sm font-bold text-[#3E2723] mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
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

          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-bold text-[#3E2723] mb-1">Mode</label>
            <div className="flex gap-3">
              {['light', 'dark'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 border-2 border-[#3E2723] font-bold transition ${
                    mode === m ? 'bg-primary text-white' : 'bg-white text-[#3E2723]'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full justify-center py-3 text-base"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="inline mr-2" /> Complete Setup
              </>
            )}
          </Button>

          <p className="text-xs text-center text-[#3E2723]/40 mt-2">
            You can change all these settings later from the Settings page.
          </p>
        </form>
      </div>
    </div>
  );
};

export default OnboardingSetup;