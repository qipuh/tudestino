import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

/**
 * Tabla genérica clave-valor para configuración editable desde el panel
 * admin (llaves de pasarelas de pago, etc.) sin necesitar redeploy.
 */
const Setting = sequelize.define('Setting', {
  key: {
    type: DataTypes.STRING(100),
    primaryKey: true,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'settings',
  timestamps: true,
});

export default Setting;
