import api from './api';

export const statsService = {
    getDashboardStats: async () => {
        const response = await api.get('/stats/dashboard');
        return response.data;
    },

    getProgressStats: async () => {
        const response = await api.get('/stats/progress');
        return response.data;
    },

    getSavingsStats: async () => {
        const response = await api.get('/stats/savings');
        return response.data;
    },

    getAchievements: async () => {
        const response = await api.get('/stats/achievements');
        return response.data;
    },
};
