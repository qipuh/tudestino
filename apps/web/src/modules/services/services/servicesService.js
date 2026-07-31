import api from '../../../services/api';

const API_BASE = '/services';

export const servicesService = {
  // Listar servicios de un negocio
  getServicesByBusiness: async (businessId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);

    return api.get(`${API_BASE}/business/${businessId}?${params.toString()}`);
  },

  // Obtener servicio por ID
  getServiceById: async (id) => {
    return api.get(`${API_BASE}/${id}`);
  },

  // Crear servicio
  createService: async (businessId, data) => {
    return api.post(`${API_BASE}/business/${businessId}`, data);
  },

  // Actualizar servicio
  updateService: async (id, data) => {
    return api.patch(`${API_BASE}/${id}`, data);
  },

  // Eliminar servicio
  deleteService: async (id) => {
    return api.delete(`${API_BASE}/${id}`);
  }
};

export default servicesService;
