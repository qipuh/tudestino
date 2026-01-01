import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const EventTicket = sequelize.define('EventTicket', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  eventId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'event_id',
    references: {
      model: 'events',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  // Información del tipo de entrada
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Ej: General, VIP, Estudiante, Early Bird, etc.'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Precio
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'PEN'
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_free',
    defaultValue: false
  },
  // Disponibilidad
  totalQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'quantity_available', // Mapea a quantity_available en DB
    comment: 'Cantidad total disponible (null = ilimitado)'
  },
  soldQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sold_quantity',
    defaultValue: 0
  },
  reservedQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'reserved_quantity',
    defaultValue: 0,
    comment: 'Entradas en proceso de compra'
  },
  minQuantityPerOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'min_quantity_per_order',
    defaultValue: 1
  },
  maxQuantityPerOrder: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_quantity_per_order'
  },
  // Fechas de venta
  salesStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'sales_start_date'
  },
  salesEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'sales_end_date'
  },
  // Características
  includes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Lista de lo que incluye la entrada'
  },
  restrictions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Restricciones o requisitos'
  },
  // Transferibilidad
  isTransferable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_transferable',
    defaultValue: true
  },
  isRefundable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_refundable',
    defaultValue: false
  },
  // Visibilidad
  isVisible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_visible',
    defaultValue: true
  },
  usesPhases: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'uses_phases',
    defaultValue: false,
    comment: 'Si este ticket usa sistema de fases de precio'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order',
    defaultValue: 0
  },
  // Estado
  status: {
    type: DataTypes.ENUM('active', 'sold_out', 'paused', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
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
  tableName: 'event_tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['display_order']
    }
  ]
});

export default EventTicket;
