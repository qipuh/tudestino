import apiClient from '../../../services/apiClient';

const API_BASE = '/api/businesses';

export const businessesService = {
  // Listar negocios con filtros
  getBusinesses: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.districtId) params.append('districtId', filters.districtId);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const response = await apiClient.get(`${API_BASE}?${params.toString()}`);
    return response.data;
  },

  // Obtener negocio por ID
  getBusinessById: async (id) => {
    const response = await apiClient.get(`${API_BASE}/${id}`);
    return response.data;
  },

  // Crear negocio
  createBusiness: async (data) => {
    const response = await apiClient.post(API_BASE, data);
    return response.data;
  },

  // Actualizar negocio
  updateBusiness: async (id, data) => {
    const response = await apiClient.patch(`${API_BASE}/${id}`, data);
    return response.data;
  },

  // Eliminar negocio
  deleteBusiness: async (id) => {
    const response = await apiClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  // Buscar por ubicación
  searchByLocation: async (lat, lng, radius = 10) => {
    const response = await apiClient.get(`${API_BASE}/search/location`, {
      params: { lat, lng, radius }
    });
    return response.data;
  }
};

export default businessesService;
