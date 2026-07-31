import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Province = sequelize.define('Province', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  departmentId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Province code (e.g., "0801" for Cajamarca province in Peru)',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Province name',
  },
  nativeName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Native language name',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
}, {
  tableName: 'provinces',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['departmentId'] },
    { fields: ['code'] },
    { fields: ['name'] },
  ],
});

export default Province;
