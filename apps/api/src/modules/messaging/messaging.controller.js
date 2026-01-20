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

    console.log('📝 getOrCreateConversation called:', { userId, otherUserId, bookingId });

    if (!otherUserId) {
      console.log('❌ otherUserId is missing');
      return res.status(400).json({
        success: false,
        message: 'otherUserId es requerido',
      });
    }

    console.log('🔄 Creating/finding conversation...');
    const conversation = await messagingService.getOrCreateConversation(
      userId,
      otherUserId,
      bookingId
    );

    console.log('✅ Conversation created/found:', conversation.id);

    // Obtener la conversación con datos del otro usuario
    console.log('🔄 Getting conversation data...');
    const conversationData = await messagingService.getConversationById(conversation.id, userId);

    console.log('✅ Conversation data retrieved');

    res.json({
      success: true,
      data: conversationData,
    });
  } catch (error) {
    console.error('❌ Error in getOrCreateConversation:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    console.error('❌ Error al enviar mensaje:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(400).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
