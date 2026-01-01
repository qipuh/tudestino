import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Country = sequelize.define('Country', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.CHAR(2),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  native_name: {
    type: DataTypes.STRING(100),
    field: 'native_name',
  },
  phone_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'phone_code',
  },
  flag_emoji: {
    type: DataTypes.CHAR(10),
    field: 'flag_emoji',
  },
  currency_code: {
    type: DataTypes.CHAR(3),
    field: 'currency_code',
  },
  document_types: {
    type: DataTypes.JSON,
    field: 'document_types',
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'countries',
  timestamps: true,
  underscored: true,
});

export default Country;
