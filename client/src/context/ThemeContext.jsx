// src/context/ThemeContext.jsx - Uses localStorage instead of API
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = useCallback((themeObj) => {
    const root = document.documentElement;
    const mode = themeObj?.mode || 'light';
    const primary = themeObj?.primaryColor || '#d4a843';
    const secondary = themeObj?.secondaryColor || '#b8860b';
    const favicon = themeObj?.faviconUrl || '';

    root.style.setProperty('--primary-color', primary);
    root.style.setProperty('--secondary-color', secondary);

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '212, 168, 67';
    };
    root.style.setProperty('--primary-color-rgb', hexToRgb(primary));

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

    if (favicon) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.rel = 'icon';
      link.href = favicon;
      if (!document.querySelector("link[rel*='icon']")) {
        document.head.appendChild(link);
      }
    }
  }, []);

  // Load theme from localStorage (cafeSettings) or fallback
  const loadTheme = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem('cafeSettings');
      let themeData = null;
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        themeData = parsed.theme || null;
      }
      if (!themeData) {
        // Fallback to default
        themeData = { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light', faviconUrl: '' };
      }
      setTheme(themeData);
      applyTheme(themeData);
      localStorage.setItem('globalTheme', JSON.stringify(themeData));
    } catch (e) {
      const fallback = { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light', faviconUrl: '' };
      setTheme(fallback);
      applyTheme(fallback);
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const updateTheme = useCallback((newThemeData) => {
    const updated = { ...theme, ...newThemeData };
    setTheme(updated);
    localStorage.setItem('globalTheme', JSON.stringify(updated));
    applyTheme(updated);
    // Also update cafeSettings
    const savedSettings = localStorage.getItem('cafeSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        parsed.theme = updated;
        localStorage.setItem('cafeSettings', JSON.stringify(parsed));
      } catch (e) {}
    }
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    if (theme) {
      const newMode = theme.mode === 'dark' ? 'light' : 'dark';
      updateTheme({ mode: newMode });
    }
  }, [theme, updateTheme]);

  const value = {
    theme,
    loading,
    loadTheme,
    updateTheme,
    toggleTheme,
    applyTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};