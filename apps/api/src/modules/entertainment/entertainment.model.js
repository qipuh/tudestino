import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Entertainment = sequelize.define('Entertainment', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessServiceId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'businessServiceId',
    references: {
      model: 'business_services',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'type'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'category'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'location'
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'address'
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'capacity'
  },
  priceRange: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'priceRange'
  },
  operatingHours: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'operatingHours'
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'amenities'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'images'
  },
  ratingAverage: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    defaultValue: 0.0,
    field: 'ratingAverage'
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'reviewCount'
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'inactive', 'under_maintenance'),
    allowNull: true,
    defaultValue: 'active',
    field: 'status'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'createdAt',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updatedAt',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'entertainment',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

export default Entertainment;
