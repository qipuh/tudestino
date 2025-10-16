import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // IDs de los dos participantes
  user1Id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  user2Id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  // ID de la reserva relacionada (opcional)
  bookingId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Bookings',
      key: 'id',
    },
  },
  // Último mensaje para preview
  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Contador de mensajes no leídos por cada usuario
  unreadCountUser1: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unreadCountUser2: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'Conversations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user1Id', 'user2Id'],
    },
  ],
});

export default Conversation;
