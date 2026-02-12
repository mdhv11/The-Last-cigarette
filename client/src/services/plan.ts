import api from './api';

export const planService = {
    setupPlan: async (planData: any) => {
        const response = await api.post('/plan/setup', planData);
        return response.data;
    },

    updatePlan: async (planData: any) => {
        const response = await api.put('/plan/update', planData);
        return response.data;
    },

    getCurrentPlan: async () => {
        const response = await api.get('/plan/current');
        return response.data;
    },

    getTargets: async () => {
        const response = await api.get('/plan/targets');
        return response.data;
    },
};
