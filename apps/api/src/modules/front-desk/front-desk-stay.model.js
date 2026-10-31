import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';
import Booking from '../bookings/booking.model.js';
import RoomUnit from '../properties/room-unit.model.js';

// Registro de estancia física: une una Booking confirmada con la RoomUnit
// concreta donde el huésped se aloja, desde el check-in hasta el check-out.
const FrontDeskStay = sequelize.define('FrontDeskStay', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  bookingId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id',
    },
  },
  roomUnitId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'room_units',
      key: 'id',
    },
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  checkedOutAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  keysIssued: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  checkedInBy: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    comment: 'Usuario de recepción que hizo el check-in',
  },
  checkedOutBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('in_house', 'checked_out', 'no_show'),
    defaultValue: 'in_house',
  },
}, {
  tableName: 'front_desk_stays',
  timestamps: true,
  indexes: [
    { fields: ['bookingId'] },
    { fields: ['roomUnitId'] },
    { fields: ['status'] },
  ],
});

Booking.hasOne(FrontDeskStay, { foreignKey: 'bookingId', as: 'stay' });
FrontDeskStay.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

RoomUnit.hasMany(FrontDeskStay, { foreignKey: 'roomUnitId', as: 'stays' });
FrontDeskStay.belongsTo(RoomUnit, { foreignKey: 'roomUnitId', as: 'roomUnit' });

export default FrontDeskStay;
