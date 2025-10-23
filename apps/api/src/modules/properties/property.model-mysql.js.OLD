import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  hostId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false, // apartment, house, room, etc.
  },
  // Location
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  // Pricing
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  cleaningFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  serviceFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  // Capacity
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  beds: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Amenities
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // Images
  images: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  // Rules
  checkIn: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  checkOut: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  minimumStay: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  maximumStay: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  smokingAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  petsAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  eventsAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'published', 'suspended'),
    defaultValue: 'draft',
  },
  // Rating
  averageRating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5,
    },
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'properties',
  timestamps: true,
  indexes: [
    {
      fields: ['hostId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['city']
    },
    {
      fields: ['basePrice']
    }
  ]
});

export default Property;
