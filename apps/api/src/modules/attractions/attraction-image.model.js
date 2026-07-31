import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const AttractionImage = sequelize.define('AttractionImage', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  attractionId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    comment: 'ID del atractivo turístico'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL/path de la imagen'
  },
  caption: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Descripción de la imagen'
  },
  credit: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Crédito/autor de la imagen'
  },
  sourceUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la fuente original de la imagen'
  },
  type: {
    type: DataTypes.ENUM('gallery', 'cover'),
    defaultValue: 'gallery',
    comment: 'Tipo de imagen'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Orden de visualización'
  }
}, {
  tableName: 'attraction_images',
  timestamps: true,
  indexes: [
    {
      fields: ['attractionId']
    },
    {
      fields: ['type']
    }
  ]
});

export default AttractionImage;
