import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Attraction = sequelize.define('Attraction', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Título del atractivo turístico'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción general del atractivo'
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Imagen principal/portada'
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL del video (opcional)'
  },
  category: {
    type: DataTypes.ENUM('naturaleza', 'cultura', 'aventura', 'gastronomia', 'urbano'),
    defaultValue: 'naturaleza',
    comment: 'Categoría del atractivo'
  },

  // Ubicación
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'Latitud del atractivo'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'Longitud del atractivo'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Dirección completa'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Ciudad'
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Región/Estado'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'País'
  },

  // Distancias (opcional)
  hasDistanceMarkers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si tiene marcadores de distancia'
  },
  startPoint: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Punto de inicio { lat, lng, label }'
  },
  endPoint: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Punto final { lat, lng, label }'
  },
  distance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Distancia en kilómetros'
  },

  // Secciones opcionales
  whatToDo: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Qué hacer en el atractivo'
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Recomendaciones para visitantes'
  },

  // Metadata
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si está publicado o es borrador'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de publicación'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Número de visualizaciones'
  },
  createdBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    comment: 'ID del usuario admin que lo creó'
  }
}, {
  tableName: 'attractions',
  timestamps: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['city']
    },
    {
      fields: ['isPublished']
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
});

export default Attraction;
