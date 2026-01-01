import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Organizador (USUARIO individual O vacío si es de negocio)
  organizerId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'organizerId',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Tipo de organizador
  organizedBy: {
    type: DataTypes.ENUM('user', 'business'),
    allowNull: false,
    defaultValue: 'user',
    field: 'organizedBy',
    comment: 'Indica si el evento es organizado por un usuario o un negocio'
  },
  // ID del servicio de negocio (si es organizado por negocio)
  businessServiceId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'businessServiceId',
    references: {
      model: 'business_services',
      key: 'id'
    }
  },
  // Información básica
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name'
  },
  slug: {
    type: DataTypes.STRING(500),
    allowNull: true,
    unique: true,
    field: 'slug'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  // Fechas y horarios
  eventDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'eventDate'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'startTime'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'endTime'
  },
  // Ubicación
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'location'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'city'
  },
  locationType: {
    type: DataTypes.ENUM('physical', 'virtual', 'hybrid'),
    allowNull: false,
    defaultValue: 'physical',
    field: 'locationType'
  },
  virtualPlatform: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'virtualPlatform'
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'address'
  },
  // Categoría
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'category'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'tags'
  },
  // Organizador (nombre público)
  organizer: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'organizer'
  },
  // Capacidad
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'capacity'
  },
  currentAttendees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'currentAttendees'
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'isFree'
  },
  // Imágenes
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'images'
  },
  // Estado
  status: {
    type: DataTypes.ENUM('draft', 'active', 'inactive', 'under_maintenance'),
    allowNull: true,
    defaultValue: 'active',
    field: 'status'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'isFeatured'
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
  tableName: 'events',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

export default Event;
