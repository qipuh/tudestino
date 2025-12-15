import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const EntertainmentImage = sequelize.define('EntertainmentImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entertainmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'entertainment_id',
    references: {
      model: 'entertainment',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  caption: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('general', 'interior', 'exterior', 'vip_area', 'bar', 'dance_floor', 'event'),
    allowNull: false,
    defaultValue: 'general',
    comment: 'Tipo de imagen'
  },
  isMain: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_main',
    defaultValue: false,
    comment: 'Imagen principal del establecimiento'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order',
    defaultValue: 0
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
  tableName: 'entertainment_images',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['entertainment_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['display_order']
    }
  ]
});

export default EntertainmentImage;
