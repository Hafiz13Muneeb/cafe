// src/context/ThemeContext.jsx - Global theme management with dynamic loading from API
import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { fetchCafeSettings } from '../api/axios';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Load theme from localStorage (for admin panel) or default
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Invalid JSON, fallback
      }
    }
    // Default: premium light theme with gold accents
    return {
      mode: 'light',
      primaryColor: '#d4a843',
      secondaryColor: '#b8860b',
    };
  });

  const [loading, setLoading] = useState(false);
  const [cafeSettings, setCafeSettings] = useState(null); // For customer menu

  // Save theme to localStorage whenever it changes (for admin)
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  // Apply theme CSS variables to root element
  const applyTheme = (themeObj) => {
    const root = document.documentElement;
    // Set CSS variables for accent colors
    root.style.setProperty('--primary-color', themeObj.primaryColor);
    root.style.setProperty('--secondary-color', themeObj.secondaryColor);
    root.style.setProperty('--primary-light', themeObj.primaryColor + '20');
    root.style.setProperty('--primary-dark', themeObj.primaryColor + '80');
    // For mode, we can set a data attribute or class
    root.classList.remove('light-mode', 'dark-mode');
    root.classList.add(`${themeObj.mode}-mode`);
    // Also set background/foreground via CSS variables if needed
    if (themeObj.mode === 'dark') {
      root.style.setProperty('--bg-color', '#0a0a0f');
      root.style.setProperty('--text-color', '#ffffff');
    } else {
      root.style.setProperty('--bg-color', '#f8fafc');
      root.style.setProperty('--text-color', '#0f172a');
    }
  };

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // --- Admin theme management ---
  const toggleTheme = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  };

  const updateTheme = (newTheme) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  // --- Customer menu: load theme from backend by slug ---
  const loadThemeFromSlug = async (slug) => {
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
        // Set theme state (temporarily overrides admin theme for the customer view)
        setTheme(themeData);
        return themeData;
      }
      // Fallback to default theme if no settings
      setTheme({
        primaryColor: '#d4a843',
        secondaryColor: '#b8860b',
        mode: 'light',
      });
      return null;
    } catch (error) {
      console.error('Failed to load theme from slug:', error);
      // Fallback to default theme
      setTheme({
        primaryColor: '#d4a843',
        secondaryColor: '#b8860b',
        mode: 'light',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- Load theme from logged-in user's settings (for admin dashboard) ---
  const loadThemeFromUser = (user) => {
    if (user && user.theme) {
      const themeData = {
        primaryColor: user.theme.primaryColor || '#d4a843',
        secondaryColor: user.theme.secondaryColor || '#b8860b',
        mode: user.theme.mode || 'light',
      };
      setTheme(themeData);
      return themeData;
    }
    return null;
  };

  const value = {
    theme,
    loading,
    cafeSettings,
    toggleTheme,
    updateTheme,
    loadThemeFromSlug,
    loadThemeFromUser,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};