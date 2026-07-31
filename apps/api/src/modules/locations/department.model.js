import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  countryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Region/department code (e.g., "08" for Cajamarca in Peru)',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Department/state name',
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
  tableName: 'departments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['countryId'] },
    { fields: ['code'] },
    { fields: ['name'] },
  ],
});

export default Department;
