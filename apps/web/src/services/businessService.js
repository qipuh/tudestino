import api from './api';

// ==================== BUSINESS POST SERVICES ====================

/**
 * Crear un post para un negocio
 * @param {string} businessId - ID del negocio
 * @param {FormData} formData - Datos del post (caption, location, type, media)
 * @returns {Promise} - Respuesta con el post creado
 */
export const createBusinessPost = async (businessId, formData) => {
  const response = await api.post(`/businesses/${businessId}/posts`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

/**
 * Obtener posts de un negocio
 * @param {string} businessId - ID del negocio
 * @param {number} page - Página actual
 * @param {number} limit - Cantidad de posts por página
 * @param {string} type - Tipo de post (post, reel, story) - opcional
 * @returns {Promise} - Respuesta con los posts y paginación
 */
export const getBusinessPosts = async (businessId, page = 1, limit = 20, type = null) => {
  const params = { page, limit };
  if (type) params.type = type;

  const response = await api.get(`/businesses/${businessId}/posts`, { params });
  return response.data;
};

/**
 * Obtener un post específico
 * @param {string} postId - ID del post
 * @returns {Promise} - Respuesta con el post
 */
export const getBusinessPostById = async (postId) => {
  const response = await api.get(`/businesses/posts/${postId}`);
  return response.data;
};

/**
 * Actualizar un post
 * @param {string} postId - ID del post
 * @param {object} updateData - Datos a actualizar
 * @returns {Promise} - Respuesta con el post actualizado
 */
export const updateBusinessPost = async (postId, updateData) => {
  const response = await api.put(`/businesses/posts/${postId}`, updateData);
  return response;
};

/**
 * Eliminar un post
 * @param {string} postId - ID del post
 * @returns {Promise} - Respuesta con el mensaje de éxito
 */
export const deleteBusinessPost = async (postId) => {
  const response = await api.delete(`/businesses/posts/${postId}`);
  return response;
};

/**
 * Like/Unlike un post de negocio
 * @param {string} postId - ID del post
 * @returns {Promise} - Respuesta con el estado del like
 */
export const toggleBusinessPostLike = async (postId) => {
  const response = await api.post(`/businesses/posts/${postId}/like`);
  return response.data;
};

/**
 * Obtener feed de posts de negocios seguidos
 * @param {number} page - Página actual
 * @param {number} limit - Cantidad de posts por página
 * @returns {Promise} - Respuesta con el feed y paginación
 */
export const getBusinessPostsFeed = async (page = 1, limit = 20) => {
  const response = await api.get('/businesses/posts/feed', {
    params: { page, limit }
  });
  return response.data;
};
