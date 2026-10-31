// Prueba manual end-to-end de PMS Fase 2 (Facturación y Caja): crea datos
// temporales, corre el flujo completo (abrir caja -> factura -> pago mixto
// efectivo/tarjeta -> reembolso parcial -> guest ledger -> cierre de caja
// con diferencia) contra la base de datos real, y limpia todo al final.
import sequelize from './src/config/database-mysql.js';
import { setupAssociations } from './src/config/associations.js';
import { Property, Room } from './src/modules/properties/hotel-property.model.js';
import Business from './src/modules/businesses/business.model.js';
import Booking from './src/modules/bookings/booking.model.js';
import User from './src/modules/users/user.model-mysql.js';
import Invoice from './src/modules/billing/invoice.model.js';
import InvoicePayment from './src/modules/billing/invoice-payment.model.js';
import CashRegister from './src/modules/billing/cash-register.model.js';
import * as billingService from './src/modules/billing/billing.service.js';

setupAssociations();

const results = [];
const check = (label, condition) => {
  results.push({ label, pass: !!condition });
  console.log(condition ? `✅ ${label}` : `❌ ${label}`);
};

const created = { businessId: null, propertyId: null, roomId: null, bookingId: null, registerId: null };

async function run() {
  await sequelize.authenticate();

  const users = await User.findAll({ limit: 2 });
  if (users.length < 2) throw new Error('Se necesitan al menos 2 usuarios en la DB');
  const owner = { id: users[0].id, role: 'business_owner' };
  const guest = users[1];

  const business = await Business.create({
    ownerId: owner.id,
    name: `[E2E TEST] Hotel Billing ${Date.now()}`,
    slug: `e2e-test-hotel-billing-${Date.now()}`,
    description: 'Negocio temporal para probar facturación',
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
    description: 'Propiedad temporal E2E billing',
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
    quantity: 2,
    guestCapacity: 2,
    beds: [{ type: 'double', count: 1 }],
    pricePerNight: 200,
  });
  created.roomId = room.id;

  const booking = await Booking.create({
    propertyId: property.id,
    roomId: room.id,
    guestId: guest.id,
    hostId: owner.id,
    checkIn: '2026-09-10',
    checkOut: '2026-09-12',
    guests: 2,
    basePrice: 400,
    cleaningFee: 30,
    totalPrice: 430,
    status: 'confirmed',
    paymentStatus: 'paid',
  });
  created.bookingId = booking.id;

  // 1. Sin caja abierta, un pago en efectivo debe fallar
  const invoice = await billingService.createInvoice(
    { bookingId: booking.id, extraLineItems: [{ concept: 'Minibar', quantity: 2, unitPrice: 15 }] },
    owner
  );
  check('factura arma lineItems (alojamiento + limpieza + extra)', invoice.lineItems.length === 3);
  check('subtotal correcto (400 + 30 + 30)', Number(invoice.subtotal) === 460);
  check('total = subtotal sin impuestos por defecto', Number(invoice.total) === 460);

  let cashWithoutRegisterFailed = false;
  try {
    await billingService.addPayment({ invoiceId: invoice.id, method: 'cash', amount: 100 }, owner);
  } catch (e) {
    cashWithoutRegisterFailed = e.status === 400;
  }
  check('pago en efectivo sin caja abierta se rechaza', cashWithoutRegisterFailed);

  // 2. Abrir caja
  const register = await billingService.openCashRegister({ businessId: business.id, openingFloat: 50 }, owner);
  created.registerId = register.id;
  check('caja abre con status open', register.status === 'open');

  let secondRegisterFailed = false;
  try {
    await billingService.openCashRegister({ businessId: business.id, openingFloat: 0 }, owner);
  } catch (e) {
    secondRegisterFailed = e.status === 400;
  }
  check('no se puede abrir una segunda caja mientras hay una abierta', secondRegisterFailed);

  // 3. Pago mixto: efectivo + tarjeta
  await billingService.addPayment({ invoiceId: invoice.id, method: 'cash', amount: 100 }, owner);
  await billingService.addPayment({ invoiceId: invoice.id, method: 'card', amount: 300, reference: 'AUTH123' }, owner);

  let overpayRejected = false;
  try {
    await billingService.addPayment({ invoiceId: invoice.id, method: 'cash', amount: 100 }, owner);
  } catch (e) {
    overpayRejected = e.status === 400;
  }
  check('pago que excede el saldo pendiente se rechaza', overpayRejected);

  await billingService.addPayment({ invoiceId: invoice.id, method: 'cash', amount: 60 }, owner);

  const invoiceAfterPayments = await billingService.getInvoice(invoice.id, owner);
  check('factura queda "paid" tras cubrir el total (460)', invoiceAfterPayments.status === 'paid');
  check('amountPaid = 460', Number(invoiceAfterPayments.amountPaid) === 460);
  check('factura tiene 3 pagos registrados', invoiceAfterPayments.payments.length === 3);

  // 4. Reembolso parcial en efectivo (ej. minibar no consumido)
  await billingService.issueRefund({ invoiceId: invoice.id, method: 'cash', amount: 30, reason: 'Minibar no consumido' }, owner);
  const invoiceAfterRefund = await billingService.getInvoice(invoice.id, owner);
  check('reembolso reduce amountPaid a 430', Number(invoiceAfterRefund.amountPaid) === 430);
  check('factura ya no queda "paid" tras reembolso parcial', invoiceAfterRefund.status === 'paid' ? false : true);

  let refundWithoutReasonFailed = false;
  try {
    await billingService.issueRefund({ invoiceId: invoice.id, method: 'cash', amount: 10, reason: '' }, owner);
  } catch (e) {
    refundWithoutReasonFailed = e.status === 400;
  }
  check('reembolso sin motivo se rechaza', refundWithoutReasonFailed);

  // 5. Guest ledger
  const ledger = await billingService.getGuestLedger(booking.id, owner);
  check('ledger reporta 1 factura', ledger.invoices.length === 1);
  check('ledger balance = total(460) - pagado(430) = 30', ledger.balance === 30);

  // 6. Cierre de caja: efectivo movido = 100 + 60 - 30(refund) = 130; esperado = 50 + 130 = 180
  const closed = await billingService.closeCashRegister(register.id, { countedCash: 175 }, owner);
  check('expectedCash calculado correctamente (180)', Number(closed.expectedCash) === 180);
  check('difference = countedCash - expectedCash (175-180=-5)', Number(closed.difference) === -5);
  check('caja queda "closed"', closed.status === 'closed');

  let closeAgainFailed = false;
  try {
    await billingService.closeCashRegister(register.id, { countedCash: 100 }, owner);
  } catch (e) {
    closeAgainFailed = e.status === 400;
  }
  check('no se puede cerrar una caja ya cerrada', closeAgainFailed);
}

async function cleanup() {
  console.log('\nLimpiando datos de prueba...');
  if (created.bookingId) {
    const invoices = await Invoice.findAll({ where: { bookingId: created.bookingId } });
    const invoiceIds = invoices.map((i) => i.id);
    if (invoiceIds.length) await InvoicePayment.destroy({ where: { invoiceId: invoiceIds } });
    await Invoice.destroy({ where: { bookingId: created.bookingId } });
    await Booking.destroy({ where: { id: created.bookingId } });
  }
  if (created.registerId) await CashRegister.destroy({ where: { id: created.registerId } });
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
