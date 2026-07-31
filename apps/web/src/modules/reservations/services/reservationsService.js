import api from '../../../services/api';

const API_BASE = '/reservations';

export const reservationsService = {
  // Listar reservaciones con filtros
  getReservations: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.businessId) params.append('businessId', filters.businessId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    return api.get(`${API_BASE}?${params.toString()}`);
  },

  // Obtener reservación por ID
  getReservationById: async (id) => {
    return api.get(`${API_BASE}/${id}`);
  },

  // Crear reservación
  createReservation: async (data) => {
    return api.post(API_BASE, data);
  },

  // Actualizar estado
  updateStatus: async (id, status) => {
    return api.patch(`${API_BASE}/${id}/status`, { status });
  },

  // Cancelar reservación
  cancelReservation: async (id) => {
    return api.delete(`${API_BASE}/${id}`);
  }
};

export default reservationsService;
