import Payment from './payment.model.js';
import Reservation from '../reservations/reservation.model.js';
import CommissionRule from './commission-rule.model.js';
import Decimal from 'decimal.js';

export const createPayment = async (data) => {
  const reservation = await Reservation.findByPk(data.reservationId);
  if (!reservation) throw new Error('Reservation not found');

  const commissionRule = await CommissionRule.findOne({
    where: { businessId: data.businessId, effectiveFrom: { [Symbol.for('lte')]: new Date() } },
    order: [['effectiveFrom', 'DESC']]
  });

  const platformFeePercent = commissionRule?.platformFeePercent || 15;
  const grossAmount = new Decimal(data.grossAmount);
  const platformFeeAmount = grossAmount.mul(platformFeePercent).div(100);
  const gatewayFeeAmount = new Decimal(data.gatewayFeeAmount || 0);
  const businessNetAmount = grossAmount.sub(platformFeeAmount).sub(gatewayFeeAmount);

  return Payment.create({
    ...data,
    platformFeePercent,
    platformFeeAmount: platformFeeAmount.toNumber(),
    businessNetAmount: businessNetAmount.toNumber()
  });
};

export const getPaymentByReservation = async (reservationId) => {
  return Payment.findOne({ where: { reservationId } });
};

export const getPaymentsByBusiness = async (businessId, filters = {}) => {
  const where = { businessId };
  if (filters.status) where.status = filters.status;

  return Payment.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: filters.limit || 50
  });
};

export const getPaymentById = async (id) => {
  return Payment.findByPk(id, {
    include: [{ association: 'refunds' }]
  });
};
