import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

/* ===========================
   LOGIN THUNK
=========================== */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data; // { token }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* ===========================
   INITIAL STATE
=========================== */
const initialState = {
  user: null,
  token: null,
  role: null,
  loading: false,
  error: null,
  initialized: false, // 🔥 auth hydration flag
};

/* ===========================
   AUTH SLICE
=========================== */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /* ===== LOGOUT ===== */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.loading = false;
      state.error = null;
      state.initialized = true; // 🔥 important

      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    },

    /* ===== LOAD USER FROM STORAGE ===== */
    loadUserFromStorage: (state) => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          const decoded = jwtDecode(token);

          state.token = token;
          state.user = {
            id: decoded.userId,
            role: decoded.role,
          };
          state.role = decoded.role;
        } catch (err) {
          localStorage.removeItem('authToken');
          state.user = null;
          state.token = null;
          state.role = null;
        }
      }

      // 🔥 ALWAYS mark initialized
      state.initialized = true;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ===== LOGIN PENDING ===== */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /* ===== LOGIN SUCCESS ===== */
      // .addCase(loginUser.fulfilled, (state, action) => {
      //   const token = action.payload.token;
      //   const decoded = jwtDecode(token);
      //   state.loading = false;
      //   state.token = token;
      //   state.user = {
      //     id: decoded.userId,
      //     role: decoded.role,
      //   };
      //   state.role = decoded.role;
      //   state.initialized = true; // 🔥 important

      //   if (typeof window !== 'undefined') {
      //     localStorage.setItem('authToken', token);
      //   }
      // })
.addCase(loginUser.fulfilled, (state, action) => {
  const token = action.payload.token;
  const user = action.payload.user;
  state.loading = false;
  state.token = token;
  state.user = user;
  state.role = user.role;
  state.initialized = true;

  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
})
      /* ===== LOGIN ERROR ===== */
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.initialized = true; // 🔥 important
      });
  },
});

/* ===========================
   EXPORTS
=========================== */
export const { logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
