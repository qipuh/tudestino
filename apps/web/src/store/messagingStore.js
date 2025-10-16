import { create } from 'zustand';
import * as messagingService from '../modules/messaging/services/messagingService';

const useMessagingStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0,

  // Obtener todas las conversaciones
  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const conversations = await messagingService.getConversations();
      const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      set({ conversations, unreadCount, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Obtener o crear conversación
  getOrCreateConversation: async (otherUserId, bookingId = null) => {
    set({ loading: true, error: null });
    try {
      const conversation = await messagingService.getOrCreateConversation(otherUserId, bookingId);
      set({ currentConversation: conversation, loading: false });
      return conversation;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Obtener mensajes de una conversación
  fetchMessages: async (conversationId) => {
    set({ loading: true, error: null });
    try {
      const messages = await messagingService.getMessages(conversationId);
      set({ messages, loading: false });

      // Marcar como leídos
      await messagingService.markAsRead(conversationId);

      // Actualizar contador de no leídos
      get().fetchConversations();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Enviar un mensaje
  sendMessage: async (conversationId, content) => {
    try {
      const message = await messagingService.sendMessage(conversationId, content);

      // Agregar mensaje a la lista
      set((state) => ({
        messages: [...state.messages, message],
      }));

      // Actualizar conversaciones para reflejar el último mensaje
      get().fetchConversations();

      return message;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Agregar un mensaje recibido en tiempo real (Socket.IO)
  addIncomingMessage: (message) => {
    set((state) => {
      // Solo agregar si el mensaje es de la conversación actual
      if (state.currentConversation && message.conversationId === state.currentConversation.id) {
        return {
          messages: [...state.messages, message],
        };
      }
      return state;
    });

    // Actualizar conversaciones
    get().fetchConversations();
  },

  // Establecer conversación actual
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation, messages: [] });
  },

  // Limpiar error
  clearError: () => set({ error: null }),

  // Limpiar mensajes
  clearMessages: () => set({ messages: [], currentConversation: null }),
}));

export default useMessagingStore;
