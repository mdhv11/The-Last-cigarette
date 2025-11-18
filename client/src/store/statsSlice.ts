import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../config/api';

interface ProgressDataPoint {
  date: string;
  actual: number;
  target: number;
  exceeded: boolean;
  difference: number;
}

interface ProgressSummary {
  totalDays: number;
  totalActual: number;
  totalTarget: number;
  daysUnderTarget: number;
  daysOverTarget: number;
  averageActual: number;
  averageTarget: number;
  overallPerformance: number;
}

interface SavingsBreakdown {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface SavingsProjections {
  nextWeek: number;
  nextMonth: number;
  nextYear: number;
}

interface SavingsData {
  totalSaved: number;
  cigarettesSaved: number;
  costPerCigarette: number;
  daysSinceStart: number;
  breakdown: SavingsBreakdown;
  projections: SavingsProjections;
}

interface Achievement {
  type: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  earned: boolean;
  progress: number;
  earnedAt?: string;
}

interface AchievementsStats {
  totalEarned: number;
  totalAvailable: number;
  currentStreak: number;
  moneySaved: number;
}

interface AchievementsData {
  earned: Achievement[];
  upcoming: Achievement[];
  stats: AchievementsStats;
}

interface StatsState {
  progress: {
    data: ProgressDataPoint[];
    summary: ProgressSummary | null;
    isLoading: boolean;
    error: string | null;
  };
  savings: {
    data: SavingsData | null;
    isLoading: boolean;
    error: string | null;
  };
  achievements: {
    data: AchievementsData | null;
    isLoading: boolean;
    error: string | null;
  };
}

const initialState: StatsState = {
  progress: {
    data: [],
    summary: null,
    isLoading: false,
    error: null,
  },
  savings: {
    data: null,
    isLoading: false,
    error: null,
  },
  achievements: {
    data: null,
    isLoading: false,
    error: null,
  },
};

// Async thunks
export const fetchProgress = createAsyncThunk(
  'stats/fetchProgress',
  async (days: number = 30, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/progress?days=${days}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to fetch progress data');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error while fetching progress data');
    }
  }
);

export const fetchSavings = createAsyncThunk(
  'stats/fetchSavings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/savings`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to fetch savings data');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error while fetching savings data');
    }
  }
);

export const fetchAchievements = createAsyncThunk(
  'stats/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/achievements`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to fetch achievements');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error while fetching achievements');
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearStatsError: (state) => {
      state.progress.error = null;
      state.savings.error = null;
      state.achievements.error = null;
    },
  },
  extraReducers: (builder) => {
    // Progress
    builder
      .addCase(fetchProgress.pending, (state) => {
        state.progress.isLoading = true;
        state.progress.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.progress.isLoading = false;
        state.progress.data = action.payload.progressData;
        state.progress.summary = action.payload.summary;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.progress.isLoading = false;
        state.progress.error = action.payload as string;
      });

    // Savings
    builder
      .addCase(fetchSavings.pending, (state) => {
        state.savings.isLoading = true;
        state.savings.error = null;
      })
      .addCase(fetchSavings.fulfilled, (state, action) => {
        state.savings.isLoading = false;
        state.savings.data = action.payload;
      })
      .addCase(fetchSavings.rejected, (state, action) => {
        state.savings.isLoading = false;
        state.savings.error = action.payload as string;
      });

    // Achievements
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.achievements.isLoading = true;
        state.achievements.error = null;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.achievements.isLoading = false;
        state.achievements.data = action.payload;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.achievements.isLoading = false;
        state.achievements.error = action.payload as string;
      });
  },
});

export const { clearStatsError } = statsSlice.actions;
export default statsSlice.reducer;
