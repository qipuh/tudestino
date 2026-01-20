import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const MenuItem = sequelize.define('MenuItem', {
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
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM(
      // Restaurant categories
      'appetizers',
      'main_courses',
      'desserts',
      'beverages',
      'alcoholic',
      'breakfast',
      'specials',
      // Entertainment categories
      'drinks',
      'cocktails',
      'beer',
      'wine',
      'spirits',
      'snacks',
      'packages'
    ),
    allowNull: false,
    defaultValue: 'main_courses',
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
  isSpecial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'menu_items',
  timestamps: true,
});

export default MenuItem;
