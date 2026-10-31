import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';
import Booking from '../bookings/booking.model.js';
import Business from '../businesses/business.model.js';

// Factura ligada a una reserva. `lineItems` guarda el desglose (habitación,
// cargos extra, descuentos) - no se normaliza en tabla aparte porque el
// desglose de una factura ya emitida no debe cambiar con el catálogo.
const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  bookingId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'bookings', key: 'id' },
  },
  businessId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'businesses', key: 'id' },
  },
  guestId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  lineItems: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '[{ concept, quantity, unitPrice, total }]',
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  taxTotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('issued', 'paid', 'void', 'credited'),
    defaultValue: 'issued',
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    { fields: ['bookingId'] },
    { fields: ['businessId'] },
    { fields: ['status'] },
  ],
});

Booking.hasMany(Invoice, { foreignKey: 'bookingId', as: 'invoices' });
Invoice.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Business.hasMany(Invoice, { foreignKey: 'businessId', as: 'invoices' });
Invoice.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

export default Invoice;
