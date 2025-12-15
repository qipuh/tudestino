import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ownerId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'owner_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Ubicación
  address: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Perú'
  },
  zipCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'zip_code'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  // Información de contacto
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Horarios (JSON string con horarios por día)
  schedule: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    }
  },
  // Capacidad
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Capacidad total de personas'
  },
  // Categorías de cocina (JSON array)
  cuisineTypes: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'cuisine_types',
    defaultValue: [],
    comment: 'Array de tipos de cocina: pizza, pasta, pescado, etc.'
  },
  // Características especiales
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Características: wifi, estacionamiento, terraza, etc.'
  },
  // Opciones dietéticas
  dietaryOptions: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'dietary_options',
    defaultValue: [],
    comment: 'Opciones: vegano, vegetariano, sin gluten, etc.'
  },
  // Rango de precios (1-4, siendo 4 el más caro)
  priceRange: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'price_range',
    defaultValue: 2,
    validate: {
      min: 1,
      max: 4
    }
  },
  // Servicios
  hasDelivery: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_delivery',
    defaultValue: false
  },
  hasTakeout: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_takeout',
    defaultValue: false
  },
  acceptsReservations: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'accepts_reservations',
    defaultValue: true
  },
  // Calificación
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    field: 'average_rating',
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_reviews',
    defaultValue: 0
  },
  // Estado
  status: {
    type: DataTypes.ENUM('draft', 'published', 'suspended'),
    allowNull: false,
    defaultValue: 'draft'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_active',
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'restaurants',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['owner_id']
    },
    {
      fields: ['city']
    },
    {
      fields: ['status']
    },
    {
      fields: ['average_rating']
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
});

export default Restaurant;
