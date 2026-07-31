import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isLowercase: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 5000]
    }
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  businessType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Tipo principal de negocio: hotel, restaurant, entertainment, etc.'
  },
  hotelSubtype: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Subtipo de alojamiento: hotel, hostel, apartment, bnb, resort, villa, etc.'
  },
  hotelCategory: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Categoría del alojamiento: estrellas, llaves, espigas, mochilas, etc.'
  },
  taxId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  verificationStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  verificationDocuments: {
    type: DataTypes.JSON,
    allowNull: true
  },
  address: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON: {street, city, state, country, zipCode, latitude, longitude}'
  },
  contactPhone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  website: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  operatingHours: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Horarios de operación por día de la semana'
  },
  socialMediaLinks: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Links a redes sociales: {facebook, instagram, twitter, etc.}'
  },
  ratingAverage: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  followersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending_verification', 'active', 'suspended', 'inactive'),
    defaultValue: 'active'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  districtId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'district_id',
    comment: 'FK a districts (jerarquía país→departamento→provincia→distrito)',
    references: {
      model: 'districts',
      key: 'id'
    }
  },
  cuisine: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Spec restaurant: tipo de cocina (criolla, italiana, fusión, etc.)'
  },
  priceRange: {
    type: DataTypes.ENUM('$', '$$', '$$$', '$$$$'),
    allowNull: true,
    comment: 'Spec restaurant: rango de precio'
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Spec events/entertainment/spa: aforo máximo'
  },
  eventDateStart: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Spec events: inicio (null para negocios permanentes)'
  },
  eventDateEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Spec events: fin'
  },
  platformFeePercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Comisión tudestino % para este negocio. Null = usar default global (config/env).'
  },
  bankAccount: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos bancarios para desembolsos: {bank, accountType, accountNumber, cci}'
  }
}, {
  tableName: 'businesses',
  timestamps: true,
  indexes: [
    { fields: ['ownerId'] },
    { fields: ['slug'], unique: true },
    { fields: ['status'] },
    { fields: ['businessType'] },
    { fields: ['verificationStatus'] }
  ]
});

export default Business;
