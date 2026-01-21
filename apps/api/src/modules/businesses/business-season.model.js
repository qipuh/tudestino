import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const BusinessSeason = sequelize.define('BusinessSeason', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  businessId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('high', 'low', 'custom'),
    allowNull: false,
    defaultValue: 'high',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'business_seasons',
  timestamps: true,
});

export default BusinessSeason;
