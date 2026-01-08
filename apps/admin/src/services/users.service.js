import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export const usersService = {
  // Obtener todos los usuarios
  getAll: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.USERS.LIST, { params });
    return response;
  },

  // Obtener un usuario por ID
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.USERS.DETAIL(id));
    return response;
  },

  // Actualizar un usuario
  update: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.USERS.UPDATE(id), data);
    return response;
  },

  // Eliminar un usuario
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.USERS.DELETE(id));
    return response;
  },
};

export default usersService;
