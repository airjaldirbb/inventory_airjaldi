import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { jwtDecode } from 'jwt-decode';
// Login Thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/login', { // <-- Make sure correct API route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      return data; // { token: "..." }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    role: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user')
      }
    },

    loadUserFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        if (token && user) {
          state.token = token;
          state.user = JSON.parse(user);
          state.role = JSON.parse(user).role;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;

        // Decode role from token
        const decoded = jwtDecode(action.payload.token);
        state.role = decoded.role;
        state.user = { id: decoded.userId, role: decoded.role };

        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', action.payload.token);
          localStorage.setItem('user',JSON.stringify(action.payload.user))
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout,loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
