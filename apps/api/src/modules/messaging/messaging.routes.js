import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
} from './messaging.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todas las conversaciones del usuario
router.get('/conversations', getConversations);

// Obtener o crear una conversación
router.post('/conversations', getOrCreateConversation);

// Obtener mensajes de una conversación específica
router.get('/conversations/:conversationId/messages', getMessages);

// Enviar un mensaje en una conversación
router.post('/conversations/:conversationId/messages', sendMessage);

// Marcar mensajes como leídos
router.patch('/conversations/:conversationId/read', markAsRead);

export default router;
