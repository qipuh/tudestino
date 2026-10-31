// Crea datos temporales para probar Fase 1 (front-desk/housekeeping) desde
// el navegador con Playwright: un host, un negocio hotel, propiedad, sala
// con unidades, y una reserva confirmada lista para check-in. Imprime un
// JSON con los IDs + un JWT válido para inyectar en localStorage y saltarse
// el login. Ejecutar con `node seed-pms-ui-test.js`, y limpiar después con
// `node seed-pms-ui-test.js cleanup <propertyId> <businessId> <userId>`.
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import './src/dotenv-config.js';
import sequelize from './src/config/database-mysql.js';
import { setupAssociations } from './src/config/associations.js';
import User from './src/modules/users/user.model-mysql.js';
import Business from './src/modules/businesses/business.model.js';
import { Property, Room } from './src/modules/properties/hotel-property.model.js';
import Booking from './src/modules/bookings/booking.model.js';
import Invoice from './src/modules/billing/invoice.model.js';
import InvoicePayment from './src/modules/billing/invoice-payment.model.js';
import CashRegister from './src/modules/billing/cash-register.model.js';

setupAssociations();

const [, , mode, ...args] = process.argv;

async function seed() {
  await sequelize.authenticate();

  const suffix = Date.now();
  const password = await bcrypt.hash('Test1234!', 10);

  // role 'host' no existe en el ENUM real de la columna `users.role` en DB
  // (el modelo lo declara pero la tabla nunca se migró) - en la práctica
  // todo dueño de propiedad real es 'business_owner'.
  const host = await User.create({
    name: '[UI-TEST] Host Fase1',
    email: `ui-test-host-${suffix}@tudestino.pe`,
    password,
    role: 'business_owner',
  });

  const guest = await User.create({
    name: '[UI-TEST] Guest Fase1',
    email: `ui-test-guest-${suffix}@tudestino.pe`,
    password,
    role: 'guest',
  });

  const business = await Business.create({
    ownerId: host.id,
    name: `[UI-TEST] Hotel Fase1 ${suffix}`,
    slug: `ui-test-hotel-fase1-${suffix}`,
    description: 'Negocio temporal para probar front-desk y housekeeping en el navegador',
    businessType: 'hotel',
    hotelSubtype: 'hotel',
    hotelCategory: '4',
    address: { street: 'Av. Test 123', city: 'Cajamarca', country: 'Perú' },
    status: 'active',
  });

  const property = await Property.create({
    hostId: host.id,
    businessId: business.id,
    accommodationType: 'hotel',
    hotelName: business.name,
    description: 'Propiedad temporal de prueba UI',
    addressStreet: 'Av. Test 123',
    addressCity: 'Cajamarca',
    addressCountry: 'Perú',
    status: 'published',
  });

  const room = await Room.create({
    propertyId: property.id,
    roomType: 'double',
    name: 'Doble Superior',
    quantity: 5,
    guestCapacity: 2,
    beds: [{ type: 'double', count: 1 }],
    pricePerNight: 180,
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const booking = await Booking.create({
    propertyId: property.id,
    roomId: room.id,
    guestId: guest.id,
    hostId: host.id,
    checkIn: fmt(today),
    checkOut: fmt(tomorrow),
    guests: 2,
    basePrice: 180,
    totalPrice: 198,
    status: 'confirmed',
    paymentStatus: 'paid',
  });

  const token = jwt.sign(
    { id: host.id, email: host.email, role: host.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const out = {
    hostId: host.id,
    guestId: guest.id,
    businessId: business.id,
    propertyId: property.id,
    roomId: room.id,
    bookingId: booking.id,
    token,
  };
  fs.writeFileSync('./ui-test-data.json', JSON.stringify(out, null, 2));
  console.log('Wrote ./ui-test-data.json');
  console.log(JSON.stringify(out, null, 2));

  await sequelize.close();
}

async function cleanup() {
  const [propertyId, businessId, hostId, guestId] = args;
  await sequelize.authenticate();

  const bookings = await Booking.findAll({ where: { propertyId }, attributes: ['id'] });
  const bookingIds = bookings.map((b) => b.id);
  if (bookingIds.length) {
    const invoices = await Invoice.findAll({ where: { bookingId: bookingIds }, attributes: ['id'] });
    const invoiceIds = invoices.map((i) => i.id);
    if (invoiceIds.length) await InvoicePayment.destroy({ where: { invoiceId: invoiceIds } });
    await Invoice.destroy({ where: { bookingId: bookingIds } });
  }
  if (businessId) await CashRegister.destroy({ where: { businessId } });

  await Booking.destroy({ where: { propertyId } });
  await Room.destroy({ where: { propertyId } });
  await Property.destroy({ where: { id: propertyId } });
  if (businessId) await Business.destroy({ where: { id: businessId } });
  if (hostId) await User.destroy({ where: { id: hostId } });
  if (guestId) await User.destroy({ where: { id: guestId } });

  console.log('Cleanup done');
  await sequelize.close();
}

if (mode === 'cleanup') {
  await cleanup();
} else {
  await seed();
}
