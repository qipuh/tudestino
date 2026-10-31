import { Op } from 'sequelize';
import { Property, Room } from '../properties/hotel-property.model.js';
import Booking from '../bookings/booking.model.js';
import Invoice from '../billing/invoice.model.js';

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

const round2 = (n) => Math.round(n * 100) / 100;
const daysBetween = (from, to) => Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

// KPIs estándar de hotelería para el rango de fechas dado. RevPAR y ADR se
// calculan sobre ingresos de habitación (bookings), no de facturación
// completa, porque incluyen reservas sin facturar aún. GOPPAR es una
// aproximación simplificada (ingresos facturados / habitaciones-noche
// disponibles) porque el sistema todavía no registra costos operativos -
// un GOPPAR real necesita el módulo de gastos que no existe todavía.
export const getKPIs = async (propertyId, startDate, endDate, user) => {
  const property = await assertOwnedProperty(propertyId, user);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = daysBetween(start, end) + 1;
  if (days < 1) {
    const err = new Error('endDate debe ser posterior o igual a startDate');
    err.status = 400;
    throw err;
  }

  const rooms = await Room.findAll({ where: { propertyId }, attributes: ['id', 'quantity'] });
  const availableUnits = rooms.reduce((sum, r) => sum + r.quantity, 0);
  const availableRoomNights = availableUnits * days;

  const bookings = await Booking.findAll({
    where: {
      propertyId,
      status: { [Op.in]: ['confirmed', 'completed'] },
      checkIn: { [Op.lte]: endDate },
      checkOut: { [Op.gt]: startDate },
    },
  });

  let soldRoomNights = 0;
  let roomRevenue = 0;

  bookings.forEach((b) => {
    const bookingCheckIn = new Date(b.checkIn);
    const bookingCheckOut = new Date(b.checkOut);
    const totalNights = daysBetween(bookingCheckIn, bookingCheckOut);
    if (totalNights <= 0) return;

    const overlapStart = bookingCheckIn > start ? bookingCheckIn : start;
    const overlapEndExclusive = bookingCheckOut < new Date(end.getTime() + 86400000) ? bookingCheckOut : new Date(end.getTime() + 86400000);
    const overlapNights = daysBetween(overlapStart, overlapEndExclusive);
    if (overlapNights <= 0) return;

    soldRoomNights += overlapNights;
    roomRevenue += (Number(b.totalPrice) / totalNights) * overlapNights;
  });

  const totalBookingsInRange = await Booking.count({ where: { propertyId, checkIn: { [Op.between]: [startDate, endDate] } } });
  const cancelledInRange = await Booking.count({ where: { propertyId, checkIn: { [Op.between]: [startDate, endDate] }, status: 'cancelled' } });

  const invoices = property.businessId
    ? await Invoice.findAll({
      where: { businessId: property.businessId, issuedAt: { [Op.between]: [start, new Date(end.getTime() + 86399999)] } },
      attributes: ['total'],
    })
    : [];
  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  const occupancy = availableRoomNights > 0 ? soldRoomNights / availableRoomNights : 0;
  const adr = soldRoomNights > 0 ? roomRevenue / soldRoomNights : 0;
  const revpar = availableRoomNights > 0 ? roomRevenue / availableRoomNights : 0;
  const goppar = availableRoomNights > 0 ? totalInvoiced / availableRoomNights : 0;

  return {
    propertyId,
    range: { startDate, endDate, days },
    availableUnits,
    availableRoomNights,
    soldRoomNights,
    occupancy: round2(occupancy * 100),
    roomRevenue: round2(roomRevenue),
    adr: round2(adr),
    revpar: round2(revpar),
    goppar: round2(goppar),
    gopparIsSimplified: true,
    totalInvoiced: round2(totalInvoiced),
    bookingsCount: totalBookingsInRange,
    cancelledCount: cancelledInRange,
    cancellationRate: totalBookingsInRange > 0 ? round2((cancelledInRange / totalBookingsInRange) * 100) : 0,
  };
};
