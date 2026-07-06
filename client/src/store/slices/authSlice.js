// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.success) {
        const userData = response.data.data.user;
        // Store user in localStorage for rehydration
        localStorage.setItem('adminData', JSON.stringify(userData));
        return userData;
      }
      return rejectWithValue('Login failed');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('adminData');
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.data;
        localStorage.setItem('adminData', JSON.stringify(userData));
        return userData;
      }
      return rejectWithValue('Not authenticated');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Not authenticated');
    }
  }
);

// Load initial user from localStorage
const loadUser = () => {
  try {
    const data = localStorage.getItem('adminData');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: loadUser(),
  loading: false,
  error: null,
  isAuthenticated: !!loadUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // For manual update (e.g., updateUserData)
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('adminData', JSON.stringify(state.user));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch me
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
        localStorage.removeItem('adminData');
      });
  },
});

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export const { updateUser, clearError } = authSlice.actions;

export default authSlice.reducer;