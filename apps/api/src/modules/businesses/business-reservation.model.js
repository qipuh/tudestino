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
  serviceId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'serviceId',
    comment: 'FK opcional a business_services — qué servicio específico se reservó',
    references: {
      model: 'business_services',
      key: 'id'
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'totalPrice'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'metadata',
    comment: 'Texto libre no facturable. Lo facturable va en serviceId/totalPrice, no aquí.'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'PEN',
    field: 'currency'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'paymentStatus'
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'paymentIntentId',
    comment: 'Referencia del gateway (Culqi charge id u otro)'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'paymentMethod'
  },
  platformFeePercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'platformFeePercent',
    comment: 'Snapshot inmutable del % de comisión tudestino al momento del pago — nunca se recalcula si business.platformFeePercent cambia después'
  },
  platformFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'platformFeeAmount'
  },
  gatewayFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'gatewayFeeAmount',
    comment: 'Fee cobrado por el gateway (Culqi). Puede llegar confirmado después del pago (settlement).'
  },
  businessNetAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'businessNetAmount',
    comment: 'totalPrice - gatewayFeeAmount - platformFeeAmount. Lo que recibe el negocio.'
  },
  refundedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'refundedAmount'
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refundReason'
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'refundedAt'
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
import BusinessService from './business-service.model.js';

BusinessReservation.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Business.hasMany(BusinessReservation, { foreignKey: 'businessId', as: 'businessReservationsLegacy' });

BusinessReservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(BusinessReservation, { foreignKey: 'userId', as: 'businessReservations' });

BusinessReservation.belongsTo(BusinessService, { foreignKey: 'serviceId', as: 'service' });
BusinessService.hasMany(BusinessReservation, { foreignKey: 'serviceId', as: 'reservations' });

export default BusinessReservation;
