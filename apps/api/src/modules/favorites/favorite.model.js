import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  propertyId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
  },
  businessId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    comment: 'FK a businesses (restaurant/spa/entertainment/etc). Exactamente uno de propertyId/businessId debe estar seteado.',
  },
}, {
  tableName: 'favorites',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['userId', 'propertyId'] },
    { unique: true, fields: ['userId', 'businessId'] },
  ],
});

export default Favorite;
