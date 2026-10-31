import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';
import Invoice from './invoice.model.js';
import CashRegister from './cash-register.model.js';

// Pago (o reembolso, con amount negativo e isRefund=true) aplicado a una
// factura. Una factura puede tener varios pagos con distintos métodos -
// eso es lo que permite "múltiples formas de pago" sin duplicar facturas.
const InvoicePayment = sequelize.define('InvoicePayment', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'invoices', key: 'id' },
  },
  method: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'other'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Negativo cuando isRefund=true',
  },
  isRefund: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo del reembolso/nota de crédito, si aplica',
  },
  reference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Código de autorización, número de transferencia, etc.',
  },
  cashRegisterId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: { model: 'cash_registers', key: 'id' },
    comment: 'Turno de caja donde se registró, solo para method=cash',
  },
  registeredBy: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
}, {
  tableName: 'invoice_payments',
  timestamps: true,
  indexes: [
    { fields: ['invoiceId'] },
    { fields: ['cashRegisterId'] },
    { fields: ['method'] },
  ],
});

Invoice.hasMany(InvoicePayment, { foreignKey: 'invoiceId', as: 'payments' });
InvoicePayment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

CashRegister.hasMany(InvoicePayment, { foreignKey: 'cashRegisterId', as: 'cashMovements' });
InvoicePayment.belongsTo(CashRegister, { foreignKey: 'cashRegisterId', as: 'cashRegister' });

export default InvoicePayment;
