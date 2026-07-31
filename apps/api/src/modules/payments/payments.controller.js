import Payment from './payment.model.js';
import Reservation from '../reservations/reservation.model.js';

export const create = async (req, res) => {
  try {
    const { reservationId, gatewayProvider, gatewayTransactionId, grossAmount, ...rest } = req.body;

    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    const payment = await Payment.create({
      reservationId,
      businessId: reservation.businessId,
      gatewayProvider,
      gatewayTransactionId,
      grossAmount,
      ...rest
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getByReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const payment = await Payment.findOne({ where: { reservationId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { status } = req.query;
    const where = { businessId };
    if (status) where.status = status;

    const payments = await Payment.findAll({ where });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const webhookHandler = async (req, res) => {
  try {
    const { provider, payload } = req.body;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
