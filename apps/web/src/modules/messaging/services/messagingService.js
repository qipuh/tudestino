import api from '../../../services/api';

// Obtener todas las conversaciones del usuario
export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

// Obtener o crear una conversación
export const getOrCreateConversation = async (otherUserId, bookingId = null) => {
  const response = await api.post('/messages/conversations', {
    otherUserId,
    bookingId,
  });
  return response.data;
};

// Obtener mensajes de una conversación
export const getMessages = async (conversationId, limit = 50) => {
  const response = await api.get(`/messages/conversations/${conversationId}/messages`, {
    params: { limit },
  });
  return response.data;
};

// Enviar un mensaje
export const sendMessage = async (conversationId, content) => {
  const response = await api.post(`/messages/conversations/${conversationId}/messages`, {
    content,
  });
  return response.data;
};

// Marcar mensajes como leídos
export const markAsRead = async (conversationId) => {
  const response = await api.patch(`/messages/conversations/${conversationId}/read`);
  return response;
};
