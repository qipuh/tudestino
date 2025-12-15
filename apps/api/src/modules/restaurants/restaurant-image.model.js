import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const RestaurantImage = sequelize.define('RestaurantImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'restaurant_id',
    references: {
      model: 'restaurants',
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
    type: DataTypes.ENUM('general', 'dish', 'interior', 'exterior', 'menu'),
    allowNull: false,
    defaultValue: 'general',
    comment: 'Tipo de imagen: general, plato, interior, exterior, menú'
  },
  isMain: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_main',
    defaultValue: false,
    comment: 'Imagen principal del restaurante'
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
  tableName: 'restaurant_images',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['restaurant_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['display_order']
    }
  ]
});

export default RestaurantImage;
