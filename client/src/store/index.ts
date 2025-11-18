import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import planReducer from './planSlice';
import cigLogReducer from './cigLogSlice';
import statsReducer from './statsSlice';
import journalReducer from './journalSlice';
import achievementsReducer from './achievementsSlice';
import syncReducer from './syncSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
    cigLog: cigLogReducer,
    stats: statsReducer,
    journal: journalReducer,
    achievements: achievementsReducer,
    sync: syncReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: ['sync/syncData/pending', 'sync/syncData/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['sync.lastSyncTime'],
      },
      immutableCheck: {
        // Reduce performance overhead in development
        warnAfter: 128,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export { useAppDispatch, useAppSelector } from './hooks';