/**
 * API configuration and constants
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Base URL - should be configurable for different environments
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator and web, use localhost
// For physical devices, use your computer's IP address
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Try to get the host from Expo's debugger connection
    // This works for both physical devices and emulators
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
    
    if (debuggerHost) {
      // Extract IP from debuggerHost (format: "192.168.x.x:8081")
      console.log('Using API host from Expo:', debuggerHost);
      return `http://${debuggerHost}:3000/api`;
    }
    
    // Fallback for emulator/simulator
    if (Platform.OS === 'android') {
      console.log('Using Android emulator host: 10.0.2.2');
      return 'http://10.0.2.2:3000/api';
    }
    
    console.log('Using localhost');
    return 'http://localhost:3000/api';
  }
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    ME: "/auth/me",
    VERIFY_TOKEN: "/auth/verify-token",
  },

  // Plan endpoints
  PLAN: {
    SETUP: "/plan/setup",
    UPDATE: "/plan/update",
    CURRENT: "/plan/current",
    TARGETS: "/plan/targets",
  },

  // Cigarette logging endpoints
  CIGS: {
    LOG: "/cigs/log",
    TODAY: "/cigs/today",
    HISTORY: "/cigs/history",
  },

  // Journal endpoints (for future implementation)
  JOURNAL: {
    ENTRY: "/journal/entry",
    ENTRIES: "/journal/entries",
  },

  // Stats endpoints (for future implementation)
  STATS: {
    PROGRESS: "/stats/progress",
    SAVINGS: "/stats/savings",
    ACHIEVEMENTS: "/stats/achievements",
  },
} as const;

// Request timeout configuration
export const REQUEST_TIMEOUT = 10000; // 10 seconds

// Default headers
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
} as const;

/**
 * Build full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Build headers with authentication token
 */
export const buildAuthHeaders = (token?: string) => {
  const headers = { ...DEFAULT_HEADERS };

  if (token) {
    (headers as any).Authorization = `Bearer ${token}`;
  }

  return headers;
};
