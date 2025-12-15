import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const MenuItem = sequelize.define('MenuItem', {
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
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id',
    references: {
      model: 'menu_categories',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'PEN'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la foto del plato'
  },
  // Información nutricional y dietética
  isVegetarian: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_vegetarian',
    defaultValue: false
  },
  isVegan: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_vegan',
    defaultValue: false
  },
  isGlutenFree: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_gluten_free',
    defaultValue: false
  },
  spicyLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'spicy_level',
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    },
    comment: '0 = No picante, 5 = Muy picante'
  },
  // Información adicional
  ingredients: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array de ingredientes principales'
  },
  allergens: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array de alérgenos: gluten, lácteos, mariscos, etc.'
  },
  preparationTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'preparation_time',
    comment: 'Tiempo de preparación en minutos'
  },
  // Disponibilidad
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_available',
    defaultValue: true
  },
  availabilitySchedule: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'availability_schedule',
    comment: 'Horarios específicos de disponibilidad'
  },
  // Popularidad
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    field: 'average_rating',
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_reviews',
    defaultValue: 0
  },
  orderCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_count',
    defaultValue: 0,
    comment: 'Número de veces que se ha pedido'
  },
  // Orden de visualización
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order',
    defaultValue: 0
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
  tableName: 'menu_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['restaurant_id']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['is_available']
    },
    {
      fields: ['average_rating']
    },
    {
      fields: ['order_count']
    }
  ]
});

export default MenuItem;
