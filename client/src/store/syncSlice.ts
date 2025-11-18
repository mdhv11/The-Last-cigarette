/**
 * Redux slice for synchronization state management
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { syncAllPendingData, getPendingCount, getLastSyncTime, isOnline } from '../services/syncService';
import type { RootState } from './index';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  syncError: string | null;
  syncSuccess: boolean;
}

const initialState: SyncState = {
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncTime: null,
  syncError: null,
  syncSuccess: false,
};

/**
 * Check online status
 */
export const checkOnlineStatus = createAsyncThunk(
  'sync/checkOnlineStatus',
  async () => {
    return await isOnline();
  }
);

/**
 * Sync all pending data
 */
export const syncPendingData = createAsyncThunk(
  'sync/syncPendingData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }
      
      const result = await syncAllPendingData(token);
      
      if (!result.success) {
        return rejectWithValue(result.errors.join(', '));
      }
      
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Sync failed');
    }
  }
);

/**
 * Update pending count
 */
export const updatePendingCount = createAsyncThunk(
  'sync/updatePendingCount',
  async () => {
    return await getPendingCount();
  }
);

/**
 * Load last sync time
 */
export const loadLastSyncTime = createAsyncThunk(
  'sync/loadLastSyncTime',
  async () => {
    return await getLastSyncTime();
  }
);

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    incrementPendingCount: (state) => {
      state.pendingCount += 1;
    },
    clearSyncError: (state) => {
      state.syncError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check online status
      .addCase(checkOnlineStatus.fulfilled, (state, action) => {
        state.isOnline = action.payload;
      })
      
      // Sync pending data
      .addCase(syncPendingData.pending, (state) => {
        state.isSyncing = true;
        state.syncError = null;
        state.syncSuccess = false;
      })
      .addCase(syncPendingData.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.syncSuccess = true;
        state.pendingCount = 0;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(syncPendingData.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload as string;
        state.syncSuccess = false;
      })
      
      // Update pending count
      .addCase(updatePendingCount.fulfilled, (state, action) => {
        state.pendingCount = action.payload;
      })
      
      // Load last sync time
      .addCase(loadLastSyncTime.fulfilled, (state, action) => {
        state.lastSyncTime = action.payload;
      });
  },
});

export const { setOnlineStatus, incrementPendingCount, clearSyncError } = syncSlice.actions;

// Selectors
export const selectIsOnline = (state: RootState) => state.sync.isOnline;
export const selectIsSyncing = (state: RootState) => state.sync.isSyncing;
export const selectPendingCount = (state: RootState) => state.sync.pendingCount;
export const selectLastSyncTime = (state: RootState) => state.sync.lastSyncTime;
export const selectSyncError = (state: RootState) => state.sync.syncError;

export default syncSlice.reducer;
