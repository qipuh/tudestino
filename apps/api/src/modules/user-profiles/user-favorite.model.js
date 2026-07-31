import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const UserFavorite = sequelize.define('UserFavorite', {
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
  }
}, {
  tableName: 'user_favorites',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['businessId'] },
    { fields: ['userId', 'businessId'], unique: true }
  ]
});

export default UserFavorite;
