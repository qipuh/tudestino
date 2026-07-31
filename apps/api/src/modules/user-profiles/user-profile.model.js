import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  paymentMethods: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de métodos de pago guardados: [{type, lastDigits, isDefault, metadata}]'
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Preferencias: {notifications, language, currency, theme}'
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  historyVisibility: {
    type: DataTypes.ENUM('public', 'private', 'friends'),
    defaultValue: 'private'
  },
  favoritesVisibility: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'private'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'user_profiles',
  timestamps: true,
  indexes: [
    { fields: ['userId'], unique: true }
  ]
});

export default UserProfile;
