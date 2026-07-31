import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK opcional a service si la reserva incluye un servicio específico',
    references: {
      model: 'services',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  reservationDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reservationTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  numberOfPeople: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show'),
    defaultValue: 'pending'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.CHAR(3),
    defaultValue: 'PEN',
    comment: 'Moneda de la reserva'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
    defaultValue: 'pending'
  },
  paymentIntentId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID de Culqi u otro gateway'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  platformFeePercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Snapshot de comisión al momento de pago'
  },
  platformFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  gatewayFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  businessNetAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  refundedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos libres: notas especiales, preferencias, etc.'
  }
}, {
  tableName: 'reservations',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['paymentStatus'] },
    { fields: ['reservationDate'] },
    { fields: ['businessId', 'reservationDate', 'status'] }
  ]
});

export default Reservation;
