import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationService, NotificationPreferences } from '../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notification_preferences';

interface NotificationState {
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  isInitialized: boolean;
}

const defaultPreferences: NotificationPreferences = {
  dailyReminders: true,
  achievementAlerts: true,
  cravingSupport: true,
  targetWarnings: true,
  reminderTime: '09:00',
};

const initialState: NotificationState = {
  preferences: defaultPreferences,
  isLoading: false,
  error: null,
  hasPermission: false,
  isInitialized: false,
};

// Async thunks
export const initializeNotifications = createAsyncThunk(
  'notifications/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Load saved preferences
      const savedPrefs = await AsyncStorage.getItem(STORAGE_KEY);
      const preferences = savedPrefs
        ? JSON.parse(savedPrefs)
        : defaultPreferences;

      // Initialize notification service
      const hasPermission = await notificationService.initialize(preferences);

      return { preferences, hasPermission };
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return rejectWithValue('Failed to initialize notifications');
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'notifications/updatePreferences',
  async (preferences: NotificationPreferences, { rejectWithValue }) => {
    try {
      // Save to local storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

      // Update notification service
      await notificationService.updatePreferences(preferences);

      return preferences;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return rejectWithValue('Failed to update notification preferences');
    }
  }
);

export const requestNotificationPermissions = createAsyncThunk(
  'notifications/requestPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const hasPermission = await notificationService.requestPermissions();
      return hasPermission;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return rejectWithValue('Failed to request notification permissions');
    }
  }
);

export const sendAchievementNotification = createAsyncThunk(
  'notifications/sendAchievement',
  async (
    { name, description }: { name: string; description: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { notifications: NotificationState };
      
      if (!state.notifications.preferences.achievementAlerts) {
        return null;
      }

      await notificationService.sendAchievementNotification(name, description);
      return { name, description };
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      return rejectWithValue('Failed to send achievement notification');
    }
  }
);

export const sendTargetWarningNotification = createAsyncThunk(
  'notifications/sendTargetWarning',
  async (
    { remaining, limit }: { remaining: number; limit: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { notifications: NotificationState };
      
      if (!state.notifications.preferences.targetWarnings) {
        return null;
      }

      await notificationService.sendTargetWarning(remaining, limit);
      return { remaining, limit };
    } catch (error) {
      console.error('Error sending target warning notification:', error);
      return rejectWithValue('Failed to send target warning notification');
    }
  }
);

export const sendCravingSupportNotification = createAsyncThunk(
  'notifications/sendCravingSupport',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { notifications: NotificationState };
      
      if (!state.notifications.preferences.cravingSupport) {
        return null;
      }

      await notificationService.sendCravingSupport();
      return true;
    } catch (error) {
      console.error('Error sending craving support notification:', error);
      return rejectWithValue('Failed to send craving support notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.preferences = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Initialize notifications
    builder
      .addCase(initializeNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload.preferences;
        state.hasPermission = action.payload.hasPermission;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      });

    // Update preferences
    builder
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
        state.error = null;
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Request permissions
    builder
      .addCase(requestNotificationPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestNotificationPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasPermission = action.payload;
        state.error = null;
      })
      .addCase(requestNotificationPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setPreferences } = notificationSlice.actions;
export default notificationSlice.reducer;
