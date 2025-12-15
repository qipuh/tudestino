import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const BusinessFollow = sequelize.define('BusinessFollow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
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
  status: {
    type: DataTypes.ENUM('active', 'blocked'),
    defaultValue: 'active'
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'business_follows',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['businessId'] },
    { fields: ['userId', 'businessId'], unique: true },
    { fields: ['status'] }
  ]
});

export default BusinessFollow;
