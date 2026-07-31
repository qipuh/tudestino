import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM(
      'amenity', 'food_item', 'addon', 'activity', 'ticket_type', 'other'
    ),
    allowNull: false,
    comment: 'Tipo de servicio: amenidad hotel, ítem menú, add-on tour, etc.'
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
    allowNull: true,
    comment: 'Precio del servicio (nullable si es amenidad incluida)'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    defaultValue: 'active'
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales: categoria, duración, etc.'
  }
}, {
  tableName: 'services',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['type'] },
    { fields: ['status'] }
  ]
});

export default Service;
