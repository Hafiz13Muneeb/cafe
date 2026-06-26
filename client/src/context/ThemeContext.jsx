// src/context/ThemeContext.jsx - with useCallback
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCafeSettings } from '../api/axios';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { mode: 'light', primaryColor: '#d4a843', secondaryColor: '#b8860b' };
  });

  const [loading, setLoading] = useState(false);
  const [cafeSettings, setCafeSettings] = useState(null);

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  const applyTheme = useCallback((themeObj) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeObj.primaryColor);
    root.style.setProperty('--secondary-color', themeObj.secondaryColor);
    root.style.setProperty('--primary-light', themeObj.primaryColor + '20');
    root.style.setProperty('--primary-dark', themeObj.primaryColor + '80');
    root.classList.remove('light-mode', 'dark-mode');
    root.classList.add(`${themeObj.mode}-mode`);
    if (themeObj.mode === 'dark') {
      root.style.setProperty('--bg-color', '#0a0a0f');
      root.style.setProperty('--text-color', '#ffffff');
    } else {
      root.style.setProperty('--bg-color', '#f8fafc');
      root.style.setProperty('--text-color', '#0f172a');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }));
  }, []);

  const updateTheme = useCallback((newTheme) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  }, []);

  const loadThemeFromSlug = useCallback(async (slug) => {
    setLoading(true);
    try {
      const settings = await fetchCafeSettings(slug);
      if (settings && settings.theme) {
        const themeData = {
          primaryColor: settings.theme.primaryColor || '#d4a843',
          secondaryColor: settings.theme.secondaryColor || '#b8860b',
          mode: settings.theme.mode || 'light',
        };
        setCafeSettings(settings);
        setTheme(themeData);
        return themeData;
      }
      setTheme({ primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' });
      return null;
    } catch (error) {
      console.error('Failed to load theme:', error);
      setTheme({ primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadThemeFromUser = useCallback((user) => {
    if (user?.theme) {
      const themeData = {
        primaryColor: user.theme.primaryColor || '#d4a843',
        secondaryColor: user.theme.secondaryColor || '#b8860b',
        mode: user.theme.mode || 'light',
      };
      setTheme(themeData);
      return themeData;
    }
    return null;
  }, []);

  const value = {
    theme,
    loading,
    cafeSettings,
    toggleTheme,
    updateTheme,
    loadThemeFromSlug,
    loadThemeFromUser,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};