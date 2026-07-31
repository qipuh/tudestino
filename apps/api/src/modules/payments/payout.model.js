import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Payout = sequelize.define('Payout', {
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
  periodStart: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Inicio del período de pago'
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fin del período de pago'
  },
  grossAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Suma de businessNetAmounts de payments en este período'
  },
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Descuentos por reembolsos u otros (negativos en el pago final)'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto final a transferir: grossAmount - deductions'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'paid', 'failed', 'on_hold'),
    defaultValue: 'pending'
  },
  bankAccountSnapshot: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Snapshot de datos bancarios al momento del payout'
  },
  paidAt: {
    type: DataTypes.DATETIME,
    allowNull: true
  },
  transactionReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Referencia de transferencia bancaria (comprobante)'
  }
}, {
  tableName: 'payouts',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['status'] },
    { fields: ['periodStart'] },
    { fields: ['businessId', 'status'] }
  ]
});

export default Payout;
