import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const BusinessPhoto = sequelize.define('BusinessPhoto', {
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
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  caption: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'business_photos',
  timestamps: true,
});

export default BusinessPhoto;
