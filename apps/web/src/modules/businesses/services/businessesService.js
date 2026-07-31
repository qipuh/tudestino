import api from '../../../services/api';

const API_BASE = '/businesses';

export const businessesService = {
  // Listar negocios con filtros
  getBusinesses: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.districtId) params.append('districtId', filters.districtId);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    return api.get(`${API_BASE}?${params.toString()}`);
  },

  // Obtener negocio por ID
  getBusinessById: async (id) => {
    return api.get(`${API_BASE}/${id}`);
  },

  // Crear negocio
  createBusiness: async (data) => {
    return api.post(API_BASE, data);
  },

  // Actualizar negocio
  updateBusiness: async (id, data) => {
    return api.patch(`${API_BASE}/${id}`, data);
  },

  // Eliminar negocio
  deleteBusiness: async (id) => {
    return api.delete(`${API_BASE}/${id}`);
  },

  // Buscar por ubicación
  searchByLocation: async (lat, lng, radius = 10) => {
    return api.get(`${API_BASE}/search/location`, {
      params: { lat, lng, radius }
    });
  }
};

export default businessesService;
