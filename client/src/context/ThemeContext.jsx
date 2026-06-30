import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply theme to DOM
  const applyTheme = useCallback((themeObj) => {
    const root = document.documentElement;
    const mode = themeObj?.mode || 'light';
    const primary = themeObj?.primaryColor || '#d4a843';
    const secondary = themeObj?.secondaryColor || '#b8860b';
    const favicon = themeObj?.faviconUrl || '';

    // CSS Variables
    root.style.setProperty('--primary-color', primary);
    root.style.setProperty('--secondary-color', secondary);
    
    // RGB version for glow effect
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '212, 168, 67';
    };
    root.style.setProperty('--primary-color-rgb', hexToRgb(primary));

    // Background and text based on mode
    if (mode === 'dark') {
      root.style.setProperty('--bg-color', '#1a1a2e');
      root.style.setProperty('--card-bg', '#16213e');
      root.style.setProperty('--text-color', '#e2e8f0');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--border-color', '#334155');
    } else {
      root.style.setProperty('--bg-color', '#f8fafc');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--text-color', '#0f172a');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--border-color', '#e2e8f0');
    }

    root.classList.remove('light-mode', 'dark-mode');
    root.classList.add(`${mode}-mode`);

    // Set favicon
    if (favicon) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.rel = 'icon';
      link.href = favicon;
      if (!document.querySelector("link[rel*='icon']")) {
        document.head.appendChild(link);
      }
    }
  }, []);

  // Load global settings from API
  const loadGlobalSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/global');
      if (response.data.success) {
        const settings = response.data.data;
        const themeData = {
          primaryColor: settings.primaryColor || '#d4a843',
          secondaryColor: settings.secondaryColor || '#b8860b',
          mode: settings.mode || 'light',
          faviconUrl: settings.faviconUrl || '',
        };
        setTheme(themeData);
        localStorage.setItem('globalTheme', JSON.stringify(themeData));
        applyTheme(themeData);
        return themeData;
      }
    } catch (error) {
      console.error('Failed to load global settings:', error);
      // Fallback to localStorage or default
      const saved = localStorage.getItem('globalTheme');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTheme(parsed);
          applyTheme(parsed);
          return parsed;
        } catch (e) {}
      }
      // Final fallback
      const fallback = { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light', faviconUrl: '' };
      setTheme(fallback);
      applyTheme(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  // Update theme (used by settings pages after saving)
  const updateTheme = useCallback((newThemeData) => {
    const updated = { ...theme, ...newThemeData };
    setTheme(updated);
    localStorage.setItem('globalTheme', JSON.stringify(updated));
    applyTheme(updated);
  }, [theme, applyTheme]);

  // Toggle dark/light mode
  const toggleTheme = useCallback(() => {
    if (theme) {
      const newMode = theme.mode === 'dark' ? 'light' : 'dark';
      updateTheme({ mode: newMode });
    }
  }, [theme, updateTheme]);

  // Load on mount
  useEffect(() => {
    loadGlobalSettings();
  }, [loadGlobalSettings]);

  const value = {
    theme,
    loading,
    loadGlobalSettings,
    updateTheme,
    toggleTheme,
    applyTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};