import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cigService } from '../services/cigs';

interface CigState {
    todayCount: number;
    logs: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CigState = {
    todayCount: 0,
    logs: [],
    isLoading: false,
    error: null,
};

export const logCigarette = createAsyncThunk(
    'cigs/log',
    async (data: any, thunkAPI) => {
        try {
            return await cigService.logCigarette(data);
        } catch (error: any) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const fetchTodayCount = createAsyncThunk('cigs/today', async (_, thunkAPI) => {
    try {
        return await cigService.getTodayCount();
    } catch (error: any) {
        const message =
            (error.response &&
                error.response.data &&
                error.response.data.error) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const cigSlice = createSlice({
    name: 'cigs',
    initialState,
    reducers: {
        resetCigs: (state) => {
            state.todayCount = 0;
            state.logs = [];
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(logCigarette.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logCigarette.fulfilled, (state, action) => {
                state.isLoading = false;
                state.todayCount = action.payload.totalSmokedToday;
                state.logs.unshift(action.payload.log);
            })
            .addCase(logCigarette.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchTodayCount.fulfilled, (state, action) => {
                state.todayCount = action.payload.count;
            });
    },
});

export const { resetCigs } = cigSlice.actions;
export default cigSlice.reducer;
