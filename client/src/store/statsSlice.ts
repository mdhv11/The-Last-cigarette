import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { statsService } from '../services/stats';

interface Achievement {
    _id: string;
    name: string;
    description: string;
    type: string;
    unlockedAt: string;
}

interface StatsState {
    dashboard: any;
    progress: any[];
    savings: any;
    achievements: Achievement[];
    loading: boolean;
    error: string | null;
}

const initialState: StatsState = {
    dashboard: null,
    progress: [],
    savings: null,
    achievements: [],
    loading: false,
    error: null,
};

export const fetchDashboardStats = createAsyncThunk(
    'stats/fetchDashboard',
    async () => {
        const response = await statsService.getDashboardStats();
        return response.stats;
    }
);

export const fetchProgressStats = createAsyncThunk(
    'stats/fetchProgress',
    async () => {
        const response = await statsService.getProgressStats();
        return response.progressData;
    }
);

export const fetchSavingsStats = createAsyncThunk(
    'stats/fetchSavings',
    async () => {
        const response = await statsService.getSavingsStats();
        return response;
    }
);

export const fetchAchievements = createAsyncThunk(
    'stats/fetchAchievements',
    async () => {
        const response = await statsService.getAchievements();
        return response.achievements;
    }
);

const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Dashboard
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboard = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch dashboard stats';
            })
            // Progress
            .addCase(fetchProgressStats.fulfilled, (state, action) => {
                state.progress = action.payload;
            })
            // Savings
            .addCase(fetchSavingsStats.fulfilled, (state, action) => {
                state.savings = action.payload;
            })
            // Achievements
            .addCase(fetchAchievements.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAchievements.fulfilled, (state, action) => {
                state.loading = false;
                state.achievements = action.payload;
            })
            .addCase(fetchAchievements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch achievements';
            });
    },
});

export default statsSlice.reducer;
