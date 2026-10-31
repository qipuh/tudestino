import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';
import Business from '../businesses/business.model.js';

const CashRegister = sequelize.define('CashRegister', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  businessId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'businesses', key: 'id' },
  },
  openedBy: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  openedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  closedBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  openingFloat: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  expectedCash: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'openingFloat + pagos/reembolsos en efectivo del turno, calculado al cerrar',
  },
  countedCash: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Monto que el cajero contó físicamente al cerrar',
  },
  difference: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'countedCash - expectedCash',
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'cash_registers',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['status'] },
  ],
});

Business.hasMany(CashRegister, { foreignKey: 'businessId', as: 'cashRegisters' });
CashRegister.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

export default CashRegister;
