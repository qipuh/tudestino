import api from '../../../services/api';

/**
 * Servicio de API para posts y reels
 */

// ==================== POSTS ====================

/**
 * Crear un nuevo post
 * @param {FormData} formData - Datos del post (media[], caption, location)
 */
export const createPost = async (formData) => {
  const response = await api.post('/social/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Obtener posts de un usuario
 * @param {string} userId - ID del usuario
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados
 */
export const getUserPosts = async (userId, page = 1, limit = 20) => {
  const response = await api.get(`/social/users/${userId}/posts`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Obtener feed de posts
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados
 */
export const getFeed = async (page = 1, limit = 20) => {
  const response = await api.get('/social/feed', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Eliminar un post
 * @param {string} postId - ID del post
 */
export const deletePost = async (postId) => {
  const response = await api.delete(`/social/posts/${postId}`);
  return response.data;
};

// ==================== REELS ====================

/**
 * Crear un nuevo reel
 * @param {FormData} formData - Datos del reel (video, caption, location, duration)
 */
export const createReel = async (formData) => {
  const response = await api.post('/social/reels', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Obtener reels de un usuario
 * @param {string} userId - ID del usuario
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados
 */
export const getUserReels = async (userId, page = 1, limit = 20) => {
  const response = await api.get(`/social/users/${userId}/reels`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Obtener feed de reels
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados
 */
export const getReelsFeed = async (page = 1, limit = 20) => {
  const response = await api.get('/social/reels/feed', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Eliminar un reel
 * @param {string} reelId - ID del reel
 */
export const deleteReel = async (reelId) => {
  const response = await api.delete(`/social/reels/${reelId}`);
  return response.data;
};

// ==================== LIKES ====================

/**
 * Toggle like en un post o reel
 * @param {string} contentType - 'post' o 'reel'
 * @param {string} contentId - ID del contenido
 */
export const toggleLike = async (contentType, contentId) => {
  const response = await api.post('/social/like', {
    contentType,
    contentId,
  });
  return response; // El interceptor ya desenvuelve response.data
};

// ==================== COMMENTS ====================

/**
 * Agregar comentario
 * @param {string} contentType - 'post' o 'reel'
 * @param {string} contentId - ID del contenido
 * @param {string} text - Texto del comentario
 */
export const addComment = async (contentType, contentId, text) => {
  const response = await api.post('/social/comments', {
    contentType,
    contentId,
    text,
  });
  return response; // El interceptor ya desenvuelve response.data
};

/**
 * Obtener comentarios
 * @param {string} contentType - 'post' o 'reel'
 * @param {string} contentId - ID del contenido
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados
 */
export const getComments = async (contentType, contentId, page = 1, limit = 20) => {
  const response = await api.get(`/social/comments/${contentType}/${contentId}`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Toggle like en un comentario
 * @param {string} commentId - ID del comentario
 */
export const toggleCommentLike = async (commentId) => {
  const response = await api.post(`/social/comments/${commentId}/like`);
  return response; // El interceptor ya desenvuelve response.data
};

export default {
  createPost,
  getUserPosts,
  getFeed,
  deletePost,
  createReel,
  getUserReels,
  getReelsFeed,
  deleteReel,
  toggleLike,
  addComment,
  getComments,
  toggleCommentLike,
};
