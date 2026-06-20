import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/* ===========================
   LOGIN THUNK
=========================== */
export const loadUserFromStorage = createAsyncThunk(
  'auth/loginUser',
  async (credentials, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // IMPORTANT for cookies
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data; // { user }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

/* ===========================
   LOGOUT THUNK
=========================== */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, thunkAPI) => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      return true;
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
  role: null,
  loading: false,
  error: null,
  initialized: false,
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
      state.role = null;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },

    /* ===== OPTIONAL HYDRATION ===== */
    setUser: (state, action) => {
      state.user = action.payload;
      state.role = action.payload?.role || null;
      state.initialized = true;
    },
  },

  extraReducers: (builder) => {
    builder
      /* ===== LOGIN PENDING ===== */
      .addCase(loadUserFromStorage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /* ===== LOGIN SUCCESS ===== */
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        const user = action.payload.user;

        state.loading = false;
        state.user = user;
        state.role = user.role;
        state.initialized = true;
      })

      /* ===== LOGIN ERROR ===== */
      .addCase(loadUserFromStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.initialized = true;
      })
         /* LOGOUT */
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.loading = false;
        state.error = null;
        state.initialized = true;
      });
  
  },
});

/* ===========================
   EXPORTS
=========================== */
export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;