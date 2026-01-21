import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const SpaService = sequelize.define('SpaService', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  businessId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Ej: Masajes, Tratamientos Faciales, Gym, etc.',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duración en minutos',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'spa_services',
  timestamps: true,
});

export default SpaService;
