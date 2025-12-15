import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const BusinessService = sequelize.define('BusinessService', {
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
  serviceType: {
    type: DataTypes.ENUM(
      'property',
      'restaurant',
      'entertainment',
      'events',
      'hotel',
      'bar',
      'club',
      'spa',
      'tour',
      'transport',
      'other'
    ),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Campos dinámicos / configuración específica del servicio (por ejemplo habitaciones)
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON con configuración específica del servicio (precio, capacidad, amenities, etc)'
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'inactive', 'under_maintenance'),
    defaultValue: 'draft'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Para ordenar servicios en el perfil del negocio'
  }
}, {
  tableName: 'business_services',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['serviceType'] },
    { fields: ['status'] },
    { fields: ['businessId', 'orderIndex'] }
  ]
});

export default BusinessService;
