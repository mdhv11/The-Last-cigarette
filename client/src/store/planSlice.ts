import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  QuitPlan,
  QuitPlanSetup,
  PlanState,
  QuitPlanResponse,
} from "../types/plan";
import { API_ENDPOINTS } from "../config/api";
import { apiPost, apiPut, apiGet } from "../services/apiService";
import { formatErrorMessage } from "../utils/errorHandling";

// Async thunks for API calls with retry logic
export const setupQuitPlan = createAsyncThunk(
  "plan/setup",
  async (planData: QuitPlanSetup, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const data = await apiPost<{ quitPlan: QuitPlan }>(
        API_ENDPOINTS.PLAN.SETUP,
        planData,
        token,
        { retries: 3 }
      );

      return data.quitPlan;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const updateQuitPlan = createAsyncThunk(
  "plan/update",
  async (planData: Partial<QuitPlanSetup>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const data = await apiPut<{ quitPlan: QuitPlan }>(
        API_ENDPOINTS.PLAN.UPDATE,
        planData,
        token,
        { retries: 3 }
      );

      return data.quitPlan;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const getCurrentPlan = createAsyncThunk(
  "plan/getCurrent",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const data = await apiGet<QuitPlanResponse>(
        API_ENDPOINTS.PLAN.CURRENT,
        token,
        { retries: 3 }
      );

      return data;
    } catch (error: any) {
      const errorMessage = formatErrorMessage(error);
      
      // Check if it's a 404 error (no plan found)
      if ((error as any).statusCode === 404) {
        return rejectWithValue("NO_PLAN_FOUND");
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState: PlanState = {
  quitPlan: null,
  progress: null,
  isLoading: false,
  error: null,
  hasSetupPlan: false,
};

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetPlan: (state) => {
      state.quitPlan = null;
      state.progress = null;
      state.hasSetupPlan = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Setup quit plan
    builder
      .addCase(setupQuitPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setupQuitPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quitPlan = action.payload;
        state.hasSetupPlan = true;
        state.error = null;
      })
      .addCase(setupQuitPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update quit plan
    builder
      .addCase(updateQuitPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuitPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quitPlan = action.payload;
        state.error = null;
      })
      .addCase(updateQuitPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get current plan
    builder
      .addCase(getCurrentPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quitPlan = action.payload.quitPlan;
        state.progress = action.payload.progress || null;
        state.hasSetupPlan = true;
        state.error = null;
      })
      .addCase(getCurrentPlan.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload === "NO_PLAN_FOUND") {
          state.hasSetupPlan = false;
          state.error = null;
        } else {
          state.error = action.payload as string;
        }
      });
  },
});

export const { clearError, setLoading, resetPlan } = planSlice.actions;
export default planSlice.reducer;
