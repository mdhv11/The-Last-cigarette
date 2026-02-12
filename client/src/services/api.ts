import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

const PROD_API_URL = 'https://the-last-cigarette.onrender.com/api';

// On Android, localhost refers to the device itself, not the dev machine.
// - Android Emulator: use 10.0.2.2 (special alias for host loopback)
// - Physical Android device: use machine's LAN IP
// - iOS/Web: localhost works fine
const getApiUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
    if (envUrl) {
        return envUrl;
    }

    if (!__DEV__) {
        return PROD_API_URL;
    }

    if (Platform.OS === 'android') {
        // If running in emulator, Constants.executionEnvironment might help,
        // but the simplest reliable check: use LAN IP for physical devices
        return 'http://192.168.0.109:5000/api';
    }
    return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for auth token
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for retries
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // If config does not exist or the retry option is not set, reject
        if (!config || !config.retry) {
            return Promise.reject(error);
        }

        // Set the variable for keeping track of the retry count
        config.__retryCount = config.__retryCount || 0;

        // Check if we've maxed out the total number of retries
        if (config.__retryCount >= config.retry) {
            // Reject with the error
            return Promise.reject(error);
        }

        // Increase the retry count
        config.__retryCount += 1;

        // Create new promise to handle exponential backoff
        const backoff = new Promise(function (resolve) {
            setTimeout(function () {
                resolve(null);
            }, config.retryDelay || 1000);
        });

        // Return the promise in which recalls axios to retry the request
        return backoff.then(function () {
            return api(config);
        });
    }
);

export default api;
