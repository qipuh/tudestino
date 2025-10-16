import * as messagingService from './messaging.service.js';

// Obtener todas las conversaciones del usuario
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await messagingService.getUserConversations(userId);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener o crear una conversación
export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId, bookingId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'otherUserId es requerido',
      });
    }

    const conversation = await messagingService.getOrCreateConversation(
      userId,
      otherUserId,
      bookingId
    );

    // Obtener la conversación con datos del otro usuario
    const conversationData = await messagingService.getConversationById(conversation.id, userId);

    res.json({
      success: true,
      data: conversationData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener mensajes de una conversación
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const messages = await messagingService.getConversationMessages(
      conversationId,
      userId,
      limit
    );

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(error.message.includes('acceso') ? 403 : 404).json({
      success: false,
      message: error.message,
    });
  }
};

// Enviar un mensaje
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    console.log('📤 Intentando enviar mensaje:', { senderId, conversationId, content: content?.substring(0, 50) });

    if (!content) {
      console.log('❌ Falta el contenido del mensaje');
      return res.status(400).json({
        success: false,
        message: 'El contenido del mensaje es requerido',
      });
    }

    const message = await messagingService.sendMessage(
      conversationId,
      senderId,
      content
    );

    console.log('✅ Mensaje creado:', message.id);

    // Aquí se puede emitir el evento de Socket.IO
    if (req.io) {
      req.io.to(`user_${message.receiverId}`).emit('new_message', message);
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Marcar mensajes como leídos
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    await messagingService.markMessagesAsRead(conversationId, userId);

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
