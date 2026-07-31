import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    comment: 'ID del usuario que grabó la ruta'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  activityType: {
    type: DataTypes.ENUM(
      'trekking', 'cycling', 'running', 'mountaineering',
      'walking', 'climbing', 'horseback', 'kayaking'
    ),
    allowNull: false,
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },

  // Recorrido
  trackPoints: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array de puntos GPS: [{ lat, lng, elevation, timestamp }]'
  },
  startPoint: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Punto de inicio { lat, lng } - calculado en servidor desde trackPoints[0]'
  },
  endPoint: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Punto final { lat, lng } - calculado en servidor desde el último trackPoint'
  },

  // Estadísticas
  distanceKm: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  durationSeconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  elevationGainM: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  avgSpeedKmh: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },

  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Engagement (denormalizado, mismo patrón que Post/Reel)
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'routes',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['activityType'] },
    { fields: ['createdAt'] },
  ]
});

export default Route;
