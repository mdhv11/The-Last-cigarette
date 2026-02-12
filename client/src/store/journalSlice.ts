import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { journalService } from '../services/journal';

interface JournalState {
    entries: any[];
    isLoading: boolean;
    error: string | null;
}

const initialState: JournalState = {
    entries: [],
    isLoading: false,
    error: null,
};

export const createEntry = createAsyncThunk(
    'journal/create',
    async (data: any, thunkAPI) => {
        try {
            return await journalService.createEntry(data);
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

export const fetchEntries = createAsyncThunk(
    'journal/fetch',
    async ({ page, limit }: { page?: number; limit?: number } = {}, thunkAPI) => {
        try {
            return await journalService.getEntries(page, limit);
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

export const deleteEntry = createAsyncThunk(
    'journal/delete',
    async (id: string, thunkAPI) => {
        try {
            await journalService.deleteEntry(id);
            return id;
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

export const journalSlice = createSlice({
    name: 'journal',
    initialState,
    reducers: {
        resetJournal: (state) => {
            state.entries = [];
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createEntry.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createEntry.fulfilled, (state, action) => {
                state.isLoading = false;
                state.entries.unshift(action.payload.entry);
            })
            .addCase(createEntry.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchEntries.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchEntries.fulfilled, (state, action) => {
                state.isLoading = false;
                state.entries = action.payload.entries;
            })
            .addCase(fetchEntries.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteEntry.fulfilled, (state, action) => {
                state.entries = state.entries.filter((entry) => entry._id !== action.payload);
            });
    },
});

export const { resetJournal } = journalSlice.actions;
export default journalSlice.reducer;
