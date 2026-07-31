import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const District = sequelize.define('District', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  provinceId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'provinces',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'District code (UBIGEO 6-digit for Peru, e.g., "080131" for Cajamarca city)',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'District/city name',
  },
  nativeName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'native_name',
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
  tableName: 'districts',
  timestamps: true,
  indexes: [
    { fields: ['provinceId'] },
    { fields: ['code'] },
    { fields: ['name'] },
  ],
});

export default District;
