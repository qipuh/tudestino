import { Op } from 'sequelize';
import { Property, Room } from '../properties/hotel-property.model.js';
import RoomUnit from '../properties/room-unit.model.js';
import Booking from '../bookings/booking.model.js';
import User from '../users/user.model-mysql.js';
import FrontDeskStay from './front-desk-stay.model.js';
import HousekeepingTask from '../housekeeping/housekeeping-task.model.js';

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

// Mapa visual de habitaciones: cada unidad física con su estado operativo,
// de limpieza, y el huésped actual si está ocupada.
export const getRoomMap = async (propertyId, user) => {
  await assertOwnedProperty(propertyId, user);

  const rooms = await Room.findAll({
    where: { propertyId },
    include: [{ model: RoomUnit, as: 'units' }],
    order: [['name', 'ASC']],
  });

  const bookingIds = rooms
    .flatMap((room) => room.units)
    .map((unit) => unit.currentBookingId)
    .filter(Boolean);

  const guestsByBookingId = {};
  const stayIdByBookingId = {};
  if (bookingIds.length > 0) {
    const bookings = await Booking.findAll({
      where: { id: { [Op.in]: bookingIds } },
      attributes: ['id', 'guestId', 'checkOut'],
    });
    const guestIds = bookings.map((b) => b.guestId);
    const guests = await User.findAll({
      where: { id: { [Op.in]: guestIds } },
      attributes: ['id', 'name'],
    });
    const guestById = Object.fromEntries(guests.map((g) => [g.id, g]));
    bookings.forEach((b) => {
      guestsByBookingId[b.id] = { guest: guestById[b.guestId] || null, checkOut: b.checkOut };
    });

    const activeStays = await FrontDeskStay.findAll({
      where: { bookingId: { [Op.in]: bookingIds }, status: 'in_house' },
      attributes: ['id', 'bookingId'],
    });
    activeStays.forEach((s) => {
      stayIdByBookingId[s.bookingId] = s.id;
    });
  }

  return rooms.map((room) => ({
    roomId: room.id,
    roomType: room.roomType,
    roomName: room.name,
    units: room.units.map((unit) => ({
      id: unit.id,
      unitNumber: unit.unitNumber,
      floor: unit.floor,
      operationalStatus: unit.operationalStatus,
      housekeepingStatus: unit.housekeepingStatus,
      notes: unit.notes,
      currentGuest: unit.currentBookingId ? guestsByBookingId[unit.currentBookingId]?.guest || null : null,
      expectedCheckOut: unit.currentBookingId ? guestsByBookingId[unit.currentBookingId]?.checkOut || null : null,
      stayId: unit.currentBookingId ? stayIdByBookingId[unit.currentBookingId] || null : null,
    })),
  }));
};

// Reservas confirmadas que llegan en la fecha dada y todavía no hicieron
// check-in.
export const getArrivals = async (propertyId, date, user) => {
  await assertOwnedProperty(propertyId, user);

  const bookings = await Booking.findAll({
    where: { propertyId, checkIn: date, status: 'confirmed' },
    include: [{ model: FrontDeskStay, as: 'stay', required: false }],
  });

  const notCheckedIn = bookings.filter((b) => !b.stay || b.stay.status !== 'in_house');

  return attachGuests(notCheckedIn);
};

// Estancias activas cuya fecha de salida esperada es la fecha dada.
export const getDepartures = async (propertyId, date, user) => {
  await assertOwnedProperty(propertyId, user);

  const bookings = await Booking.findAll({
    where: { propertyId, checkOut: date },
    include: [{ model: FrontDeskStay, as: 'stay', required: true, where: { status: 'in_house' } }],
  });

  return attachGuests(bookings);
};

const attachGuests = async (bookings) => {
  const guestIds = bookings.map((b) => b.guestId);
  const guests = await User.findAll({ where: { id: { [Op.in]: guestIds } }, attributes: ['id', 'name', 'phone'] });
  const guestById = Object.fromEntries(guests.map((g) => [g.id, g]));

  return bookings.map((b) => ({
    bookingId: b.id,
    roomId: b.roomId,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    guests: b.guests,
    guest: guestById[b.guestId] || null,
    stay: b.stay || null,
  }));
};

