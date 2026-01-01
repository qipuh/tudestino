import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  propertyId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id',
    },
  },
  guestId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  hostId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  checkIn: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  checkOut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  // Precios
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  cleaningFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  serviceFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  // Estado de la reserva
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rejected'),
    defaultValue: 'pending',
  },
  // Información de pago
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
    defaultValue: 'pending',
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Notas
  guestNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancelledBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'bookings',
  timestamps: true,
});

export default Booking;
