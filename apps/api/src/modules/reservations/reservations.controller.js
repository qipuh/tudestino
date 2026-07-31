import Reservation from './reservation.model.js';
import Service from '../services/service.model.js';

export const create = async (req, res) => {
  try {
    const { businessId, userId, reservationDate, numberOfPeople, serviceId, totalPrice } = req.body;
    const reservation = await Reservation.create({
      businessId,
      userId,
      reservationDate,
      numberOfPeople,
      serviceId,
      totalPrice
    });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const { businessId, userId, status } = req.query;
    const where = {};
    if (businessId) where.businessId = businessId;
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const reservations = await Reservation.findAll({
      where,
      include: [
        { model: Service, as: 'service' }
      ]
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [{ model: Service, as: 'service' }]
    });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    await reservation.update({ status });
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cancel = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    await reservation.update({ status: 'cancelled' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