export const checkIn = async ({ bookingId, roomUnitId, keysIssued }, user) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    throw err;
  }

  await assertOwnedProperty(booking.propertyId, user);

  if (booking.status !== 'confirmed') {
    const err = new Error('Solo se puede hacer check-in de reservas confirmadas');
    err.status = 400;
    throw err;
  }

  const existingStay = await FrontDeskStay.findOne({ where: { bookingId, status: 'in_house' } });
  if (existingStay) {
    const err = new Error('Esta reserva ya tiene un check-in activo');
    err.status = 400;
    throw err;
  }

  const unit = await RoomUnit.findByPk(roomUnitId, { include: [{ model: Room, as: 'room' }] });
  if (!unit) {
    const err = new Error('Unidad de habitación no encontrada');
    err.status = 404;
    throw err;
  }

  if (unit.room.propertyId !== booking.propertyId) {
    const err = new Error('La unidad no pertenece a la propiedad de esta reserva');
    err.status = 400;
    throw err;
  }

  if (unit.operationalStatus !== 'available') {
    const err = new Error('La unidad no está disponible para check-in');
    err.status = 400;
    throw err;
  }

  const stay = await FrontDeskStay.create({
    bookingId,
    roomUnitId,
    checkedInAt: new Date(),
    keysIssued: keysIssued || 1,
    checkedInBy: user.id,
    status: 'in_house',
  });

  await unit.update({ operationalStatus: 'occupied', currentBookingId: bookingId });

  return stay;
};

export const checkOut = async ({ stayId }, user) => {
  const stay = await FrontDeskStay.findByPk(stayId, { include: [{ model: RoomUnit, as: 'roomUnit', include: [{ model: Room, as: 'room' }] }] });
  if (!stay) {
    const err = new Error('Estancia no encontrada');
    err.status = 404;
    throw err;
  }

  if (stay.status !== 'in_house') {
    const err = new Error('Esta estancia ya no está activa');
    err.status = 400;
    throw err;
  }

  await assertOwnedProperty(stay.roomUnit.room.propertyId, user);

  await stay.update({ checkedOutAt: new Date(), checkedOutBy: user.id, status: 'checked_out' });

  await stay.roomUnit.update({
    operationalStatus: 'available',
    housekeepingStatus: 'dirty',
    currentBookingId: null,
  });

  await HousekeepingTask.create({
    roomUnitId: stay.roomUnitId,
    taskType: 'checkout_clean',
    status: 'pending',
  });

  return stay;
};

export const changeRoom = async ({ stayId, newRoomUnitId }, user) => {
  const stay = await FrontDeskStay.findByPk(stayId, { include: [{ model: RoomUnit, as: 'roomUnit', include: [{ model: Room, as: 'room' }] }] });
  if (!stay || stay.status !== 'in_house') {
    const err = new Error('Estancia activa no encontrada');
    err.status = 404;
    throw err;
  }

  await assertOwnedProperty(stay.roomUnit.room.propertyId, user);

  const newUnit = await RoomUnit.findByPk(newRoomUnitId, { include: [{ model: Room, as: 'room' }] });
  if (!newUnit || newUnit.room.propertyId !== stay.roomUnit.room.propertyId) {
    const err = new Error('La nueva unidad no pertenece a la misma propiedad');
    err.status = 400;
    throw err;
  }

  if (newUnit.operationalStatus !== 'available') {
    const err = new Error('La nueva unidad no está disponible');
    err.status = 400;
    throw err;
  }

  const oldUnit = stay.roomUnit;
  const bookingId = stay.bookingId;

  await oldUnit.update({ operationalStatus: 'available', housekeepingStatus: 'dirty', currentBookingId: null });
  await newUnit.update({ operationalStatus: 'occupied', currentBookingId: bookingId });
  await stay.update({ roomUnitId: newUnit.id });

  await HousekeepingTask.create({
    roomUnitId: oldUnit.id,
    taskType: 'checkout_clean',
    status: 'pending',
  });

  return stay;
};

export const setUnitOperationalStatus = async (roomUnitId, operationalStatus, notes, user) => {
  const unit = await RoomUnit.findByPk(roomUnitId, { include: [{ model: Room, as: 'room' }] });
  if (!unit) {
    const err = new Error('Unidad no encontrada');
    err.status = 404;
    throw err;
  }

  await assertOwnedProperty(unit.room.propertyId, user);

  if (unit.operationalStatus === 'occupied' && operationalStatus !== 'occupied') {
    const err = new Error('No puedes cambiar el estado de una unidad ocupada, primero haz check-out');
    err.status = 400;
    throw err;
  }

  await unit.update({ operationalStatus, notes: notes ?? unit.notes });

  return unit;
};
