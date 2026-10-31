import Business from '../businesses/business.model.js';
import Booking from '../bookings/booking.model.js';
import { Property } from '../properties/hotel-property.model.js';
import Invoice from './invoice.model.js';
import InvoicePayment from './invoice-payment.model.js';
import CashRegister from './cash-register.model.js';

const assertOwnedBusiness = async (businessId, user) => {
  const business = await Business.findByPk(businessId);
  if (!business) {
    const err = new Error('Negocio no encontrado');
    err.status = 404;
    throw err;
  }
  if (user.role !== 'admin' && business.ownerId !== user.id) {
    const err = new Error('No tienes permiso sobre este negocio');
    err.status = 403;
    throw err;
  }
  return business;
};

const round2 = (n) => Math.round(n * 100) / 100;

// Arma la factura a partir de los cargos ya conocidos de la reserva
// (habitación, limpieza, servicio) más cualquier cargo extra que recepción
// quiera sumar (consumos, daños, etc). Una vez creada, el desglose queda
// congelado en `lineItems` - no se recalcula si cambian precios después.
export const createInvoice = async ({ bookingId, extraLineItems = [], taxRate = 0 }, user) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    throw err;
  }

  const property = await Property.findByPk(booking.propertyId);
  if (!property?.businessId) {
    const err = new Error('Esta propiedad no está ligada a un negocio, no se puede facturar');
    err.status = 400;
    throw err;
  }
  await assertOwnedBusiness(property.businessId, user);

  const lineItems = [
    { concept: 'Alojamiento', quantity: 1, unitPrice: Number(booking.basePrice), total: Number(booking.basePrice) },
  ];
  if (Number(booking.cleaningFee) > 0) {
    lineItems.push({ concept: 'Limpieza', quantity: 1, unitPrice: Number(booking.cleaningFee), total: Number(booking.cleaningFee) });
  }
  if (Number(booking.serviceFee) > 0) {
    lineItems.push({ concept: 'Servicio', quantity: 1, unitPrice: Number(booking.serviceFee), total: Number(booking.serviceFee) });
  }
  extraLineItems.forEach((item) => {
    const quantity = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    lineItems.push({ concept: item.concept, quantity, unitPrice, total: round2(quantity * unitPrice) });
  });

  const subtotal = round2(lineItems.reduce((sum, item) => sum + item.total, 0));
  const taxTotal = round2(subtotal * taxRate);
  const total = round2(subtotal + taxTotal);

  const invoice = await Invoice.create({
    bookingId,
    businessId: property.businessId,
    guestId: booking.guestId,
    lineItems,
    subtotal,
    taxTotal,
    total,
    issuedAt: new Date(),
  });

  return invoice;
};

export const getInvoice = async (id, user) => {
  const invoice = await Invoice.findByPk(id, {
    include: [{ model: InvoicePayment, as: 'payments' }],
  });
  if (!invoice) {
    const err = new Error('Factura no encontrada');
    err.status = 404;
    throw err;
  }
  await assertOwnedBusiness(invoice.businessId, user);
  return invoice;
};

export const listInvoices = async (businessId, filters, user) => {
  await assertOwnedBusiness(businessId, user);
  const where = { businessId };
  if (filters.status) where.status = filters.status;
  if (filters.bookingId) where.bookingId = filters.bookingId;

  return Invoice.findAll({ where, order: [['issuedAt', 'DESC']] });
};

// Devuelve todas las facturas y pagos de una reserva - es el "guest ledger"
// que recepción consulta para ver cuánto debe/pagó el huésped durante su
// estancia, sin necesitar una tabla aparte.
export const getGuestLedger = async (bookingId, user) => {
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    const err = new Error('Reserva no encontrada');
    err.status = 404;
    throw err;
  }
  const property = await Property.findByPk(booking.propertyId);
  await assertOwnedBusiness(property.businessId, user);

  const invoices = await Invoice.findAll({
    where: { bookingId },
    include: [{ model: InvoicePayment, as: 'payments' }],
    order: [['issuedAt', 'ASC']],
  });

  const totalCharged = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.amountPaid), 0);

  return { bookingId, invoices, totalCharged: round2(totalCharged), totalPaid: round2(totalPaid), balance: round2(totalCharged - totalPaid) };
};

const getOpenRegister = (businessId) => CashRegister.findOne({ where: { businessId, status: 'open' } });

