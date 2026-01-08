import api from './api';

export const slidersService = {
  /**
   * Obtener todos los sliders (admin)
   */
  getAll: async () => {
    const response = await api.get('/sliders/admin/all');
    return response.data;
  },

  /**
   * Obtener un slider por ID
   */
  getById: async (id) => {
    const response = await api.get(`/sliders/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo slider
   */
  create: async (formData) => {
    const response = await api.post('/sliders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Actualizar un slider
   */
  update: async (id, formData) => {
    const response = await api.put(`/sliders/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Eliminar un slider
   */
  delete: async (id) => {
    const response = await api.delete(`/sliders/${id}`);
    return response.data;
  },

  /**
   * Actualizar el orden de los sliders
   */
  updateOrder: async (orderArray) => {
    const response = await api.put('/sliders/order/update', {
      order: orderArray,
    });
    return response.data;
  },
};
