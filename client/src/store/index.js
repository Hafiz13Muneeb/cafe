// src/store/index.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import cartReducer from './slices/cartSlice';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';

const persistConfig = {
  key: 'root',
  storage,
  // Only persist auth and theme (cart already persists manually)
  whitelist: ['auth', 'theme'],
};

const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
  theme: themeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);