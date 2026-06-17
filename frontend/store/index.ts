import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import jobReducer from './jobSlice';
import uiReducer from './uiSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      jobs: jobReducer,
      ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
