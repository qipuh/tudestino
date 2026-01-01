import api from './api';

// ==================== PROFILE SERVICES ====================

// Obtener mi perfil
export const getMyProfile = async () => {
  const response = await api.get('/social/profile');
  return response.data;
};

// Obtener perfil de un usuario
export const getUserProfile = async (userId) => {
  const response = await api.get(`/social/profile/${userId}`);
  return response.data;
};

// Actualizar perfil social
export const updateSocialProfile = async (updates) => {
  const response = await api.patch('/social/profile', updates);
  return response.data;
};

// Subir avatar
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('/social/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // El interceptor de axios ya desenvuelve response.data, así que devolvemos directamente
  return response;
};

// Obtener estadísticas de perfil
export const getProfileStats = async (userId) => {
  const response = await api.get(`/social/profile/${userId}/stats`);
  return response.data;
};

// ==================== FOLLOW SERVICES ====================

// Seguir a un usuario
export const followUser = async (userId) => {
  const response = await api.post(`/social/follow/${userId}`);
  return response.data;
};

// Dejar de seguir a un usuario
export const unfollowUser = async (userId) => {
  const response = await api.delete(`/social/follow/${userId}`);
  return response.data;
};

// Obtener seguidores
export const getFollowers = async (userId, limit = 20, offset = 0) => {
  const response = await api.get(`/social/followers/${userId}`, {
    params: { limit, offset }
  });
  return response.data;
};

// Obtener seguidos
export const getFollowing = async (userId, limit = 20, offset = 0) => {
  const response = await api.get(`/social/following/${userId}`, {
    params: { limit, offset }
  });
  return response.data;
};

// Verificar estado de seguimiento
export const checkFollowStatus = async (userId) => {
  const response = await api.get(`/social/follow/status/${userId}`);
  return response.data;
};

// Buscar usuarios
export const searchUsers = async (query, limit = 20) => {
  const response = await api.get('/social/search/users', {
    params: { q: query, limit }
  });
  return response.data;
};

// ==================== USERNAME SERVICES ====================

// Verificar disponibilidad de username
export const checkUsernameAvailability = async (username) => {
  const response = await api.get(`/social/username/check/${username}`);
  return response; // response already is the data object {success, available, message}
};

// Obtener perfil por username
export const getProfileByUsername = async (username) => {
  const response = await api.get(`/social/profile/by-username/${username}`);
  return response.data;
};
// ==================== POST SERVICES ====================

// Obtener posts de un usuario
export const getUserPosts = async (userId, page = 1, limit = 20) => {
  const response = await api.get(`/social/users/${userId}/posts`, {
    params: { page, limit }
  });
  // El interceptor desenvuelve response.data, entonces response contiene { posts, pagination }
  return response.data; // Devuelve { posts: [...], pagination: {...} }
};

// Obtener reels de un usuario
export const getUserReels = async (userId, page = 1, limit = 20) => {
  const response = await api.get(`/social/users/${userId}/reels`, {
    params: { page, limit }
  });
  // El interceptor desenvuelve response.data, entonces response contiene { reels, pagination }
  return response.data; // Devuelve { reels: [...], pagination: {...} }
};

// Crear un post
export const createPost = async (formData) => {
  const response = await api.post('/social/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Crear un reel
export const createReel = async (formData) => {
  const response = await api.post('/social/reels', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};