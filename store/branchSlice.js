import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchBranches = createAsyncThunk(
  "branch/fetchBranches",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("/api/branch");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

const branchSlice = createSlice({
  name: "branch",
  initialState: {
    branches: [],
    loading: false,
    loaded: false,
    error: null
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.branches = action.payload;
      })

      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default branchSlice.reducer;