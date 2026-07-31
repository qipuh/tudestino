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
    allowNull: false,
  },
}, {
  tableName: 'favorites',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['userId', 'propertyId'] },
  ],
});

export default Favorite;
