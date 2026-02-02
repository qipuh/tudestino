import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM(
      'booking_request',
      'booking_confirmed',
      'booking_cancelled',
      'message_received',
      'payment_received',
      'review_received',
      'property_approved',
      'property_rejected',
      'new_follower',
      'post_liked',
      'reel_liked',
      'comment_liked',
      'comment_received',
      'post_shared',
      'user_mentioned',
      'identity_verified',
      'identity_rejected',
      'verification_pending'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID relacionado (bookingId, messageId, postId, etc.)',
  },
  actorId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID del usuario que realizó la acción',
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales (avatar, nombre del actor, etc.)',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'Notifications',
  timestamps: true,
});

// Definir relaciones
Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
  Notification.belongsTo(models.User, {
    foreignKey: 'actorId',
    as: 'actor',
  });
};

export default Notification;
