// Prueba manual end-to-end de PMS Fase 1: crea datos temporales, corre el
// flujo completo (unidades -> booking -> check-in -> check-out -> tarea de
// limpieza -> tarea resuelta) contra la base de datos real, y limpia todo
// al final pase o falle. No es un test de Jest: se ejecuta con
// `node test-pms-phase1-e2e.js` porque encadena servicios reales con
// side-effects en DB, más rápido de correr una vez que armar mocks.
import sequelize from './src/config/database-mysql.js';
import { setupAssociations } from './src/config/associations.js';
import { Property, Room } from './src/modules/properties/hotel-property.model.js';
import RoomUnit from './src/modules/properties/room-unit.model.js';
import Booking from './src/modules/bookings/booking.model.js';
import User from './src/modules/users/user.model-mysql.js';
import FrontDeskStay from './src/modules/front-desk/front-desk-stay.model.js';
import HousekeepingTask from './src/modules/housekeeping/housekeeping-task.model.js';
import * as frontDeskService from './src/modules/front-desk/front-desk.service.js';
import * as housekeepingService from './src/modules/housekeeping/housekeeping.service.js';

setupAssociations();

const results = [];
const check = (label, condition) => {
  results.push({ label, pass: !!condition });
  console.log(condition ? `✅ ${label}` : `❌ ${label}`);
};

const created = { propertyId: null, roomId: null, unitIds: [], bookingId: null };

