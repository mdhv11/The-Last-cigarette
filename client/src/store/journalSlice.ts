import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../config/api';
import { queueJournalEntry, isOnline } from '../services/syncService';
import { incrementPendingCount } from './syncSlice';

export interface JournalEntry {
  id: string;
  date: string;
  mood: 'very_sad' | 'sad' | 'neutral' | 'happy' | 'very_happy';
  cravingIntensity: number;
  notes?: string;
  triggers?: string[];
  copingStrategies?: string[];
  successfulDelay?: boolean;
  delayDuration?: number;
  createdAt: string;
  updatedAt?: string;
}

interface JournalState {
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;
}

const initialState: JournalState = {
  entries: [],
  isLoading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const createJournalEntry = createAsyncThunk(
  'journal/createEntry',
  async (entryData: Partial<JournalEntry>, { rejectWithValue, dispatch }) => {
    try {
      // Check if online
      const online = await isOnline();
      
      if (!online) {
        // Queue for later sync
        await queueJournalEntry({
          id: `temp_${Date.now()}`,
          date: entryData.date || new Date().toISOString(),
          mood: entryData.mood || 'neutral',
          cravingIntensity: entryData.cravingIntensity || 5,
          notes: entryData.notes,
          triggers: entryData.triggers,
        });
        
        dispatch(incrementPendingCount());
        
        // Return optimistic response
        return {
          success: true,
          queued: true,
          message: "Entry saved offline. Will sync when online.",
          entry: {
            ...entryData,
            id: `temp_${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
        };
      }

      const response = await fetch(`${API_BASE_URL}/journal/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to create journal entry');
      }

      return await response.json();
    } catch (error) {
      // If network error, queue for later
      try {
        await queueJournalEntry({
          id: `temp_${Date.now()}`,
          date: entryData.date || new Date().toISOString(),
          mood: entryData.mood || 'neutral',
          cravingIntensity: entryData.cravingIntensity || 5,
          notes: entryData.notes,
          triggers: entryData.triggers,
        });
        
        dispatch(incrementPendingCount());
        
        return {
          success: true,
          queued: true,
          message: "Entry saved offline. Will sync when online.",
          entry: {
            ...entryData,
            id: `temp_${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
        };
      } catch (queueError) {
        return rejectWithValue('Failed to save journal entry. Please try again.');
      }
    }
  }
);

export const fetchJournalEntries = createAsyncThunk(
  'journal/fetchEntries',
  async (params: { startDate?: string; endDate?: string; limit?: number; page?: number } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.page) queryParams.append('page', params.page.toString());

      const response = await fetch(`${API_BASE_URL}/journal/entries?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to fetch journal entries');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error while fetching journal entries');
    }
  }
);

export const updateJournalEntry = createAsyncThunk(
  'journal/updateEntry',
  async ({ id, data }: { id: string; data: Partial<JournalEntry> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/entry/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to update journal entry');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error while updating journal entry');
    }
  }
);

export const deleteJournalEntry = createAsyncThunk(
  'journal/deleteEntry',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/entry/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || 'Failed to delete journal entry');
      }

      return { id };
    } catch (error) {
      return rejectWithValue('Network error while deleting journal entry');
    }
  }
);

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    clearJournalError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create entry
    builder
      .addCase(createJournalEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries.unshift(action.payload.entry);
      })
      .addCase(createJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch entries
    builder
      .addCase(fetchJournalEntries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload.entries;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update entry
    builder
      .addCase(updateJournalEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.entries.findIndex((e) => e.id === action.payload.entry.id);
        if (index !== -1) {
          state.entries[index] = action.payload.entry;
        }
      })
      .addCase(updateJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete entry
    builder
      .addCase(deleteJournalEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = state.entries.filter((e) => e.id !== action.payload.id);
      })
      .addCase(deleteJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearJournalError } = journalSlice.actions;
export default journalSlice.reducer;
