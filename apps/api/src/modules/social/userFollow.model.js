import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const UserFollow = sequelize.define('UserFollow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  followerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Usuario que sigue'
  },
  followingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Usuario siendo seguido'
  },
  status: {
    type: DataTypes.ENUM('active', 'blocked'),
    defaultValue: 'active',
    comment: 'Estado del seguimiento'
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si recibe notificaciones del usuario seguido'
  },
}, {
  tableName: 'UserFollows',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId'],
      name: 'unique_follow'
    },
    {
      fields: ['followerId']
    },
    {
      fields: ['followingId']
    },
    {
      fields: ['status']
    }
  ]
});

export default UserFollow;
