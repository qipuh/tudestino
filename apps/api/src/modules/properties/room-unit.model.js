import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';
import { Room } from './hotel-property.model.js';

// Habitación física individual (ej. "204") dentro de un tipo de habitación
// (Room). Room modela el tipo vendible con una `quantity`; RoomUnit modela
// cada unidad concreta que front-desk y housekeeping necesitan operar
// (asignar, limpiar, bloquear) una por una.
const RoomUnit = sequelize.define('RoomUnit', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roomId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'rooms',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  unitNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Número o código de la habitación física, ej. "204"',
  },
  floor: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  housekeepingStatus: {
    type: DataTypes.ENUM('clean', 'dirty', 'inspected', 'out_of_service'),
    defaultValue: 'clean',
  },
  operationalStatus: {
    type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'blocked'),
    defaultValue: 'available',
  },
  currentBookingId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    comment: 'Booking activo asignado a esta unidad, si hay huésped alojado',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'room_units',
  timestamps: true,
  indexes: [
    { fields: ['roomId'] },
    { fields: ['operationalStatus'] },
    { fields: ['housekeepingStatus'] },
    { unique: true, fields: ['roomId', 'unitNumber'] },
  ],
});

Room.hasMany(RoomUnit, { foreignKey: 'roomId', as: 'units' });
RoomUnit.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

export default RoomUnit;
