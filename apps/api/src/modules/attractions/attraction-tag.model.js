import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const AttractionTag = sequelize.define('AttractionTag', {
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
  placeId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    comment: 'ID del negocio/propiedad etiquetado'
  },
  placeType: {
    type: DataTypes.ENUM('business', 'property', 'restaurant'),
    allowNull: false,
    comment: 'Tipo de lugar etiquetado'
  }
}, {
  tableName: 'attraction_tags',
  timestamps: true,
  indexes: [
    {
      fields: ['attractionId']
    },
    {
      fields: ['placeId', 'placeType']
    }
  ]
});

export default AttractionTag;
