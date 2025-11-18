/**
 * Local storage service using AsyncStorage for offline data persistence
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  PENDING_LOGS: '@pending_logs',
  PENDING_JOURNAL: '@pending_journal',
  CACHED_STATS: '@cached_stats',
  CACHED_PLAN: '@cached_plan',
  LAST_SYNC: '@last_sync',
} as const;

/**
 * Save data to AsyncStorage
 */
export const saveToStorage = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    throw error;
  }
};

/**
 * Get data from AsyncStorage
 */
export const getFromStorage = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 */
export const removeFromStorage = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
    throw error;
  }
};

/**
 * Clear all app data from AsyncStorage
 */
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

/**
 * Get multiple items from storage
 */
export const getMultipleFromStorage = async (keys: string[]): Promise<Record<string, any>> => {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, any> = {};
    
    pairs.forEach(([key, value]) => {
      if (value != null) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error reading multiple from storage:', error);
    return {};
  }
};
