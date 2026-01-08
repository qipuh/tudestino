import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

/**
 * Modelo para almacenar configuraciones del sistema
 * Como tokens de APIs externas, configuraciones globales, etc.
 */
const Config = sequelize.define('Config', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    },
    comment: 'Clave única de configuración (ej: whatsapp_api_token)'
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Valor de la configuración'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Descripción de para qué sirve esta configuración'
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si el valor está encriptado o no'
  }
}, {
  tableName: 'configs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['key']
    }
  ]
});

export default Config;