export const addPayment = async ({ invoiceId, method, amount, reference }, user) => {
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) {
    const err = new Error('Factura no encontrada');
    err.status = 404;
    throw err;
  }
  await assertOwnedBusiness(invoice.businessId, user);

  if (invoice.status === 'void') {
    const err = new Error('No se puede pagar una factura anulada');
    err.status = 400;
    throw err;
  }
  if (amount <= 0) {
    const err = new Error('El monto debe ser mayor a 0');
    err.status = 400;
    throw err;
  }

  const remaining = round2(Number(invoice.total) - Number(invoice.amountPaid));
  if (amount > remaining) {
    const err = new Error(`El pago (${amount}) excede el saldo pendiente (${remaining})`);
    err.status = 400;
    throw err;
  }

  let cashRegisterId = null;
  if (method === 'cash') {
    const register = await getOpenRegister(invoice.businessId);
    if (!register) {
      const err = new Error('No hay una caja abierta para registrar el pago en efectivo');
      err.status = 400;
      throw err;
    }
    cashRegisterId = register.id;
  }

  const payment = await InvoicePayment.create({
    invoiceId,
    method,
    amount,
    reference: reference || null,
    cashRegisterId,
    registeredBy: user.id,
  });

  const amountPaid = round2(Number(invoice.amountPaid) + amount);
  await invoice.update({
    amountPaid,
    status: amountPaid >= Number(invoice.total) ? 'paid' : invoice.status,
  });

  return payment;
};

// Reembolso / nota de crédito: se modela como un InvoicePayment negativo en
// vez de una tabla aparte - misma tabla de movimientos, misma lógica de
// caja, y el guest ledger queda correcto sin joins extra.
export const issueRefund = async ({ invoiceId, method, amount, reason }, user) => {
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) {
    const err = new Error('Factura no encontrada');
    err.status = 404;
    throw err;
  }
  await assertOwnedBusiness(invoice.businessId, user);

  if (amount <= 0 || amount > Number(invoice.amountPaid)) {
    const err = new Error('El monto del reembolso debe ser mayor a 0 y no exceder lo pagado');
    err.status = 400;
    throw err;
  }
  if (!reason) {
    const err = new Error('El reembolso requiere un motivo');
    err.status = 400;
    throw err;
  }

  let cashRegisterId = null;
  if (method === 'cash') {
    const register = await getOpenRegister(invoice.businessId);
    if (!register) {
      const err = new Error('No hay una caja abierta para registrar el reembolso en efectivo');
      err.status = 400;
      throw err;
    }
    cashRegisterId = register.id;
  }

  const payment = await InvoicePayment.create({
    invoiceId,
    method,
    amount: -amount,
    isRefund: true,
    reason,
    cashRegisterId,
    registeredBy: user.id,
  });

  const amountPaid = round2(Number(invoice.amountPaid) - amount);
  await invoice.update({
    amountPaid,
    status: amountPaid <= 0 ? 'credited' : amountPaid < Number(invoice.total) ? 'issued' : invoice.status,
  });

  return payment;
};

export const openCashRegister = async ({ businessId, openingFloat }, user) => {
  await assertOwnedBusiness(businessId, user);

  const existing = await getOpenRegister(businessId);
  if (existing) {
    const err = new Error('Ya hay una caja abierta para este negocio');
    err.status = 400;
    throw err;
  }

  return CashRegister.create({
    businessId,
    openedBy: user.id,
    openedAt: new Date(),
    openingFloat: openingFloat || 0,
    status: 'open',
  });
};

export const closeCashRegister = async (registerId, { countedCash, notes }, user) => {
  const register = await CashRegister.findByPk(registerId);
  if (!register) {
    const err = new Error('Caja no encontrada');
    err.status = 404;
    throw err;
  }
  await assertOwnedBusiness(register.businessId, user);

  if (register.status === 'closed') {
    const err = new Error('Esta caja ya está cerrada');
    err.status = 400;
    throw err;
  }

  const cashMovements = await InvoicePayment.findAll({ where: { cashRegisterId: registerId } });
  const cashSum = cashMovements.reduce((sum, p) => sum + Number(p.amount), 0);
  const expectedCash = round2(Number(register.openingFloat) + cashSum);
  const difference = round2(Number(countedCash) - expectedCash);

  await register.update({
    closedBy: user.id,
    closedAt: new Date(),
    countedCash,
    expectedCash,
    difference,
    status: 'closed',
    notes: notes ?? register.notes,
  });

  return register;
};

export const getCurrentCashRegister = async (businessId, user) => {
  await assertOwnedBusiness(businessId, user);
  return getOpenRegister(businessId);
};
