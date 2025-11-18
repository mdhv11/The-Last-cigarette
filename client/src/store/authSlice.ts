import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import {
  AuthState,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
} from "../types/auth";
import { API_ENDPOINTS } from "../config/api";
import { apiPost, apiGet } from "../services/apiService";
import { formatErrorMessage } from "../utils/errorHandling";

// Async thunks for API calls with retry logic
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await apiPost<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
        undefined,
        { retries: 2 } // Retry twice for login
      );

      // Store token securely
      await SecureStore.setItemAsync("authToken", data.token);

      return data;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (credentials: SignupCredentials, { rejectWithValue }) => {
    try {
      const data = await apiPost<AuthResponse>(
        API_ENDPOINTS.AUTH.SIGNUP,
        credentials,
        undefined,
        { retries: 2 } // Retry twice for signup
      );

      // Store token securely
      await SecureStore.setItemAsync("authToken", data.token);

      return data;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        return rejectWithValue("No token found");
      }

      const data = await apiGet<{ user: any }>(
        API_ENDPOINTS.AUTH.ME,
        token,
        { retries: 1 } // Only retry once for token verification
      );

      return { user: data.user, token };
    } catch (error: any) {
      await SecureStore.deleteItemAsync("authToken");
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await SecureStore.deleteItemAsync("authToken");
});

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Verify token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
