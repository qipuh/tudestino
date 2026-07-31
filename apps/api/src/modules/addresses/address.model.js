import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  districtId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'districts',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  street: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  zipCode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  }
}, {
  tableName: 'addresses',
  timestamps: true,
  indexes: [
    { fields: ['districtId'] },
    { fields: ['latitude', 'longitude'] }
  ]
});

export default Address;
