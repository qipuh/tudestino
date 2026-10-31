import { Property, Room } from '../properties/hotel-property.model.js';
import RateRule from './rate-rule.model.js';

const assertOwnedRoom = async (roomId, user) => {
  const room = await Room.findByPk(roomId, { include: [{ model: Property, as: 'property' }] });
  if (!room) {
    const err = new Error('Habitación no encontrada');
    err.status = 404;
    throw err;
  }
  if (user.role !== 'admin' && room.property.hostId !== user.id) {
    const err = new Error('No tienes permiso sobre esta habitación');
    err.status = 403;
    throw err;
  }
  return room;
};

const validateRuleShape = (data) => {
  const { ruleType, adjustmentType } = data;
  if (!['season', 'day_of_week', 'early_bird', 'last_minute'].includes(ruleType)) {
    const err = new Error('ruleType inválido');
    err.status = 400;
    throw err;
  }
  if (!['percentage', 'fixed'].includes(adjustmentType)) {
    const err = new Error('adjustmentType inválido');
    err.status = 400;
    throw err;
  }
  if (ruleType === 'season' && (!data.startDate || !data.endDate)) {
    const err = new Error('Las reglas de temporada requieren startDate y endDate');
    err.status = 400;
    throw err;
  }
  if (ruleType === 'day_of_week' && (!Array.isArray(data.daysOfWeek) || data.daysOfWeek.length === 0)) {
    const err = new Error('Las reglas por día de semana requieren daysOfWeek (array 0-6)');
    err.status = 400;
    throw err;
  }
};

export const createRateRule = async (roomId, data, user) => {
  await assertOwnedRoom(roomId, user);
  validateRuleShape(data);

  return RateRule.create({
    roomId,
    name: data.name,
    ruleType: data.ruleType,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    daysOfWeek: data.daysOfWeek || null,
    minAdvanceDays: data.minAdvanceDays ?? null,
    maxAdvanceDays: data.maxAdvanceDays ?? null,
    adjustmentType: data.adjustmentType,
    adjustmentValue: data.adjustmentValue,
    minStay: data.minStay ?? null,
    maxStay: data.maxStay ?? null,
    priority: data.priority ?? 0,
  });
};

export const listRateRules = async (roomId, user) => {
  await assertOwnedRoom(roomId, user);
  return RateRule.findAll({ where: { roomId }, order: [['priority', 'DESC']] });
};

export const updateRateRule = async (id, data, user) => {
  const rule = await RateRule.findByPk(id);
  if (!rule) {
    const err = new Error('Regla no encontrada');
    err.status = 404;
    throw err;
  }
  await assertOwnedRoom(rule.roomId, user);

  const merged = { ...rule.toJSON(), ...data };
  validateRuleShape(merged);

  await rule.update(data);
  return rule;
};

export const deleteRateRule = async (id, user) => {
  const rule = await RateRule.findByPk(id);
  if (!rule) {
    const err = new Error('Regla no encontrada');
    err.status = 404;
    throw err;
  }
  await assertOwnedRoom(rule.roomId, user);
  await rule.destroy();
};

const applyAdjustment = (basePrice, rule) => {
  const adjusted = rule.adjustmentType === 'percentage'
    ? basePrice * (1 + Number(rule.adjustmentValue) / 100)
    : basePrice + Number(rule.adjustmentValue);
  return Math.max(0, Math.round(adjusted * 100) / 100);
};

const daysBetween = (from, to) => Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

// Calcula el precio noche por noche aplicando la regla de mayor prioridad
// que matchee cada fecha, y devuelve además las restricciones de estancia
// (minStay/maxStay) que apliquen a la noche de entrada, para que el
// buscador de disponibilidad pueda avisar antes de dejar reservar.
export const quotePrice = async ({ roomId, checkIn, checkOut }) => {
  const room = await Room.findByPk(roomId);
  if (!room) {
    const err = new Error('Habitación no encontrada');
    err.status = 404;
    throw err;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  if (nights < 1) {
    const err = new Error('La fecha de salida debe ser posterior a la de entrada');
    err.status = 400;
    throw err;
  }

  const rules = await RateRule.findAll({ where: { roomId, isActive: true } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const advanceDays = daysBetween(today, checkInDate);

  const basePrice = Number(room.pricePerNight);
  const nightly = [];

  for (let i = 0; i < nights; i++) {
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const dow = date.getDay();

    const matching = rules.filter((rule) => {
      if (rule.ruleType === 'season') {
        return rule.startDate <= dateStr && dateStr <= rule.endDate;
      }
      if (rule.ruleType === 'day_of_week') {
        return (rule.daysOfWeek || []).includes(dow);
      }
      if (rule.ruleType === 'early_bird') {
        return advanceDays >= (rule.minAdvanceDays ?? 0);
      }
      if (rule.ruleType === 'last_minute') {
        return advanceDays <= (rule.maxAdvanceDays ?? Infinity);
      }
      return false;
    });

    const winningRule = matching.sort((a, b) => b.priority - a.priority)[0] || null;
    const price = winningRule ? applyAdjustment(basePrice, winningRule) : basePrice;

    nightly.push({ date: dateStr, basePrice, price, appliedRule: winningRule?.name || null });
  }

  const rulesOnCheckIn = rules.filter((rule) => {
    if (rule.ruleType === 'season') return rule.startDate <= checkIn && checkIn <= rule.endDate;
    if (rule.ruleType === 'day_of_week') return (rule.daysOfWeek || []).includes(checkInDate.getDay());
    if (rule.ruleType === 'early_bird') return advanceDays >= (rule.minAdvanceDays ?? 0);
    if (rule.ruleType === 'last_minute') return advanceDays <= (rule.maxAdvanceDays ?? Infinity);
    return false;
  });

  const minStay = rulesOnCheckIn.reduce((max, r) => (r.minStay ? Math.max(max, r.minStay) : max), 0);
  const maxStay = rulesOnCheckIn.reduce((min, r) => (r.maxStay ? Math.min(min, r.maxStay) : min), Infinity);

  const violations = [];
  if (minStay && nights < minStay) violations.push(`Estancia mínima de ${minStay} noches`);
  if (maxStay !== Infinity && nights > maxStay) violations.push(`Estancia máxima de ${maxStay} noches`);

  const total = Math.round(nightly.reduce((sum, n) => sum + n.price, 0) * 100) / 100;

  return { roomId, nights, nightly, total, minStay: minStay || null, maxStay: maxStay === Infinity ? null : maxStay, violations };
};
