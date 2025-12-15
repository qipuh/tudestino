import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Entertainment = sequelize.define('Entertainment', {
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
  // Tipo de establecimiento
  type: {
    type: DataTypes.ENUM(
      'bar',
      'club',
      'lounge',
      'rooftop',
      'karaoke',
      'casino',
      'bowling',
      'escape_room',
      'arcade',
      'pool_hall',
      'sports_bar',
      'wine_bar',
      'cocktail_bar',
      'pub',
      'nightclub',
      'disco',
      'live_music',
      'comedy_club',
      'other'
    ),
    allowNull: false,
    defaultValue: 'bar'
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
  socialMedia: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'social_media',
    defaultValue: {},
    comment: 'Enlaces a redes sociales: facebook, instagram, twitter, etc.'
  },
  // Horarios (JSON string con horarios por día)
  schedule: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      monday: { open: '18:00', close: '02:00', closed: false },
      tuesday: { open: '18:00', close: '02:00', closed: false },
      wednesday: { open: '18:00', close: '02:00', closed: false },
      thursday: { open: '18:00', close: '03:00', closed: false },
      friday: { open: '18:00', close: '04:00', closed: false },
      saturday: { open: '18:00', close: '04:00', closed: false },
      sunday: { open: '18:00', close: '00:00', closed: false }
    }
  },
  // Capacidad
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Capacidad total de personas'
  },
  minAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'min_age',
    defaultValue: 18,
    comment: 'Edad mínima requerida'
  },
  // Características y servicios
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Características: wifi, estacionamiento, terraza, aire_acondicionado, etc.'
  },
  musicGenres: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'music_genres',
    defaultValue: [],
    comment: 'Géneros musicales: rock, electrónica, reggaeton, salsa, etc.'
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Servicios: vip_area, dance_floor, live_music, dj, karaoke, pool_table, etc.'
  },
  // Código de vestimenta
  dressCode: {
    type: DataTypes.ENUM('casual', 'smart_casual', 'formal', 'none'),
    allowNull: false,
    field: 'dress_code',
    defaultValue: 'casual'
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
  // Precios de entrada
  coverCharge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'cover_charge',
    comment: 'Precio de entrada/cover'
  },
  coverChargeCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'cover_charge_currency',
    defaultValue: 'PEN'
  },
  hasCoverCharge: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_cover_charge',
    defaultValue: false
  },
  // Consumo mínimo
  minimumConsumption: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'minimum_consumption'
  },
  hasMinimumConsumption: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_minimum_consumption',
    defaultValue: false
  },
  // Servicios
  acceptsReservations: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'accepts_reservations',
    defaultValue: true
  },
  hasVipArea: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_vip_area',
    defaultValue: false
  },
  hasParking: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_parking',
    defaultValue: false
  },
  hasOutdoorArea: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_outdoor_area',
    defaultValue: false
  },
  acceptsCreditCards: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'accepts_credit_cards',
    defaultValue: true
  },
  // Eventos especiales
  hasLiveMusic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_live_music',
    defaultValue: false
  },
  hasEvents: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_events',
    defaultValue: false
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
  // Verificación
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_verified',
    defaultValue: false,
    comment: 'Si el establecimiento ha sido verificado por el sistema'
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
  tableName: 'entertainment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['owner_id']
    },
    {
      fields: ['type']
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

export default Entertainment;
