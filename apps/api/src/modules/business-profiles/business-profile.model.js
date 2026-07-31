import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const BusinessProfile = sequelize.define('BusinessProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'businesses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  legalName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Razón social del negocio'
  },
  taxId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'RUC/DNI/identificación fiscal'
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contactPhone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'needs_review'),
    defaultValue: 'pending'
  },
  bankAccount: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos bancarios para payouts: {bank, accountType, accountNumber, cci}'
  },
  verificationDocuments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de documentos subidos: [{type, url, uploadedAt, status}]'
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configuración: notificaciones, idioma, etc.'
  }
}, {
  tableName: 'business_profiles',
  timestamps: true,
  indexes: [
    { fields: ['businessId'], unique: true },
    { fields: ['ownerId'] },
    { fields: ['verificationStatus'] }
  ]
});

export default BusinessProfile;
