import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

// Modelo de Property
const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  hostId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  businessId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'businesses',
      key: 'id',
    },
    comment: 'ID del negocio al que pertenece esta propiedad',
  },

  // Tipo de alojamiento
  accommodationType: {
    type: DataTypes.ENUM(
      'apartment', 'hotel', 'motel', 'hostel', 'room',
      'house', 'villa', 'cabin', 'resort', 'bed_and_breakfast', 'guesthouse'
    ),
    allowNull: false,
  },

  // Para establecimientos multi-unidad
  multipleUnits: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hotelName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hotelCategory: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5,
    },
  },

  // Información general del alojamiento
  propertyName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre del alojamiento (para todos los tipos)',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción detallada del alojamiento',
  },

  // Política de cancelación
  cancellationPolicy: {
    type: DataTypes.ENUM('standard', 'flexible', 'moderate', 'strict', 'non_refundable', 'long_stay'),
    defaultValue: 'standard',
  },

  // Ubicación
  addressStreet: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  addressCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  addressState: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  addressCountry: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  addressZipCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  addressLatitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  addressLongitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },

  // Servicios del establecimiento (JSON array)
  propertyAmenities: {
    type: DataTypes.JSON,
    defaultValue: [],
  },

  // Desayuno
  breakfastIncluded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  // Parking
  parkingType: {
    type: DataTypes.ENUM('no', 'free', 'paid'),
    defaultValue: 'no',
  },
  parkingDetails: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  // Normas
  checkInTime: {
    type: DataTypes.TIME,
    defaultValue: '14:00:00',
  },
  checkOutTime: {
    type: DataTypes.TIME,
    defaultValue: '12:00:00',
  },
  childrenAllowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  petsAllowed: {
    type: DataTypes.ENUM('no', 'yes_free', 'yes_paid'),
    defaultValue: 'no',
  },
  petFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  petFeePer: {
    type: DataTypes.ENUM('day', 'stay'),
    allowNull: true,
  },
  additionalRules: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Estado
  status: {
    type: DataTypes.ENUM('draft', 'published', 'suspended'),
    defaultValue: 'published',
  },

  // Rating
  ratingAverage: {
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
    { fields: ['hostId'] },
    { fields: ['accommodationType'] },
    { fields: ['status'] },
    { fields: ['addressCity'] },
    { fields: ['addressCountry'] },
  ],
});

// Modelo de Room
const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  propertyId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  roomType: {
    type: DataTypes.ENUM(
      'single', 'double', 'triple', 'quadruple', 'suite', 'junior_suite',
      'family', 'shared_dormitory', 'studio', 'deluxe', 'executive', 'penthouse'
    ),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 100,
    },
    comment: 'Cantidad de habitaciones de este tipo',
  },
  guestCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  beds: {
    type: DataTypes.JSON,
    allowNull: false,
    // Estructura: [{ type: 'double', count: 1 }]
  },
  pricePerNight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  amenities: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'rooms',
  timestamps: true,
  indexes: [
    { fields: ['propertyId'] },
    { fields: ['roomType'] },
    { fields: ['pricePerNight'] },
  ],
});

// Relaciones
Property.hasMany(Room, {
  foreignKey: 'propertyId',
  as: 'rooms',
  onDelete: 'CASCADE',
});

Room.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property',
});

// Relación con Business
// NOTA: Descomentar después de ejecutar la migración add-business-id-to-properties.sql
// Property.belongsTo(sequelize.model('Business'), {
//   foreignKey: 'businessId',
//   as: 'business',
// });

export { Property, Room };
