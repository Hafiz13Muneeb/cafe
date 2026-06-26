// src/components/ThemeCustomizationPanel.jsx - Theme controls for admin
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const presetPalettes = [
  { name: 'Royal Gold', primary: '#d4a843', secondary: '#b8860b' },
  { name: 'Emerald', primary: '#10b981', secondary: '#059669' },
  { name: 'Rich Blue', primary: '#3b82f6', secondary: '#1d4ed8' },
  { name: 'Crimson', primary: '#ef4444', secondary: '#b91c1c' },
  { name: 'Amethyst', primary: '#8b5cf6', secondary: '#6d28d9' },
];

const ThemeCustomizationPanel = ({ onThemeChange }) => {
  const { admin } = useAuth();
  const [primaryColor, setPrimaryColor] = useState(admin?.theme?.primaryColor || '#d4a843');
  const [secondaryColor, setSecondaryColor] = useState(admin?.theme?.secondaryColor || '#b8860b');
  const [mode, setMode] = useState(admin?.theme?.mode || 'light');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Update local state when admin prop changes
  useEffect(() => {
    if (admin?.theme) {
      setPrimaryColor(admin.theme.primaryColor || '#d4a843');
      setSecondaryColor(admin.theme.secondaryColor || '#b8860b');
      setMode(admin.theme.mode || 'light');
    }
  }, [admin]);

  const handlePresetClick = (preset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    // Optionally apply immediately with preview
  };

  const handleSaveTheme = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await api.put('/settings', {
        primaryColor,
        secondaryColor,
        mode,
      });
      if (response.data.success) {
        setMessage('Theme saved successfully!');
        if (onThemeChange) onThemeChange({ primaryColor, secondaryColor, mode });
      }
    } catch (err) {
      setMessage('Failed to save theme: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Customize Your Theme</h3>
      
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Dark / Light</span>
        <button
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            mode === 'light' ? 'bg-gray-300' : 'bg-gray-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
              mode === 'light' ? 'translate-x-0' : 'translate-x-6'
            }`}
          />
        </button>
        <span className="text-sm text-gray-500 capitalize">{mode}</span>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Primary Accent</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--primary-color)' }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Secondary Accent</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--primary-color)' }}
            />
          </div>
        </div>
      </div>

      {/* Preset Palettes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preset Palettes</label>
        <div className="flex flex-wrap gap-3">
          {presetPalettes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetClick(preset)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-primary transition"
            >
              <span className="flex gap-1">
                <span
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: preset.primary }}
                />
                <span
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: preset.secondary }}
                />
              </span>
              <span className="text-xs text-gray-600">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Live Preview</h4>
        <div
          className="p-4 rounded-lg transition-colors duration-300"
          style={{
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1e293b',
            color: mode === 'light' ? '#0f172a' : '#f1f5f9',
          }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-2"
            style={{ backgroundColor: primaryColor }}
          />
          <div className="flex justify-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Primary
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary
            </span>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: secondaryColor }}>
            Accent color example
          </p>
        </div>
      </div>

      {/* Save Button & Message */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSaveTheme}
          disabled={loading}
          className="px-4 py-2 text-white rounded-lg shadow-md hover:opacity-90 transition disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          {loading ? 'Saving...' : 'Save Theme'}
        </button>
        {message && <span className="text-sm" style={{ color: 'var(--primary-color)' }}>{message}</span>}
      </div>
    </div>
  );
};

export default ThemeCustomizationPanel;