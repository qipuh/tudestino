import Notification from './notification.model.js';
import User from '../users/user.model-mysql.js';
import { Op } from 'sequelize';
import { sendPushNotification } from '../../config/firebase-admin.js';

/**
 * Helper para crear notificaciones automáticamente
 */

// Crea la notificación en BD (como antes) y de paso intenta enviar el push -
// silencioso si Firebase no está configurado o el usuario no tiene fcmToken.
const createNotificationAndPush = async (payload) => {
  const notification = await Notification.create(payload);

  const recipient = await User.findByPk(payload.userId, { attributes: ['fcmToken'] });
  if (recipient?.fcmToken) {
    await sendPushNotification(recipient.fcmToken, {
      title: payload.title,
      message: payload.message,
      data: { type: payload.type, relatedId: payload.relatedId || '' },
    });
  }

  return notification;
};

// Notificación de nuevo seguidor
export const createFollowerNotification = async (followedUserId, followerUserId) => {
  try {
    const follower = await User.findByPk(followerUserId, {
      attributes: ['id', 'name', 'username', 'avatar'],
    });

    if (!follower) return;

    await createNotificationAndPush({
      userId: followedUserId,
      actorId: followerUserId,
      type: 'new_follower',
      title: 'Nuevo seguidor',
      message: `${follower.name} ha comenzado a seguirte`,
      metadata: {
        actorName: follower.name,
        actorUsername: follower.username,
        actorAvatar: follower.avatar,
      },
    });
  } catch (error) {
    console.error('Error creating follower notification:', error);
  }
};

// Notificación de like en post
export const createPostLikeNotification = async (postOwnerId, likerUserId, postId) => {
  try {
    // No notificar si el usuario le da like a su propio post
    if (postOwnerId === likerUserId) return;

    const liker = await User.findByPk(likerUserId, {
      attributes: ['id', 'name', 'username', 'avatar'],
    });

    if (!liker) return;

    // Verificar si ya existe una notificación similar reciente (evitar spam)
    const recentNotification = await Notification.findOne({
      where: {
        userId: postOwnerId,
        actorId: likerUserId,
        type: 'post_liked',
        relatedId: postId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
        },
      },
    });

    if (recentNotification) return;

    await createNotificationAndPush({
      userId: postOwnerId,
      actorId: likerUserId,
      type: 'post_liked',
      title: 'Le gustó tu publicación',
      message: `A ${liker.name} le gustó tu publicación`,
      relatedId: postId,
      metadata: {
        actorName: liker.name,
        actorUsername: liker.username,
        actorAvatar: liker.avatar,
      },
    });
  } catch (error) {
    console.error('Error creating post like notification:', error);
  }
};

// Notificación de like en reel
export const createReelLikeNotification = async (reelOwnerId, likerUserId, reelId) => {
  try {
    if (reelOwnerId === likerUserId) return;

    const liker = await User.findByPk(likerUserId, {
      attributes: ['id', 'name', 'username', 'avatar'],
    });

    if (!liker) return;

    const recentNotification = await Notification.findOne({
      where: {
        userId: reelOwnerId,
        actorId: likerUserId,
        type: 'reel_liked',
        relatedId: reelId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (recentNotification) return;

    await createNotificationAndPush({
      userId: reelOwnerId,
      actorId: likerUserId,
      type: 'reel_liked',
      title: 'Le gustó tu reel',
      message: `A ${liker.name} le gustó tu reel`,
      relatedId: reelId,
      metadata: {
        actorName: liker.name,
        actorUsername: liker.username,
        actorAvatar: liker.avatar,
      },
    });
  } catch (error) {
    console.error('Error creating reel like notification:', error);
  }
};

// Notificación de comentario recibido
export const createCommentNotification = async (postOwnerId, commenterId, postId, commentText) => {
  try {
    if (postOwnerId === commenterId) return;

    const commenter = await User.findByPk(commenterId, {
      attributes: ['id', 'name', 'username', 'avatar'],
    });

    if (!commenter) return;

    await createNotificationAndPush({
      userId: postOwnerId,
      actorId: commenterId,
      type: 'comment_received',
      title: 'Nuevo comentario',
      message: `${commenter.name} comentó: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
      relatedId: postId,
      metadata: {
        actorName: commenter.name,
        actorUsername: commenter.username,
        actorAvatar: commenter.avatar,
      },
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
  }
};

// Notificación de like en comentario
export const createCommentLikeNotification = async (commentOwnerId, likerUserId, commentId) => {
  try {
    if (commentOwnerId === likerUserId) return;

    const liker = await User.findByPk(likerUserId, {
      attributes: ['id', 'name', 'username', 'avatar'],
    });

    if (!liker) return;

    const recentNotification = await Notification.findOne({
      where: {
        userId: commentOwnerId,
        actorId: likerUserId,
        type: 'comment_liked',
        relatedId: commentId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (recentNotification) return;

    await createNotificationAndPush({
      userId: commentOwnerId,
      actorId: likerUserId,
      type: 'comment_liked',
      title: 'Le gustó tu comentario',
      message: `A ${liker.name} le gustó tu comentario`,
      relatedId: commentId,
      metadata: {
        actorName: liker.name,
        actorUsername: liker.username,
        actorAvatar: liker.avatar,
      },
    });
  } catch (error) {
    console.error('Error creating comment like notification:', error);
  }
};

// Notificación de reserva confirmada
export const createBookingConfirmedNotification = async (guestId, bookingId, propertyName) => {
  try {
    await createNotificationAndPush({
      userId: guestId,
      type: 'booking_confirmed',
      title: 'Reserva confirmada',
      message: `Tu reserva en ${propertyName} ha sido confirmada`,
      relatedId: bookingId,
    });
  } catch (error) {
    console.error('Error creating booking confirmed notification:', error);
  }
};

// Notificación de nueva reserva recibida (para el host)
export const createBookingRequestNotification = async (hostId, guestId, bookingId, propertyName) => {
  try {
    const guest = await User.findByPk(guestId, {
      attributes: ['id', 'name', 'username', 'avatar'],
    });

    if (!guest) return;

    await createNotificationAndPush({
      userId: hostId,
      actorId: guestId,
      type: 'booking_request',
      title: 'Nueva reserva recibida',
      message: `${guest.name} ha realizado una reserva en ${propertyName}`,
      relatedId: bookingId,
      metadata: {
        actorName: guest.name,
        actorUsername: guest.username,
        actorAvatar: guest.avatar,
        propertyName,
      },
    });
  } catch (error) {
    console.error('Error creating booking request notification:', error);
  }
};

// Notificación de mensaje recibido
export const createMessageNotification = async (receiverId, senderId, conversationId) => {
  try {
    const sender = await User.findByPk(senderId, {
      attributes: ['id', 'name', 'username', 'avatar'],
    });

    if (!sender) return;

    await createNotificationAndPush({
      userId: receiverId,
      actorId: senderId,
      type: 'message_received',
      title: 'Nuevo mensaje',
      message: `${sender.name} te ha enviado un mensaje`,
      relatedId: conversationId,
      metadata: {
        actorName: sender.name,
        actorUsername: sender.username,
        actorAvatar: sender.avatar,
      },
    });
  } catch (error) {
    console.error('Error creating message notification:', error);
  }
};

export default {
  createFollowerNotification,
  createPostLikeNotification,
  createReelLikeNotification,
  createCommentNotification,
  createCommentLikeNotification,
  createBookingConfirmedNotification,
  createBookingRequestNotification,
  createMessageNotification,
};
