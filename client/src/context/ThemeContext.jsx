// src/context/ThemeContext.jsx - Global theme management with dark mode default
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Load theme from localStorage or default to dark
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Invalid JSON, fallback
      }
    }
    return {
      mode: 'dark', // default is dark
      primaryColor: '#d4a843',
      secondaryColor: '#b8860b',
    };
  });

  const [loading, setLoading] = useState(false);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  // Apply theme classes and CSS variables to root
  useEffect(() => {
    const root = document.documentElement;
    // Set mode class on html element
    root.classList.remove('light-mode', 'dark-mode');
    root.classList.add(`${theme.mode}-mode`);

    // Set CSS variables for accent colors
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--primary-light', theme.primaryColor + '20');
    root.style.setProperty('--primary-dark', theme.primaryColor + '80');
  }, [theme]);

  // Toggle between dark and light modes
  const toggleTheme = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  };

  // Update accent colors (if needed)
  const updateTheme = (newTheme) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  const value = {
    theme,
    loading,
    toggleTheme,
    updateTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};