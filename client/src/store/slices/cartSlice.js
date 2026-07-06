// src/store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const initialState = {
  items: loadCartFromStorage(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find((i) => i._id === item._id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const existing = state.items.find((i) => i._id === itemId);
      if (existing) {
        if (existing.quantity === 1) {
          state.items = state.items.filter((i) => i._id !== itemId);
        } else {
          existing.quantity -= 1;
        }
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
    // For cross-tab sync: replace entire cart from another tab
    syncCart: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectTotalItems = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectTotalPrice = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

// Actions
export const { addToCart, removeFromCart, clearCart, syncCart } = cartSlice.actions;

export default cartSlice.reducer;