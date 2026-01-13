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
    type: DataTypes.ENUM('guest', 'host', 'business_owner', 'admin'),
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
    field: 'email_verified',
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailVerificationCode: {
    type: DataTypes.STRING(6),
    allowNull: true,
    field: 'email_verification_code',
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'email_verification_expires',
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'phone_verified',
  },
  phoneVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  phoneVerificationCode: {
    type: DataTypes.STRING(6),
    allowNull: true,
    field: 'phone_verification_code',
  },
  phoneVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'phone_verification_expires',
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'email_verified', 'phone_verified', 'fully_verified'),
    defaultValue: 'pending',
    field: 'verification_status',
  },
  identityVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'identity_verified',
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'first_name',
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'last_name',
  },
  middleName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'middle_name',
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'birth_date',
  },
  nationalityCode: {
    type: DataTypes.CHAR(2),
    allowNull: true,
    field: 'nationality_code',
  },
  documentType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'document_type',
  },
  documentNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'document_number',
  },
  documentFrontPhoto: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'document_front_photo',
  },
  selfiePhoto: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'selfie_photo',
  },
  countryCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'country_code',
  },
  trustScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'trust_score',
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
