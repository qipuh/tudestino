// Prueba manual end-to-end de PMS Fase 3 (Rate Management + Revenue):
// reglas de temporada/día de semana/early-bird/last-minute sobre una
// habitación, cálculo de cotización noche por noche, restricciones de
// estancia, y KPIs (RevPAR, ADR, Ocupación, GOPPAR) sobre reservas reales.
import sequelize from './src/config/database-mysql.js';
import { setupAssociations } from './src/config/associations.js';
import { Property, Room } from './src/modules/properties/hotel-property.model.js';
import Business from './src/modules/businesses/business.model.js';
import Booking from './src/modules/bookings/booking.model.js';
import User from './src/modules/users/user.model-mysql.js';
import RateRule from './src/modules/rate-management/rate-rule.model.js';
import * as rateService from './src/modules/rate-management/rate-management.service.js';
import * as revenueService from './src/modules/revenue/revenue.service.js';

setupAssociations();

const results = [];
const check = (label, condition) => {
  results.push({ label, pass: !!condition });
  console.log(condition ? `✅ ${label}` : `❌ ${label}`);
};

const created = { businessId: null, propertyId: null, roomId: null, bookingIds: [], ruleIds: [] };

async function run() {
  await sequelize.authenticate();

  const users = await User.findAll({ limit: 2 });
  if (users.length < 2) throw new Error('Se necesitan al menos 2 usuarios en la DB');
  const owner = { id: users[0].id, role: 'business_owner' };
  const guest = users[1];

  const business = await Business.create({
    ownerId: owner.id,
    name: `[E2E TEST] Hotel Rate ${Date.now()}`,
    slug: `e2e-test-hotel-rate-${Date.now()}`,
    description: 'Negocio temporal para probar rate management',
    businessType: 'hotel',
    address: { street: 'Av. Test 1', city: 'Cajamarca', country: 'Perú' },
    status: 'active',
  });
  created.businessId = business.id;

  const property = await Property.create({
    hostId: owner.id,
    businessId: business.id,
    accommodationType: 'hotel',
    hotelName: business.name,
    description: 'Propiedad temporal E2E rate',
    addressStreet: 'Av. Test 1',
    addressCity: 'Cajamarca',
    addressCountry: 'Perú',
    status: 'published',
  });
  created.propertyId = property.id;

  const room = await Room.create({
    propertyId: property.id,
    roomType: 'double',
    name: 'Doble Test',
    quantity: 4,
    guestCapacity: 2,
    beds: [{ type: 'double', count: 1 }],
    pricePerNight: 100,
  });
  created.roomId = room.id;

  // 1. Cotización sin reglas = precio base
  const baseQuote = await rateService.quotePrice({ roomId: room.id, checkIn: '2026-12-01', checkOut: '2026-12-03' });
  check('sin reglas, precio = base (100 x 2 = 200)', baseQuote.total === 200);

  // 2. Regla de temporada alta (+50%) sobre diciembre
  const seasonRule = await rateService.createRateRule(room.id, {
    name: 'Temporada alta diciembre',
    ruleType: 'season',
    startDate: '2026-12-01',
    endDate: '2026-12-31',
    adjustmentType: 'percentage',
    adjustmentValue: 50,
    minStay: 2,
    priority: 1,
  }, owner);
  created.ruleIds.push(seasonRule.id);

  const seasonQuote = await rateService.quotePrice({ roomId: room.id, checkIn: '2026-12-01', checkOut: '2026-12-03' });
  check('temporada alta aplica +50% (100->150 x 2 = 300)', seasonQuote.total === 300);
  check('quote reporta el nombre de la regla aplicada', seasonQuote.nightly[0].appliedRule === 'Temporada alta diciembre');

  // 3. Restricción de estancia mínima (2 noches) - 1 noche debe violar
  const shortQuote = await rateService.quotePrice({ roomId: room.id, checkIn: '2026-12-01', checkOut: '2026-12-02' });
  check('estancia de 1 noche viola minStay=2', shortQuote.violations.length === 1);

  // 4. Regla de fin de semana (+20 fijo) - domingo 2026-12-06
  const weekendRule = await rateService.createRateRule(room.id, {
    name: 'Recargo fin de semana',
    ruleType: 'day_of_week',
    daysOfWeek: [0, 6],
    adjustmentType: 'fixed',
    adjustmentValue: 20,
    priority: 0,
  }, owner);
  created.ruleIds.push(weekendRule.id);

  const weekendQuote = await rateService.quotePrice({ roomId: room.id, checkIn: '2026-11-27', checkOut: '2026-11-30' });
  // 2026-11-27 jueves, 28 viernes, 29 sábado -> solo el sábado lleva +20
  check('recargo de fin de semana aplica solo sábado', weekendQuote.total === 100 + 100 + 120);

  // 5. Prioridad: si dos reglas matchean la misma noche, gana mayor priority
  const highPriorityRule = await rateService.createRateRule(room.id, {
    name: 'Override diciembre',
    ruleType: 'season',
    startDate: '2026-12-06',
    endDate: '2026-12-06',
    adjustmentType: 'fixed',
    adjustmentValue: -30,
    priority: 5,
  }, owner);
  created.ruleIds.push(highPriorityRule.id);

  const priorityQuote = await rateService.quotePrice({ roomId: room.id, checkIn: '2026-12-06', checkOut: '2026-12-07' });
  // 2026-12-06 domingo: aplican weekend(+20, prio0) y override(-30, prio5) y season alta(+50%, prio1) -> gana priority 5
  check('gana la regla de mayor priority cuando varias matchean', priorityQuote.total === 70);

  // 6. Listar y borrar reglas
  const listed = await rateService.listRateRules(room.id, owner);
  check('listRateRules devuelve las 3 reglas creadas', listed.length === 3);

  await rateService.deleteRateRule(highPriorityRule.id, owner);
  created.ruleIds = created.ruleIds.filter((id) => id !== highPriorityRule.id);
  const afterDelete = await rateService.listRateRules(room.id, owner);
  check('deleteRateRule quita la regla', afterDelete.length === 2);

  // 7. Revenue KPIs sobre bookings reales
  const booking1 = await Booking.create({
    propertyId: property.id, roomId: room.id, guestId: guest.id, hostId: owner.id,
    checkIn: '2027-01-01', checkOut: '2027-01-04', guests: 2,
    basePrice: 300, totalPrice: 300, status: 'confirmed', paymentStatus: 'paid',
  });
  created.bookingIds.push(booking1.id);

  const booking2 = await Booking.create({
    propertyId: property.id, roomId: room.id, guestId: guest.id, hostId: owner.id,
    checkIn: '2027-01-05', checkOut: '2027-01-06', guests: 2,
    basePrice: 150, totalPrice: 150, status: 'cancelled', paymentStatus: 'pending',
  });
  created.bookingIds.push(booking2.id);

  const kpis = await revenueService.getKPIs(property.id, '2027-01-01', '2027-01-07', owner);
  // 4 unidades x 7 días = 28 room-nights disponibles; 3 room-nights vendidas (booking1, confirmed)
  check('availableRoomNights = 4 unidades x 7 días = 28', kpis.availableRoomNights === 28);
  check('soldRoomNights = 3 (solo booking confirmada)', kpis.soldRoomNights === 3);
  check('roomRevenue = 300 (booking1 completa dentro del rango)', kpis.roomRevenue === 300);
  check('ADR = 300/3 = 100', kpis.adr === 100);
  check('RevPAR = 300/28', kpis.revpar === Math.round((300 / 28) * 100) / 100);
  check('ocupación = 3/28 * 100', kpis.occupancy === Math.round((3 / 28) * 100 * 100) / 100);
  check('cancelledCount = 1', kpis.cancelledCount === 1);
  check('bookingsCount = 2 (confirmada + cancelada)', kpis.bookingsCount === 2);
  check('cancellationRate = 50%', kpis.cancellationRate === 50);

  // 8. Caso de borde: booking cuyo check-in cae justo en el endDate del
  // reporte debe contar (regresión: antes se excluía por un Op.lt en vez
  // de Op.lte en el filtro de solapamiento).
  const booking3 = await Booking.create({
    propertyId: property.id, roomId: room.id, guestId: guest.id, hostId: owner.id,
    checkIn: '2027-02-07', checkOut: '2027-02-08', guests: 2,
    basePrice: 90, totalPrice: 90, status: 'confirmed', paymentStatus: 'paid',
  });
  created.bookingIds.push(booking3.id);

  const edgeKpis = await revenueService.getKPIs(property.id, '2027-02-01', '2027-02-07', owner);
  check('booking con check-in == endDate del reporte cuenta en soldRoomNights', edgeKpis.soldRoomNights === 1);
  check('booking con check-in == endDate del reporte suma a roomRevenue', edgeKpis.roomRevenue === 90);
}

async function cleanup() {
  console.log('\nLimpiando datos de prueba...');
  if (created.ruleIds.length) await RateRule.destroy({ where: { id: created.ruleIds } });
  if (created.bookingIds.length) await Booking.destroy({ where: { id: created.bookingIds } });
  if (created.roomId) await Room.destroy({ where: { id: created.roomId } });
  if (created.propertyId) await Property.destroy({ where: { id: created.propertyId } });
  if (created.businessId) await Business.destroy({ where: { id: created.businessId } });
  console.log('Limpieza completa.');
}

try {
  await run();
} catch (error) {
  console.error('💥 Error durante la prueba:', error.message, error.stack);
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
