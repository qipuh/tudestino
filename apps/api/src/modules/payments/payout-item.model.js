import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const PayoutItem = sequelize.define('PayoutItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  payoutId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'payouts',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'businessNetAmount del payment (snapshot)'
  }
}, {
  tableName: 'payout_items',
  timestamps: true,
  indexes: [
    { fields: ['payoutId'] },
    { fields: ['paymentId'], unique: true }
  ]
});

export default PayoutItem;
