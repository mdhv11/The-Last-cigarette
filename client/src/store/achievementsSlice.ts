import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { API_BASE_URL } from '../config/api';

export interface Achievement {
  type: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  earned: boolean;
  progress: number;
  earnedAt?: string;
  value?: number;
}

export interface AchievementStats {
  totalEarned: number;
  totalAvailable: number;
  currentStreak: number;
  moneySaved: number;
  journalCount?: number;
  daysSinceStart?: number;
}

export interface PunishmentStatus {
  triggered: boolean;
  overage?: number;
  dailyTarget?: number;
  dailyCount?: number;
  donationAmount?: number;
  charityName?: string;
  message?: string;
}

interface AchievementsState {
  earned: Achievement[];
  upcoming: Achievement[];
  stats: AchievementStats;
  recentAchievements: Achievement[];
  punishmentStatus: PunishmentStatus | null;
  loading: boolean;
  error: string | null;
  lastChecked: string | null;
}

const initialState: AchievementsState = {
  earned: [],
  upcoming: [],
  stats: {
    totalEarned: 0,
    totalAvailable: 0,
    currentStreak: 0,
    moneySaved: 0,
  },
  recentAchievements: [],
  punishmentStatus: null,
  loading: false,
  error: null,
  lastChecked: null,
};

// Fetch all achievements with progress
export const fetchAchievements = createAsyncThunk<any, void, { rejectValue: string }>(
  'achievements/fetchAchievements',
  async (_: void, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/achievements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to fetch achievements');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Check and award new achievements
export const checkAchievements = createAsyncThunk<any, void, { rejectValue: string }>(
  'achievements/checkAchievements',
  async (_: void, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/achievements/check`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to check achievements');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Fetch recent achievements
export const fetchRecentAchievements = createAsyncThunk<any, void, { rejectValue: string }>(
  'achievements/fetchRecentAchievements',
  async (_: void, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/achievements/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to fetch recent achievements');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Check punishment trigger
export const checkPunishment = createAsyncThunk<any, void, { rejectValue: string }>(
  'achievements/checkPunishment',
  async (_: void, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/achievements/punishment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to check punishment');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    clearAchievementsError: (state) => {
      state.error = null;
    },
    dismissPunishment: (state) => {
      state.punishmentStatus = null;
    },
    addNewAchievement: (state, action: PayloadAction<Achievement>) => {
      state.earned.push(action.payload);
      state.recentAchievements.unshift(action.payload);
      state.stats.totalEarned += 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch achievements
    builder.addCase(fetchAchievements.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAchievements.fulfilled, (state, action) => {
      state.loading = false;
      state.earned = action.payload.earned;
      state.upcoming = action.payload.upcoming;
      state.stats = action.payload.stats;
      state.lastChecked = new Date().toISOString();
    });
    builder.addCase(fetchAchievements.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Check achievements
    builder.addCase(checkAchievements.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkAchievements.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.newAchievements && action.payload.newAchievements.length > 0) {
        // Add new achievements to recent list
        state.recentAchievements = [
          ...action.payload.newAchievements,
          ...state.recentAchievements,
        ].slice(0, 10); // Keep only last 10
      }
    });
    builder.addCase(checkAchievements.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch recent achievements
    builder.addCase(fetchRecentAchievements.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecentAchievements.fulfilled, (state, action) => {
      state.loading = false;
      state.recentAchievements = action.payload.achievements;
    });
    builder.addCase(fetchRecentAchievements.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Check punishment
    builder.addCase(checkPunishment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkPunishment.fulfilled, (state, action) => {
      state.loading = false;
      state.punishmentStatus = action.payload;
    });
    builder.addCase(checkPunishment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAchievementsError, dismissPunishment, addNewAchievement } =
  achievementsSlice.actions;

export default achievementsSlice.reducer;
