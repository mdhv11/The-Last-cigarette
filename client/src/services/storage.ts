import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const STATE_KEY = 'redux_state';

// Secure Store wrapper (works on iOS/Android, falls back to AsyncStorage on web if needed)
const secureStore = {
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            await AsyncStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return await AsyncStorage.getItem(key);
        } else {
            return await SecureStore.getItemAsync(key);
        }
    },
    deleteItem: async (key: string) => {
        if (Platform.OS === 'web') {
            await AsyncStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    }
};

export const storageService = {
    // Auth Token
    saveToken: async (token: string) => {
        try {
            await secureStore.setItem(TOKEN_KEY, token);
        } catch (error) {}
    },
    getToken: async () => {
        try {
            return await secureStore.getItem(TOKEN_KEY);
        } catch (error) {
            return null;
        }
    },
    removeToken: async () => {
        try {
            await secureStore.deleteItem(TOKEN_KEY);
        } catch (error) {}
    },

    // Redux State
    saveState: async (state: any) => {
        try {
            const jsonState = JSON.stringify(state);
            await AsyncStorage.setItem(STATE_KEY, jsonState);
        } catch (error) {}
    },
    loadState: async () => {
        try {
            const jsonState = await AsyncStorage.getItem(STATE_KEY);
            return jsonState ? JSON.parse(jsonState) : undefined;
        } catch (error) {
            return undefined;
        }
    },
    clearState: async () => {
        try {
            await AsyncStorage.removeItem(STATE_KEY);
        } catch (error) {}
    }
};
