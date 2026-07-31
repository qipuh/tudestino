import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  reservationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'reservations',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Denormalizado para queries rápidas',
    references: {
      model: 'businesses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  grossAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto total cobrado al cliente'
  },
  currency: {
    type: DataTypes.CHAR(3),
    defaultValue: 'PEN'
  },
  gatewayProvider: {
    type: DataTypes.ENUM('culqi', 'mercadopago', 'stripe', 'paypal', 'other'),
    allowNull: false
  },
  gatewayTransactionId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'ID único del gateway (previene doble procesamiento)'
  },
  gatewayFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Comisión del gateway (nullable si no ha sido confirmada)'
  },
  gatewayFeeStatus: {
    type: DataTypes.ENUM('estimated', 'confirmed'),
    comment: 'Si el fee es estimado o confirmado por el gateway'
  },
  platformFeePercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Snapshot de comisión tudestino % al momento del pago'
  },
  platformFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  businessNetAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Lo que recibe el negocio después de fees'
  },
  status: {
    type: DataTypes.ENUM('pending', 'authorized', 'completed', 'failed', 'refunded', 'partially_refunded'),
    defaultValue: 'pending'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    { fields: ['reservationId'] },
    { fields: ['businessId'] },
    { fields: ['gatewayTransactionId'], unique: true },
    { fields: ['status'] },
    { fields: ['paidAt'] },
    { fields: ['businessId', 'status'] }
  ]
});

export default Payment;
