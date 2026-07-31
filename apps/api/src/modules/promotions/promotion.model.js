import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage',
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  maxUses: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Null = usos ilimitados',
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'promotions',
  timestamps: true,
});

export default Promotion;
