import api from './api';

export const cigService = {
    logCigarette: async (data: { count?: number; location?: string; trigger?: string } = {}) => {
        const response = await api.post('/cigs/log', data);
        return response.data;
    },

    getTodayCount: async () => {
        const response = await api.get('/cigs/today');
        return response.data;
    },

    getHistory: async (startDate?: string, endDate?: string) => {
        const response = await api.get('/cigs/history', { params: { startDate, endDate } });
        return response.data;
    },
};
