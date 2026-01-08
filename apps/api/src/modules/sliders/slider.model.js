import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Slider = sequelize.define('Slider', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Título de referencia para admin'
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL de la imagen del slider'
  },
  linkUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de destino al hacer clic'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Orden de visualización (menor = primero)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si el slider está activo o no'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de inicio de visualización (opcional)'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de fin de visualización (opcional)'
  }
}, {
  tableName: 'sliders',
  timestamps: true,
  indexes: [
    {
      fields: ['displayOrder']
    },
    {
      fields: ['isActive']
    }
  ]
});

export default Slider;
