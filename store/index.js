import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice'
import { createTheme } from '@mui/material';
const store = configureStore({
  reducer: {
    auth: authReducer,
    theme:themeReducer
  },
});

export default store;
