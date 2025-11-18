import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  CigLogState,
  CigLogEntry,
  TodayResponse,
  HistoryResponse,
  DailyStats,
  CigLog,
} from "../types/cigLog";
import { buildApiUrl, buildAuthHeaders, API_ENDPOINTS } from "../config/api";
import { apiGet } from "../services/apiService";
import { formatErrorMessage } from "../utils/errorHandling";
import { queueCigLog, isOnline } from "../services/syncService";
import { incrementPendingCount } from "./syncSlice";

// Async thunks for API calls
export const logCigarettes = createAsyncThunk(
  "cigLog/log",
  async (logData: CigLogEntry, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      // Check if online
      const online = await isOnline();
      
      if (!online) {
        // Queue for later sync
        await queueCigLog({
          id: `temp_${Date.now()}`,
          timestamp: logData.timestamp || new Date().toISOString(),
          count: logData.count || 1,
          location: logData.location,
          trigger: logData.trigger,
        });
        
        dispatch(incrementPendingCount());
        
        // Return optimistic response
        return {
          success: true,
          queued: true,
          message: "Logged offline. Will sync when online.",
        };
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.CIGS.LOG), {
        method: "POST",
        headers: buildAuthHeaders(token),
        body: JSON.stringify(logData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to log cigarettes");
      }

      return data;
    } catch (error) {
      // If network error, queue for later
      try {
        await queueCigLog({
          id: `temp_${Date.now()}`,
          timestamp: logData.timestamp || new Date().toISOString(),
          count: logData.count || 1,
          location: logData.location,
          trigger: logData.trigger,
        });
        
        dispatch(incrementPendingCount());
        
        return {
          success: true,
          queued: true,
          message: "Logged offline. Will sync when online.",
        };
      } catch (queueError) {
        return rejectWithValue("Failed to log cigarette. Please try again.");
      }
    }
  }
);

export const getTodayStats = createAsyncThunk(
  "cigLog/getTodayStats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const data = await apiGet<TodayResponse>(
        API_ENDPOINTS.CIGS.TODAY,
        token,
        { retries: 3 }
      );

      return data;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

export const getHistory = createAsyncThunk(
  "cigLog/getHistory",
  async (
    params: { days?: number; startDate?: string; endDate?: string } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as any;
      const token = state.auth.token;

      const queryParams = new URLSearchParams();
      if (params.days) queryParams.append("days", params.days.toString());
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);

      const endpoint = `${API_ENDPOINTS.CIGS.HISTORY}?${queryParams}`;
      const data = await apiGet<HistoryResponse>(endpoint, token, { retries: 3 });

      return data;
    } catch (error: any) {
      return rejectWithValue(formatErrorMessage(error));
    }
  }
);

const initialState: CigLogState = {
  todayStats: null,
  todayLogs: [],
  history: [],
  isLoading: false,
  error: null,
};

const cigLogSlice = createSlice({
  name: "cigLog",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetCigLog: (state) => {
      state.todayStats = null;
      state.todayLogs = [];
      state.history = [];
      state.error = null;
    },
    updateTodayStats: (state, action: PayloadAction<DailyStats>) => {
      state.todayStats = action.payload;
    },
    addTodayLog: (state, action: PayloadAction<CigLog>) => {
      state.todayLogs.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Log cigarettes
    builder
      .addCase(logCigarettes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logCigarettes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayStats = action.payload.dailyStats;
        state.todayLogs.unshift(action.payload.cigLog);
        state.error = null;
      })
      .addCase(logCigarettes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get today's stats
    builder
      .addCase(getTodayStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTodayStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayStats = action.payload.dailyStats;
        state.todayLogs = action.payload.logs;
        state.error = null;
      })
      .addCase(getTodayStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get history
    builder
      .addCase(getHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload.history;
        state.error = null;
      })
      .addCase(getHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setLoading,
  resetCigLog,
  updateTodayStats,
  addTodayLog,
} = cigLogSlice.actions;
export default cigLogSlice.reducer;
