import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { planService } from '../services/plan';

interface PlanState {
    plan: any | null;
    todayTarget: number | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: PlanState = {
    plan: null,
    todayTarget: null,
    isLoading: false,
    error: null,
};

export const setupPlan = createAsyncThunk(
    'plan/setup',
    async (planData: any, thunkAPI) => {
        try {
            return await planService.setupPlan(planData);
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

export const fetchPlan = createAsyncThunk('plan/fetch', async (_, thunkAPI) => {
    try {
        return await planService.getCurrentPlan();
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

export const updatePlan = createAsyncThunk(
    'plan/update',
    async (planData: any, thunkAPI) => {
        try {
            return await planService.updatePlan(planData);
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

export const planSlice = createSlice({
    name: 'plan',
    initialState,
    reducers: {
        resetPlan: (state) => {
            state.plan = null;
            state.todayTarget = null;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(setupPlan.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(setupPlan.fulfilled, (state, action) => {
                state.isLoading = false;
                state.plan = action.payload.plan;
            })
            .addCase(setupPlan.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchPlan.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPlan.fulfilled, (state, action) => {
                state.isLoading = false;
                state.plan = action.payload.plan;
                state.todayTarget = action.payload.todayTarget;
            })
            .addCase(fetchPlan.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updatePlan.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updatePlan.fulfilled, (state, action) => {
                state.isLoading = false;
                state.plan = action.payload.plan;
            })
            .addCase(updatePlan.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetPlan } = planSlice.actions;
export default planSlice.reducer;
