import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';
import { Room } from '../properties/hotel-property.model.js';

// Regla de tarifa dinámica sobre un tipo de habitación. El precio base sigue
// viviendo en Room.pricePerNight; esta tabla solo describe AJUSTES sobre esa
// base para fechas/días/anticipación concretos. business_seasons (existente)
// queda como está - es solo una etiqueta de temporada sin lógica de precio,
// esta tabla es el motor real de tarifas por habitación.
const RateRule = sequelize.define('RateRule', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roomId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: { model: 'rooms', key: 'id' },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  ruleType: {
    type: DataTypes.ENUM('season', 'day_of_week', 'early_bird', 'last_minute'),
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'ruleType=season: inicio del rango de fechas',
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'ruleType=season: fin del rango de fechas',
  },
  daysOfWeek: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'ruleType=day_of_week: array de 0 (domingo) a 6 (sábado)',
  },
  minAdvanceDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ruleType=early_bird: aplica si checkIn - hoy >= minAdvanceDays',
  },
  maxAdvanceDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ruleType=last_minute: aplica si checkIn - hoy <= maxAdvanceDays',
  },
  adjustmentType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
  },
  adjustmentValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Negativo = descuento, positivo = recargo. percentage: -10 = -10%',
  },
  minStay: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  maxStay: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Si varias reglas aplican a la misma noche, gana la de mayor priority',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'rate_rules',
  timestamps: true,
  indexes: [
    { fields: ['roomId'] },
    { fields: ['ruleType'] },
    { fields: ['isActive'] },
  ],
});

Room.hasMany(RateRule, { foreignKey: 'roomId', as: 'rateRules' });
RateRule.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

export default RateRule;
