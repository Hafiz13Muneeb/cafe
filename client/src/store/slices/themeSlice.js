// src/store/slices/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Load theme from localStorage (if any)
const loadTheme = () => {
  try {
    const saved = localStorage.getItem('globalTheme');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const defaultTheme = {
  primaryColor: '#d4a843',
  secondaryColor: '#b8860b',
  mode: 'light',
  faviconUrl: '',
};

const initialState = loadTheme() || defaultTheme;

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    updateTheme: (state, action) => {
      const newTheme = action.payload;
      Object.assign(state, newTheme);
      localStorage.setItem('globalTheme', JSON.stringify(state));
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('globalTheme', JSON.stringify(state));
    },
    setTheme: (state, action) => {
      Object.assign(state, action.payload);
      localStorage.setItem('globalTheme', JSON.stringify(state));
    },
  },
});

// Selectors
export const selectTheme = (state) => state.theme;
export const selectPrimaryColor = (state) => state.theme.primaryColor;
export const selectSecondaryColor = (state) => state.theme.secondaryColor;
export const selectMode = (state) => state.theme.mode;
export const selectFavicon = (state) => state.theme.faviconUrl;

export const { updateTheme, toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;