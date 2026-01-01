import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const BusinessReservation = sequelize.define('BusinessReservation', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'businessId',
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'userId',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reservationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'reservationDate'
  },
  reservationTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'reservationTime'
  },
  numberOfPeople: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'numberOfPeople'
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'specialRequests'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'status'
  },
  confirmationCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'confirmationCode'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'createdAt',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updatedAt',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'business_reservations',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Establecer relaciones
import Business from './business.model.js';
import User from '../users/user.model-mysql.js';

BusinessReservation.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Business.hasMany(BusinessReservation, { foreignKey: 'businessId', as: 'reservations' });

BusinessReservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(BusinessReservation, { foreignKey: 'userId', as: 'businessReservations' });

export default BusinessReservation;
