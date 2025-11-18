/**
 * Authentication service with secure token storage
 */
import * as SecureStore from 'expo-secure-store';
import { saveToStorage, getFromStorage, removeFromStorage, STORAGE_KEYS } from './storage';

const SECURE_TOKEN_KEY = 'auth_token';

/**
 * Save authentication token securely
 */
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
    // Fallback to AsyncStorage if SecureStore fails
    await saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
  }
};

/**
 * Get authentication token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    // Fallback to AsyncStorage
    return await getFromStorage<string>(STORAGE_KEYS.AUTH_TOKEN);
  }
};

/**
 * Remove authentication token
 */
export const removeAuthToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
  
  // Also remove from AsyncStorage fallback
  await removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Save user data to local storage
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    await saveToStorage(STORAGE_KEYS.USER_DATA, userData);
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

/**
 * Get user data from local storage
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    return await getFromStorage(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Remove user data from local storage
 */
export const removeUserData = async (): Promise<void> => {
  try {
    await removeFromStorage(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

/**
 * Verify token with backend
 */
export const verifyToken = async (token: string, apiBaseUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = async (): Promise<void> => {
  await removeAuthToken();
  await removeUserData();
};
