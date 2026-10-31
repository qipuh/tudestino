import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';
import RoomUnit from '../properties/room-unit.model.js';

const HousekeepingTask = sequelize.define('HousekeepingTask', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roomUnitId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'room_units',
      key: 'id',
    },
  },
  assignedTo: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    comment: 'Usuario (personal de limpieza) asignado a la tarea',
  },
  createdBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    comment: 'Null cuando la tarea se crea automáticamente al hacer check-out',
  },
  taskType: {
    type: DataTypes.ENUM('checkout_clean', 'stayover', 'deep_clean', 'inspection'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'done', 'flagged'),
    defaultValue: 'pending',
  },
  incidentNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas de incidencia cuando status = flagged',
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  finishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'housekeeping_tasks',
  timestamps: true,
  indexes: [
    { fields: ['roomUnitId'] },
    { fields: ['assignedTo'] },
    { fields: ['status'] },
  ],
});

RoomUnit.hasMany(HousekeepingTask, { foreignKey: 'roomUnitId', as: 'housekeepingTasks' });
HousekeepingTask.belongsTo(RoomUnit, { foreignKey: 'roomUnitId', as: 'roomUnit' });

export default HousekeepingTask;
