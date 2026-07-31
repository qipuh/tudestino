import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Refund = sequelize.define('Refund', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  paymentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'payments',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  reservationId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Denormalizado para queries rápidas',
    references: {
      model: 'reservations',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto a reembolsar'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requestedBy: {
    type: DataTypes.ENUM('customer', 'business', 'admin', 'system'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('requested', 'approved', 'rejected', 'processed', 'failed'),
    defaultValue: 'requested'
  },
  gatewayRefundId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID de refund en el gateway (Culqi, etc.)'
  },
  platformFeeRefunded: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Comisión tudestino reembolsada (decisión de negocio)'
  },
  businessAmountDeducted: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Cuánto se descuenta del negocio (si es distinto del reembolso total)'
  },
  processedAt: {
    type: DataTypes.DATETIME,
    allowNull: true
  },
  processedByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Admin que aprobó el reembolso',
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'refunds',
  timestamps: true,
  indexes: [
    { fields: ['paymentId'] },
    { fields: ['reservationId'] },
    { fields: ['status'] }
  ]
});

export default Refund;
