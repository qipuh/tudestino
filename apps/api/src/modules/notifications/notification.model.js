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
      'property_rejected'
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
    comment: 'ID relacionado (bookingId, messageId, etc.)',
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

export default Notification;
