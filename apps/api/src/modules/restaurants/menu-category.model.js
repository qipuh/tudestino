import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const MenuCategory = sequelize.define('MenuCategory', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Ej: Entradas, Platos principales, Postres, Bebidas, etc.'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order',
    defaultValue: 0,
    comment: 'Orden de visualización en el menú'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_active',
    defaultValue: true
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
  tableName: 'menu_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['restaurant_id']
    },
    {
      fields: ['display_order']
    }
  ]
});

export default MenuCategory;
