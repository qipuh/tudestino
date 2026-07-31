import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const CommissionRule = sequelize.define('CommissionRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'FK nullable. Null = regla default global',
    references: {
      model: 'businesses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  businessType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tipo de negocio. Null = aplica a todos'
  },
  platformFeePercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Porcentaje de comisión tudestino'
  },
  effectiveFrom: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Cuándo entra en vigor esta regla'
  },
  effectiveUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Cuándo expira esta regla. Null = vigente indefinidamente'
  },
  createdByUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Admin que creó la regla',
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas sobre por qué se cambió la comisión'
  }
}, {
  tableName: 'commission_rules',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['businessType'] },
    { fields: ['effectiveFrom'] },
    { fields: ['businessId', 'effectiveFrom'] }
  ]
});

export default CommissionRule;
