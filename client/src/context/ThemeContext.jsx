// src/context/ThemeContext.jsx - Global theme management (single source of truth)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Try loading from localStorage for faster initial render
    const saved = localStorage.getItem('globalTheme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Invalid JSON, fallback
      }
    }
    // Fallback defaults
    return {
      mode: 'light',
      primaryColor: '#d4a843',
      secondaryColor: '#b8860b',
    };
  });

  const [loading, setLoading] = useState(true);
  const [cafeSettings, setCafeSettings] = useState(null); // Kept for backward compatibility

  // Apply theme CSS variables to root element
  const applyTheme = useCallback((themeObj) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeObj.primaryColor);
    root.style.setProperty('--secondary-color', themeObj.secondaryColor);
    root.style.setProperty('--primary-light', themeObj.primaryColor + '20');
    root.style.setProperty('--primary-dark', themeObj.primaryColor + '80');

    // Update RGB values for cursor glow and other effects
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '212, 168, 67'; // fallback
    };
    root.style.setProperty('--primary-color-rgb', hexToRgb(themeObj.primaryColor));

    // Mode
    root.classList.remove('light-mode', 'dark-mode');
    root.classList.add(`${themeObj.mode}-mode`);

    if (themeObj.mode === 'dark') {
      root.style.setProperty('--bg-color', '#0a0a0f');
      root.style.setProperty('--text-color', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--card-bg', '#1e293b');
      root.style.setProperty('--border-color', '#334155');
    } else {
      root.style.setProperty('--bg-color', '#f8fafc');
      root.style.setProperty('--text-color', '#0f172a');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--border-color', '#e2e8f0');
    }
  }, []);

  // Load global settings from backend
  const loadGlobalSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/global');
      if (response.data.success) {
        const data = response.data.data;
        const newTheme = {
          primaryColor: data.primaryColor || '#d4a843',
          secondaryColor: data.secondaryColor || '#b8860b',
          mode: data.mode || 'light',
        };
        setTheme(newTheme);
        // Save to localStorage for faster subsequent loads
        localStorage.setItem('globalTheme', JSON.stringify(newTheme));
        applyTheme(newTheme);
        return newTheme;
      }
    } catch (error) {
      console.error('Failed to load global theme, using defaults:', error);
      // Use localStorage fallback if available
      const saved = localStorage.getItem('globalTheme');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTheme(parsed);
          applyTheme(parsed);
        } catch (e) {
          // Use defaults
        }
      }
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  // Load theme on mount
  useEffect(() => {
    loadGlobalSettings();
  }, [loadGlobalSettings]);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // --- Exposed functions ---

  // Toggle between light/dark mode (can be used by any user)
  const toggleTheme = useCallback(() => {
    setTheme(prev => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }));
    // Note: This only updates the UI, not the database.
    // To persist, call updateGlobalTheme from SuperAdminDashboard.
  }, []);

  // Update entire theme (called from SuperAdminDashboard after saving)
  const updateTheme = useCallback((newTheme) => {
    const updatedTheme = { ...theme, ...newTheme };
    setTheme(updatedTheme);
    localStorage.setItem('globalTheme', JSON.stringify(updatedTheme));
    applyTheme(updatedTheme);
  }, [theme, applyTheme]);

  // For backward compatibility – loads cafe data but DOES NOT change theme
  const loadThemeFromSlug = useCallback(async (slug) => {
    try {
      const response = await api.get(`/menu/${slug}`);
      if (response.data.success) {
        const cafe = response.data.data.cafe;
        setCafeSettings(cafe);
        return cafe;
      }
    } catch (error) {
      console.error('Failed to fetch cafe settings:', error);
    }
    return null;
  }, []);

  // Load theme from user (legacy – kept for compatibility)
  const loadThemeFromUser = useCallback((user) => {
    if (user?.theme) {
      const themeData = {
        primaryColor: user.theme.primaryColor || '#d4a843',
        secondaryColor: user.theme.secondaryColor || '#b8860b',
        mode: user.theme.mode || 'light',
      };
      // We DON'T override global theme with user theme
      // Just update the local state if needed for backward compatibility
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
    loadGlobalSettings, // expose for manual refresh
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};