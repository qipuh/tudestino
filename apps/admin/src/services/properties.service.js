import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export const propertiesService = {
  // Obtener todas las propiedades
  getAll: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.PROPERTIES.LIST, { params });
    return response;
  },

  // Obtener una propiedad por ID
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.PROPERTIES.DETAIL(id));
    return response;
  },

  // Crear una propiedad
  create: async (data) => {
    const response = await api.post(API_ENDPOINTS.PROPERTIES.CREATE, data);
    return response;
  },

  // Actualizar una propiedad
  update: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.PROPERTIES.UPDATE(id), data);
    return response;
  },

  // Eliminar una propiedad
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.PROPERTIES.DELETE(id));
    return response;
  },
};

export default propertiesService;
