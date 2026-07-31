import api from './api';

// Feed de rutas compartidas (público, paginado)
export const getRoutesFeed = async (page = 1, limit = 10, activityType = null) => {
  const params = { page, limit };
  if (activityType) params.activityType = activityType;
  const response = await api.get('/routes/feed', { params });
  return response;
};

// Detalle de una ruta (incluye el track GPS completo)
export const getRouteDetail = async (routeId) => {
  const response = await api.get(`/routes/${routeId}`);
  return response;
};

// Rutas de un usuario ("Mis rutas")
export const getUserRoutes = async (userId, page = 1, limit = 10) => {
  const response = await api.get(`/routes/users/${userId}`, { params: { page, limit } });
  return response;
};

// Eliminar una ruta propia
export const deleteRoute = async (routeId) => {
  const response = await api.delete(`/routes/${routeId}`);
  return response;
};

// Like/unlike y comentarios reusan el sistema social existente (contentType: 'route')
export const toggleLikeRoute = async (routeId) => {
  const response = await api.post('/social/like', { contentType: 'route', contentId: routeId });
  return response;
};

export const getRouteComments = async (routeId) => {
  const response = await api.get(`/social/comments/route/${routeId}`);
  return response;
};

export const addRouteComment = async (routeId, text, parentCommentId = null) => {
  const response = await api.post('/social/comments', {
    contentType: 'route',
    contentId: routeId,
    text,
    parentCommentId,
  });
  return response;
};
