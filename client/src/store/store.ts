import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import planReducer from './planSlice';
import cigReducer from './cigSlice';
import statsReducer from './statsSlice';
import journalReducer from './journalSlice';
import { storageService } from '../services/storage';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        plan: planReducer,
        cigs: cigReducer,
        stats: statsReducer,
        journal: journalReducer,
    },
});

// Subscribe to store updates to save state
store.subscribe(() => {
    const state = store.getState();
    // Only persist necessary parts of the state
    storageService.saveState({
        plan: state.plan,
        cigs: state.cigs,
        stats: state.stats,
        journal: state.journal,
        // Auth state (user/token) is handled separately via SecureStore and initializeAuth
    });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
