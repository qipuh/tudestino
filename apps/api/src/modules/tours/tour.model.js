import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';
import Business from '../businesses/business.model.js';

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  // INFORMACIÓN BÁSICA
  businessId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  tourCode: {
    type: DataTypes.STRING(50),
    unique: true,
    comment: 'Código único del tour'
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nombre del Tour/Paquete'
  },
  category: {
    type: DataTypes.ENUM('adventure', 'cultural', 'beach', 'romantic', 'family', 'nature', 'gastronomic', 'religious', 'sports', 'other'),
    allowNull: false,
    defaultValue: 'adventure'
  },
  serviceType: {
    type: DataTypes.ENUM('private', 'group', 'shared'),
    allowNull: false,
    defaultValue: 'group',
    comment: 'Tipo de servicio'
  },
  mainDestination: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Destino principal'
  },
  secondaryDestinations: {
    type: DataTypes.JSON,
    comment: 'Array de destinos secundarios incluidos'
  },
  duration: {
    type: DataTypes.JSON,
    comment: '{ days: number, nights: number }'
  },
  season: {
    type: DataTypes.ENUM('high', 'medium', 'low', 'all_year'),
    defaultValue: 'all_year',
    comment: 'Temporada'
  },
  coverImage: {
    type: DataTypes.STRING(500),
    comment: 'Foto de portada'
  },
  gallery: {
    type: DataTypes.JSON,
    comment: 'Array de URLs de imágenes'
  },

  // DETALLES DEL ITINERARIO
  description: {
    type: DataTypes.TEXT,
    comment: 'Descripción general del tour'
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Descripción corta para vista previa'
  },
  fullDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción completa del tour'
  },
  itinerary: {
    type: DataTypes.JSON,
    comment: 'Array de objetos: [{ day: number, title: string, description: string, activities: [] }]'
  },
  pointsOfInterest: {
    type: DataTypes.JSON,
    comment: 'Array de puntos de interés incluidos'
  },
  includedActivities: {
    type: DataTypes.JSON,
    comment: 'Array de actividades incluidas'
  },
  includedAccommodations: {
    type: DataTypes.JSON,
    comment: 'Array de alojamientos: [{ name: string, category: string }]'
  },
  includedTransports: {
    type: DataTypes.JSON,
    comment: 'Array de transportes incluidos'
  },

  // CONDICIONES Y SERVICIOS
  includes: {
    type: DataTypes.JSON,
    comment: 'Array de servicios incluidos: { accommodation: bool, meals: bool, transport: bool, guides: bool, entrance: bool, insurance: bool, equipment: bool }'
  },
  notIncludes: {
    type: DataTypes.JSON,
    comment: 'Array de servicios NO incluidos'
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
    comment: 'Políticas de cancelación'
  },
  specialRequirements: {
    type: DataTypes.JSON,
    comment: 'Array de requisitos: { vaccines: [], visa: bool, physicalCondition: string, age: string }'
  },
  guideLanguages: {
    type: DataTypes.JSON,
    comment: 'Array de idiomas: ["es", "en", "pt"]'
  },
  maxGroupSize: {
    type: DataTypes.INTEGER,
    comment: 'Tamaño máximo del grupo'
  },

  // INFORMACIÓN COMERCIAL
  basePricePerPerson: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio base por persona en moneda local'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'PEN',
    comment: 'Código de moneda (PEN, USD, EUR)'
  },
  priceInUSD: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Precio en USD'
  },
  supplements: {
    type: DataTypes.JSON,
    comment: 'Objetos de suplementos: { single: number, highSeason: number, extraNight: number }'
  },
  discounts: {
    type: DataTypes.JSON,
    comment: 'Objetos de descuentos: { children: percentage, groups: percentage, seniors: percentage }'
  },
  provider: {
    type: DataTypes.STRING(200),
    comment: 'Nombre del proveedor/operador'
  },

  // LOGÍSTICA OPERATIVA
  meetingPoint: {
    type: DataTypes.JSON,
    comment: '{ address: string, coordinates: { lat, lng }, instructions: string }'
  },
  departureTime: {
    type: DataTypes.TIME,
    comment: 'Hora de salida'
  },
  returnTime: {
    type: DataTypes.TIME,
    comment: 'Hora estimada de regreso'
  },
  operationSeasons: {
    type: DataTypes.JSON,
    comment: 'Array de rangos de fechas: [{ start: date, end: date }]'
  },
  departureDays: {
    type: DataTypes.JSON,
    comment: 'Array de días: ["monday", "wednesday", "friday"]'
  },
  minimumPassengers: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Mínimo de pasajeros requerido'
  },

  // METADATOS ADICIONALES
  difficultyLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'low',
    comment: 'Nivel de dificultad'
  },
  targetAudience: {
    type: DataTypes.JSON,
    comment: 'Array de público objetivo: ["families", "youth", "luxury", "seniors"]'
  },
  ratingAverage: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'promotional', 'sold_out'),
    defaultValue: 'active'
  },
  internalNotes: {
    type: DataTypes.TEXT,
    comment: 'Observaciones internas (solo visible para el negocio)'
  },
  attachments: {
    type: DataTypes.JSON,
    comment: 'Array de enlaces a documentos: [{ name, url, type }]'
  },

  // SEO y búsqueda
  slug: {
    type: DataTypes.STRING(300),
    unique: true
  },
  tags: {
    type: DataTypes.JSON,
    comment: 'Array de tags para búsqueda'
  }
}, {
  tableName: 'tours',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['category'] },
    { fields: ['status'] },
    { fields: ['slug'] },
    { fields: ['mainDestination'] },
    { fields: ['basePricePerPerson'] }
  ]
});

// Relaciones
Tour.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'Business'
});

Business.hasMany(Tour, {
  foreignKey: 'businessId',
  as: 'tours'
});

export default Tour;
