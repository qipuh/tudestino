import api from './api';

// Obtener todas las notificaciones
export const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  const response = await api.get('/notifications', {
    params: { page, limit, unreadOnly },
  });
  return response;
};

// Obtener el conteo de notificaciones no leídas
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response;
};

// Marcar una notificación como leída
export const markAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response;
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response;
};

// Eliminar una notificación
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response;
};
