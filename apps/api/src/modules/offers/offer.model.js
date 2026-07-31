import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Offer = sequelize.define('Offer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK a business. Null = promo global de plataforma',
    references: {
      model: 'businesses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Código único de la promoción'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed_amount', 'free_service'),
    allowNull: false,
    comment: 'Tipo de descuento: %, monto fijo, o servicio gratis'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Valor del descuento (% o cantidad)'
  },
  maxUses: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Máximo de veces que se puede usar. Null = ilimitado'
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Cuántas veces se ha usado (requiere atomicidad en update)'
  },
  validFrom: {
    type: DataTypes.DATETIME,
    allowNull: false
  },
  validUntil: {
    type: DataTypes.DATETIME,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  applicableServices: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de serviceIds a los que aplica. Null = aplica a todos'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'offers',
  timestamps: true,
  indexes: [
    { fields: ['code'], unique: true },
    { fields: ['businessId'] },
    { fields: ['isActive'] },
    { fields: ['validFrom', 'validUntil'] }
  ]
});

export default Offer;
