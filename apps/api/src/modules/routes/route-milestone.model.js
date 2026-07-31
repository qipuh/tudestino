import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const RouteMilestone = sequelize.define('RouteMilestone', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  routeId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  photoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  point: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Ubicación del hito { lat, lng }',
  },
  recordedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Momento del recorrido en que se capturó (distinto de createdAt si se sube después)',
  },
}, {
  tableName: 'route_milestones',
  timestamps: true,
  indexes: [
    { fields: ['routeId'] },
  ],
});

export default RouteMilestone;
