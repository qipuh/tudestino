import Conversation from './conversation.model.js';
import Message from './message.model.js';
import User from '../users/user.model-mysql.js';
import { Op } from 'sequelize';

// Obtener o crear una conversación entre dos usuarios
export const getOrCreateConversation = async (user1Id, user2Id, bookingId = null) => {
  // Asegurar que user1Id < user2Id para consistencia (comparar como strings para UUIDs)
  const [smallerId, largerId] = user1Id.localeCompare(user2Id) < 0 ? [user1Id, user2Id] : [user2Id, user1Id];

  let conversation = await Conversation.findOne({
    where: {
      user1Id: smallerId,
      user2Id: largerId,
    },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      user1Id: smallerId,
      user2Id: largerId,
      bookingId,
    });
  }

  return conversation;
};

// Obtener todas las conversaciones de un usuario
export const getUserConversations = async (userId) => {
  const conversations = await Conversation.findAll({
    where: {
      [Op.or]: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    order: [['lastMessageAt', 'DESC']],
  });

  // Agregar información del otro usuario
  const conversationsWithUsers = await Promise.all(
    conversations.map(async (conv) => {
      const convData = conv.toJSON();
      const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;

      const otherUser = await User.findByPk(otherUserId, {
        attributes: ['id', 'name', 'email', 'avatar'],
      });

      convData.otherUser = otherUser;
      convData.unreadCount = conv.user1Id === userId ? conv.unreadCountUser1 : conv.unreadCountUser2;

      return convData;
    })
  );

  return conversationsWithUsers;
};

// Obtener mensajes de una conversación
export const getConversationMessages = async (conversationId, userId, limit = 50) => {
  // Verificar que el usuario es parte de la conversación
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new Error('Conversación no encontrada');
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    throw new Error('No tienes acceso a esta conversación');
  }

  const messages = await Message.findAll({
    where: { conversationId },
    order: [['createdAt', 'ASC']],
    limit,
  });

  // Agregar información del sender
  const messagesWithSender = await Promise.all(
    messages.map(async (msg) => {
      const msgData = msg.toJSON();
      const sender = await User.findByPk(msg.senderId, {
        attributes: ['id', 'name', 'avatar'],
      });
      msgData.sender = sender;
      return msgData;
    })
  );

  return messagesWithSender;
};

// Enviar un mensaje
export const sendMessage = async (conversationId, senderId, content) => {
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new Error('Conversación no encontrada');
  }

  // Verificar que el sender es parte de la conversación
  if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
    throw new Error('No tienes acceso a esta conversación');
  }

  // Determinar automáticamente el receiverId
  const receiverId = conversation.user1Id === senderId ? conversation.user2Id : conversation.user1Id;

  // Crear el mensaje
  const message = await Message.create({
    conversationId,
    senderId,
    receiverId,
    content,
  });

  // Actualizar la conversación
  const unreadField = conversation.user1Id === receiverId ? 'unreadCountUser1' : 'unreadCountUser2';

  await conversation.update({
    lastMessage: content.substring(0, 100), // Preview de 100 caracteres
    lastMessageAt: new Date(),
    [unreadField]: conversation[unreadField] + 1,
  });

  // Agregar información del sender
  const messageData = message.toJSON();
  const sender = await User.findByPk(senderId, {
    attributes: ['id', 'name', 'avatar'],
  });
  messageData.sender = sender;

  return messageData;
};

// Marcar mensajes como leídos
export const markMessagesAsRead = async (conversationId, userId) => {
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new Error('Conversación no encontrada');
  }

  // Marcar todos los mensajes no leídos donde el usuario es el receptor
  await Message.update(
    { isRead: true, readAt: new Date() },
    {
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
    }
  );

  // Resetear el contador de no leídos
  const unreadField = conversation.user1Id === userId ? 'unreadCountUser1' : 'unreadCountUser2';
  await conversation.update({
    [unreadField]: 0,
  });

  return true;
};

// Obtener conversación por ID con validación de acceso
export const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findByPk(conversationId);

  if (!conversation) {
    throw new Error('Conversación no encontrada');
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    throw new Error('No tienes acceso a esta conversación');
  }

  const convData = conversation.toJSON();
  const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;

  const otherUser = await User.findByPk(otherUserId, {
    attributes: ['id', 'name', 'email', 'avatar'],
  });

  convData.otherUser = otherUser;
  convData.unreadCount = conversation.user1Id === userId ? conversation.unreadCountUser1 : conversation.unreadCountUser2;

  return convData;
};
