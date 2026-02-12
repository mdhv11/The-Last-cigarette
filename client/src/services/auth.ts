import * as SecureStore from 'expo-secure-store';
import api from './api';

export const authService = {
    signup: async (userData: any) => {
        const response = await api.post('/auth/signup', userData);
        if (response.data.token) {
            await SecureStore.setItemAsync('userToken', response.data.token);
        }
        return response.data;
    },

    login: async (userData: any) => {
        const response = await api.post('/auth/login', userData);
        if (response.data.token) {
            await SecureStore.setItemAsync('userToken', response.data.token);
        }
        return response.data;
    },

    googleLogin: async (idToken: string) => {
        const response = await api.post('/auth/google', { idToken });
        if (response.data.token) {
            await SecureStore.setItemAsync('userToken', response.data.token);
        }
        return response.data;
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('userToken');
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data.user;
    },
};
