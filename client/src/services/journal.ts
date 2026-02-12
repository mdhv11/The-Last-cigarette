import api from './api';

export const journalService = {
    createEntry: async (data: any) => {
        const response = await api.post('/journal/entry', data);
        return response.data;
    },

    getEntries: async (page = 1, limit = 20) => {
        const response = await api.get('/journal/entries', { params: { page, limit } });
        return response.data;
    },

    deleteEntry: async (id: string) => {
        const response = await api.delete(`/journal/entry/${id}`);
        return response.data;
    },
};
