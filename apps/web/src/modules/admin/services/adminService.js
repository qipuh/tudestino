import api from '../../../services/api';

export const adminService = {
  // Dashboard stats
  getStats: async () => {
    return api.get('/admin/stats');
  },

  // Businesses management
  getBusinessesForVerification: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);

    return api.get(`/admin/businesses?${params.toString()}`);
  },

  verifyBusiness: async (id, data) => {
    return api.patch(`/admin/businesses/${id}/verify`, data);
  },

  rejectBusiness: async (id, reason) => {
    return api.patch(`/admin/businesses/${id}/reject`, { reason });
  },

  // Payments tracking
  getPayments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);

    return api.get(`/admin/payments?${params.toString()}`);
  },

  getPayoutsByBusiness: async (businessId) => {
    return api.get(`/admin/businesses/${businessId}/payouts`);
  },

  triggerPayout: async (businessId, data) => {
    return api.post(`/admin/businesses/${businessId}/payouts`, data);
  },

  // Users
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.limit) params.append('limit', filters.limit);

    return api.get(`/admin/users?${params.toString()}`);
  },

  // Email (SMTP) settings
  getEmailSettings: async () => {
    return api.get('/settings/email');
  },

  updateEmailSettings: async (data) => {
    return api.put('/settings/email', data);
  },

  sendTestEmail: async (to) => {
    return api.post('/settings/email/test', { to });
  },
};

export default adminService;
