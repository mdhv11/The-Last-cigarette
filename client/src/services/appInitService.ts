/**
 * App initialization service for state restoration
 */
import { store } from '../store';
import { verifyToken } from '../store/authSlice';
import { loadLastSyncTime, updatePendingCount, checkOnlineStatus, syncPendingData } from '../store/syncSlice';
import { getFromStorage, STORAGE_KEYS } from './storage';
import { getCurrentPlan } from '../store/planSlice';
import { getTodayStats } from '../store/cigLogSlice';
import { initializeNotifications } from '../store/notificationSlice';

export interface AppInitResult {
  success: boolean;
  isAuthenticated: boolean;
  hasRestoredData: boolean;
  errors: string[];
}

/**
 * Initialize app and restore state
 */
export const initializeApp = async (): Promise<AppInitResult> => {
  const result: AppInitResult = {
    success: true,
    isAuthenticated: false,
    hasRestoredData: false,
    errors: [],
  };

  try {
    // Initialize notifications first (works for both authenticated and non-authenticated users)
    await store.dispatch(initializeNotifications());

    // Check online status
    await store.dispatch(checkOnlineStatus());

    // Try to verify existing token
    const verifyResult = await store.dispatch(verifyToken());
    
    if (verifyToken.fulfilled.match(verifyResult)) {
      result.isAuthenticated = true;
      
      // Load sync state
      await store.dispatch(loadLastSyncTime());
      await store.dispatch(updatePendingCount());
      
      // Try to sync pending data if online
      const state = store.getState();
      if (state.sync.isOnline && state.sync.pendingCount > 0) {
        await store.dispatch(syncPendingData());
      }
      
      // Restore cached data
      await restoreCachedData();
      result.hasRestoredData = true;
      
      // Fetch fresh data if online
      if (state.sync.isOnline) {
        await fetchFreshData();
      }
    } else {
      // Not authenticated, clear any stale data
      result.isAuthenticated = false;
    }
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Initialization error: ${error.message}`);
    console.error('App initialization error:', error);
  }

  return result;
};

/**
 * Restore cached data from local storage
 */
const restoreCachedData = async (): Promise<void> => {
  try {
    // Restore cached plan
    const cachedPlan = await getFromStorage(STORAGE_KEYS.CACHED_PLAN);
    if (cachedPlan) {
      // Plan data will be loaded via getCurrentPlan thunk
      console.log('Cached plan found');
    }

    // Restore cached stats
    const cachedStats = await getFromStorage(STORAGE_KEYS.CACHED_STATS);
    if (cachedStats) {
      // Stats will be loaded via getTodayStats thunk
      console.log('Cached stats found');
    }
  } catch (error) {
    console.error('Error restoring cached data:', error);
  }
};

/**
 * Fetch fresh data from API
 */
const fetchFreshData = async (): Promise<void> => {
  try {
    // Fetch current plan
    await store.dispatch(getCurrentPlan());
    
    // Fetch today's stats
    await store.dispatch(getTodayStats());
  } catch (error) {
    console.error('Error fetching fresh data:', error);
  }
};

/**
 * Backup critical data to local storage
 */
export const backupAppData = async (): Promise<void> => {
  try {
    const state = store.getState();
    
    // Backup plan data
    if (state.plan.currentPlan) {
      await getFromStorage(STORAGE_KEYS.CACHED_PLAN);
    }
    
    // Backup stats data
    if (state.cigLog.todayStats) {
      await getFromStorage(STORAGE_KEYS.CACHED_STATS);
    }
  } catch (error) {
    console.error('Error backing up app data:', error);
  }
};

/**
 * Handle app state changes (foreground/background)
 */
export const handleAppStateChange = async (nextAppState: string): Promise<void> => {
  const state = store.getState();
  
  if (nextAppState === 'active') {
    // App came to foreground
    await store.dispatch(checkOnlineStatus());
    
    // Sync if authenticated and online
    if (state.auth.isAuthenticated && state.sync.isOnline && state.sync.pendingCount > 0) {
      await store.dispatch(syncPendingData());
    }
    
    // Refresh data if online
    if (state.auth.isAuthenticated && state.sync.isOnline) {
      await fetchFreshData();
    }
  } else if (nextAppState === 'background') {
    // App went to background - backup data
    await backupAppData();
  }
};
