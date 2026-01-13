import api from './api';

export const attractionsService = {
  /**
   * Obtener todos los atractivos (admin)
   */
  getAll: async (params) => {
    const response = await api.get('/attractions/admin/all', { params });
    // El interceptor ya desenvuelve response.data, entonces response = { success, data }
    return response;
  },

  /**
   * Obtener un atractivo por ID
   */
  getById: async (id) => {
    const response = await api.get(`/attractions/${id}`);
    return response;
  },

  /**
   * Crear un nuevo atractivo
   */
  create: async (formData) => {
    const response = await api.post('/attractions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * Actualizar un atractivo
   */
  update: async (id, formData) => {
    const response = await api.put(`/attractions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * Eliminar un atractivo
   */
  delete: async (id) => {
    const response = await api.delete(`/attractions/${id}`);
    return response;
  },

  /**
   * Subir imágenes a la galería
   */
  uploadGallery: async (id, formData) => {
    const response = await api.post(`/attractions/${id}/gallery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * Eliminar imagen de la galería
   */
  deleteImage: async (id, imageId) => {
    const response = await api.delete(`/attractions/${id}/gallery/${imageId}`);
    return response;
  },

  /**
   * Agregar tag a un atractivo
   */
  addTag: async (id, tagData) => {
    const response = await api.post(`/attractions/${id}/tags`, tagData);
    return response;
  },

  /**
   * Eliminar tag de un atractivo
   */
  removeTag: async (id, tagId) => {
    const response = await api.delete(`/attractions/${id}/tags/${tagId}`);
    return response;
  },
};