async function run() {
  await sequelize.authenticate();

  const users = await User.findAll({ where: {}, limit: 2 });
  if (users.length < 2) {
    throw new Error('Se necesitan al menos 2 usuarios en la DB para la prueba (host actor + guest)');
  }
  const hostActor = { id: users[0].id, role: 'host' };
  const guest = users[1];

  console.log(`Usando hostActor=${hostActor.id} guest=${guest.id}`);

  // 1. Property + Room de prueba
  const property = await Property.create({
    hostId: hostActor.id,
    accommodationType: 'hotel',
    hotelName: '[E2E TEST] Hotel Fase 1',
    description: 'Propiedad temporal de prueba E2E, se borra al finalizar',
    addressStreet: 'Av. Test 123',
    addressCity: 'Cajamarca',
    addressCountry: 'Perú',
    status: 'published',
  });
  created.propertyId = property.id;

  const room = await Room.create({
    propertyId: property.id,
    roomType: 'double',
    name: 'Doble Test',
    quantity: 3,
    guestCapacity: 2,
    beds: [{ type: 'double', count: 1 }],
    pricePerNight: 150,
  });
  created.roomId = room.id;

  // 2. Unidades físicas (simula el endpoint bulk: rango 301-303)
  const units = await RoomUnit.bulkCreate([
    { roomId: room.id, unitNumber: '301', floor: '3' },
    { roomId: room.id, unitNumber: '302', floor: '3' },
    { roomId: room.id, unitNumber: '303', floor: '3' },
  ]);
  created.unitIds = units.map((u) => u.id);
  check('bulk crea 3 room_units', units.length === 3);

  const targetUnit = units[0];

  // 3. Booking confirmada para esa habitación
  const booking = await Booking.create({
    propertyId: property.id,
    roomId: room.id,
    guestId: guest.id,
    hostId: hostActor.id,
    checkIn: '2026-09-01',
    checkOut: '2026-09-03',
    guests: 2,
    basePrice: 300,
    totalPrice: 330,
    status: 'confirmed',
    paymentStatus: 'paid',
  });
  created.bookingId = booking.id;

  // 4. Room map antes del check-in: unidad debe verse disponible
  const mapBefore = await frontDeskService.getRoomMap(property.id, hostActor);
  const unitInMapBefore = mapBefore.flatMap((r) => r.units).find((u) => u.id === targetUnit.id);
  check('room-map muestra unidad "available" antes de check-in', unitInMapBefore?.operationalStatus === 'available');

  // 5. Check-in
  const stay = await frontDeskService.checkIn({ bookingId: booking.id, roomUnitId: targetUnit.id, keysIssued: 2 }, hostActor);
  check('check-in crea FrontDeskStay in_house', stay.status === 'in_house');

  const unitAfterCheckIn = await RoomUnit.findByPk(targetUnit.id);
  check('unidad queda "occupied" tras check-in', unitAfterCheckIn.operationalStatus === 'occupied');
  check('unidad guarda currentBookingId', unitAfterCheckIn.currentBookingId === booking.id);

  // 6. Arrivals de la fecha ya no debe listar esta reserva (ya con check-in)
  const arrivals = await frontDeskService.getArrivals(property.id, '2026-09-01', hostActor);
  check('arrivals ya no incluye la reserva con check-in hecho', !arrivals.some((a) => a.bookingId === booking.id));

  // 7. Departures de la fecha de salida debe incluir la reserva in_house
  const departures = await frontDeskService.getDepartures(property.id, '2026-09-03', hostActor);
  check('departures incluye la estancia activa', departures.some((d) => d.bookingId === booking.id));

  // 8. Check-out
  const stayAfterCheckout = await frontDeskService.checkOut({ stayId: stay.id }, hostActor);
  check('check-out marca stay como checked_out', stayAfterCheckout.status === 'checked_out');

  const unitAfterCheckout = await RoomUnit.findByPk(targetUnit.id);
  check('unidad vuelve a "available" tras check-out', unitAfterCheckout.operationalStatus === 'available');
  check('unidad queda "dirty" tras check-out', unitAfterCheckout.housekeepingStatus === 'dirty');
  check('currentBookingId se limpia tras check-out', unitAfterCheckout.currentBookingId === null);

  // 9. Tarea de housekeeping auto-creada
  const tasks = await housekeepingService.getTasks(property.id, {}, hostActor);
  const autoTask = tasks.find((t) => t.roomUnitId === targetUnit.id && t.taskType === 'checkout_clean');
  check('check-out genera tarea checkout_clean pendiente', !!autoTask && autoTask.status === 'pending');

  // 10. Resolver la tarea
  const doneTask = await housekeepingService.updateTaskStatus(autoTask.id, 'done', null, hostActor);
  check('tarea se marca done', doneTask.status === 'done');

  const unitAfterClean = await RoomUnit.findByPk(targetUnit.id);
  check('unidad queda "clean" tras cerrar la tarea', unitAfterClean.housekeepingStatus === 'clean');

  // 11. No se puede eliminar unidad ocupada (chequeo del controller, aquí a nivel modelo)
  const secondBooking = await Booking.create({
    propertyId: property.id,
    roomId: room.id,
    guestId: guest.id,
    hostId: hostActor.id,
    checkIn: '2026-09-05',
    checkOut: '2026-09-06',
    guests: 1,
    basePrice: 150,
    totalPrice: 165,
    status: 'confirmed',
    paymentStatus: 'paid',
  });
  await frontDeskService.checkIn({ bookingId: secondBooking.id, roomUnitId: units[1].id }, hostActor);
  let blockedDeleteOk = false;
  try {
    await frontDeskService.setUnitOperationalStatus(units[1].id, 'maintenance', null, hostActor);
  } catch (e) {
    blockedDeleteOk = e.status === 400;
  }
  check('no se puede bloquear una unidad ocupada sin check-out antes', blockedDeleteOk);

  // cleanup de la segunda reserva
  const stay2 = await FrontDeskStay.findOne({ where: { bookingId: secondBooking.id } });
  await frontDeskService.checkOut({ stayId: stay2.id }, hostActor);
  created.bookingId2 = secondBooking.id;
}

async function cleanup() {
  console.log('\nLimpiando datos de prueba...');
  await HousekeepingTask.destroy({ where: { roomUnitId: created.unitIds } });
  await FrontDeskStay.destroy({ where: { roomUnitId: created.unitIds } });
  if (created.bookingId) await Booking.destroy({ where: { id: created.bookingId } });
  if (created.bookingId2) await Booking.destroy({ where: { id: created.bookingId2 } });
  if (created.unitIds.length) await RoomUnit.destroy({ where: { id: created.unitIds } });
  if (created.roomId) await Room.destroy({ where: { id: created.roomId } });
  if (created.propertyId) await Property.destroy({ where: { id: created.propertyId } });
  console.log('Limpieza completa.');
}

try {
  await run();
} catch (error) {
  console.error('💥 Error durante la prueba:', error.message);
  results.push({ label: 'ejecución sin excepciones', pass: false });
} finally {
  await cleanup();
  await sequelize.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} chequeos OK`);
if (failed.length > 0) {
  console.log('Fallaron:', failed.map((f) => f.label).join(', '));
  process.exit(1);
}
process.exit(0);
