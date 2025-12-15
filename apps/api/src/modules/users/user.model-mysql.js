import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: true,
    unique: true,
    validate: {
      is: ['^[a-z0-9-]{3,30}$', 'i'],
    },
    comment: 'URL personalizada del perfil (ej: mi-empresa)'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('guest', 'business_owner', 'admin'),
    defaultValue: 'guest',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Profile
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  languages: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Verification
  identityStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
  },
  identityDocumentType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  identityDocumentUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  identityVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  phoneVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Travel & Social Profile Fields (from DB)
  travelInterests: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  visitedDestinations: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  travelStyle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Social Stats
  followersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Número de seguidores'
  },
  followingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Número de usuarios seguidos'
  },
  postsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Número de posts publicados'
  },
  reelsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Número de reels publicados'
  },
  totalLikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total de likes recibidos en todos los reels'
  },
  // Social Settings
  isPublicProfile: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si el perfil es público o privado'
  },
  allowMessages: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si permite mensajes de usuarios que no sigue'
  },
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['username']
    },
    {
      fields: ['role']
    },
    {
      fields: ['followersCount']
    },
    {
      fields: ['reelsCount']
    }
  ]
});

export default User;
