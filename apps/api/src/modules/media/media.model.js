import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('cover', 'gallery', 'video'),
    defaultValue: 'gallery',
    comment: 'Tipo de media: portada, galería, o video'
  },
  mediableType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Tipo de entidad dueña: business, post, user, etc.'
  },
  mediableId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID de la entidad dueña (polimórfico, sin FK hardcodeado)'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Orden de visualización en galería'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales: dimensiones, duración video, etc.'
  }
}, {
  tableName: 'media',
  timestamps: true,
  indexes: [
    { fields: ['mediableType', 'mediableId'] },
    { fields: ['type'] }
  ]
});

export default Media;
