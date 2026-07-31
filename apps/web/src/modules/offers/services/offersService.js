import api from '../../../services/api';

const API_BASE = '/offers';

export const offersService = {
  getOffersByBusiness: async (businessId) => {
    return api.get(`${API_BASE}/business/${businessId}`);
  },

  getOfferByCode: async (code) => {
    return api.get(`${API_BASE}/code/${code}`);
  },

  getOfferById: async (id) => {
    return api.get(`${API_BASE}/${id}`);
  },

  createOffer: async (businessId, data) => {
    return api.post(`${API_BASE}/business/${businessId}`, data);
  },

  updateOffer: async (id, data) => {
    return api.patch(`${API_BASE}/${id}`, data);
  },

  deleteOffer: async (id) => {
    return api.delete(`${API_BASE}/${id}`);
  }
};

export default offersService;
