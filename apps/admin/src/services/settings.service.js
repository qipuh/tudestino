import api from './api';

export const settingsService = {
  getPaymentSettings: async () => {
    const response = await api.get('/settings/payment');
    return response.data;
  },

  updatePaymentSettings: async ({ culqiPublicKey, culqiSecretKey }) => {
    const response = await api.put('/settings/payment', { culqiPublicKey, culqiSecretKey });
    return response.data;
  },

  getEmailSettings: async () => {
    const response = await api.get('/settings/email');
    return response.data;
  },

  updateEmailSettings: async (payload) => {
    const response = await api.put('/settings/email', payload);
    return response.data;
  },

  getWhatsAppSettings: async () => {
    const response = await api.get('/settings/whatsapp');
    return response.data;
  },

  updateWhatsAppSettings: async (payload) => {
    const response = await api.put('/settings/whatsapp', payload);
    return response.data;
  },

  getRoutingSettings: async () => {
    const response = await api.get('/settings/routing');
    return response.data;
  },

  updateRoutingSettings: async (payload) => {
    const response = await api.put('/settings/routing', payload);
    return response.data;
  },
};
