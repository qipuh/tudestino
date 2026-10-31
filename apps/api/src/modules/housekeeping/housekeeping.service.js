import { Property, Room } from '../properties/hotel-property.model.js';
import RoomUnit from '../properties/room-unit.model.js';
import HousekeepingTask from './housekeeping-task.model.js';

const assertOwnedProperty = async (propertyId, user) => {
  const property = await Property.findByPk(propertyId);

  if (!property) {
    const err = new Error('Propiedad no encontrada');
    err.status = 404;
    throw err;
  }

  if (user.role !== 'admin' && property.hostId !== user.id) {
    const err = new Error('No tienes permiso sobre esta propiedad');
    err.status = 403;
    throw err;
  }

  return property;
};

const loadOwnedUnit = async (roomUnitId, user) => {
  const unit = await RoomUnit.findByPk(roomUnitId, { include: [{ model: Room, as: 'room' }] });
  if (!unit) {
    const err = new Error('Unidad no encontrada');
    err.status = 404;
    throw err;
  }
  await assertOwnedProperty(unit.room.propertyId, user);
  return unit;
};

export const getTasks = async (propertyId, filters, user) => {
  await assertOwnedProperty(propertyId, user);

  const rooms = await Room.findAll({ where: { propertyId }, attributes: ['id'] });
  const roomIds = rooms.map((r) => r.id);

  const units = await RoomUnit.findAll({ where: { roomId: roomIds }, attributes: ['id', 'unitNumber', 'roomId'] });
  const unitIds = units.map((u) => u.id);
  const unitById = Object.fromEntries(units.map((u) => [u.id, u]));

  const where = { roomUnitId: unitIds };
  if (filters.status) where.status = filters.status;
  if (filters.assignedTo) where.assignedTo = filters.assignedTo;

  const tasks = await HousekeepingTask.findAll({
    where,
    order: [['createdAt', 'ASC']],
  });

  return tasks.map((t) => ({ ...t.toJSON(), unitNumber: unitById[t.roomUnitId]?.unitNumber || null }));
};

export const createTask = async ({ roomUnitId, taskType, assignedTo }, user) => {
  await loadOwnedUnit(roomUnitId, user);

  const task = await HousekeepingTask.create({
    roomUnitId,
    taskType,
    assignedTo: assignedTo || null,
    createdBy: user.id,
    status: 'pending',
  });

  return task;
};

export const assignTask = async (taskId, assignedTo, user) => {
  const task = await HousekeepingTask.findByPk(taskId, { include: [{ model: RoomUnit, as: 'roomUnit', include: [{ model: Room, as: 'room' }] }] });
  if (!task) {
    const err = new Error('Tarea no encontrada');
    err.status = 404;
    throw err;
  }
  await assertOwnedProperty(task.roomUnit.room.propertyId, user);

  await task.update({ assignedTo });
  return task;
};

export const updateTaskStatus = async (taskId, status, incidentNotes, user) => {
  const task = await HousekeepingTask.findByPk(taskId, { include: [{ model: RoomUnit, as: 'roomUnit', include: [{ model: Room, as: 'room' }] }] });
  if (!task) {
    const err = new Error('Tarea no encontrada');
    err.status = 404;
    throw err;
  }
  await assertOwnedProperty(task.roomUnit.room.propertyId, user);

  const updates = { status };
  if (status === 'in_progress' && !task.startedAt) updates.startedAt = new Date();
  if (status === 'done' || status === 'flagged') updates.finishedAt = new Date();
  if (status === 'flagged') updates.incidentNotes = incidentNotes || task.incidentNotes;

  await task.update(updates);

  // Una tarea terminada limpia la unidad; una marcada con incidencia deja
  // la unidad fuera de servicio hasta que alguien la revise.
  if (status === 'done') {
    await task.roomUnit.update({ housekeepingStatus: 'clean' });
  } else if (status === 'flagged') {
    await task.roomUnit.update({ housekeepingStatus: 'out_of_service' });
  }

  return task;
};
