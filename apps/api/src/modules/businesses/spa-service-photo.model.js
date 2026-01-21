import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const SpaServicePhoto = sequelize.define('SpaServicePhoto', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  serviceId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'spa_services',
      key: 'id',
    },
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  caption: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'spa_service_photos',
  timestamps: true,
});

export default SpaServicePhoto;
