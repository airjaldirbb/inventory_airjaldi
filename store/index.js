import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import themeReducer from './themeSlice'
import { createTheme } from '@mui/material';
import branchReducer from './branchSlice'
const store = configureStore({
  reducer: {
    auth: authReducer,
    theme:themeReducer,
    branch:branchReducer
  },
});

export default store;
