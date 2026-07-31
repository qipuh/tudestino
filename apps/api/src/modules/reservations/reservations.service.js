import Reservation from './reservation.model.js';
import { Op } from 'sequelize';

export const createReservation = async (data) => {
  return Reservation.create(data);
};

export const getReservations = async (filters = {}) => {
  const where = {};
  if (filters.businessId) where.businessId = filters.businessId;
  if (filters.userId) where.userId = filters.userId;
  if (filters.status) where.status = filters.status;
  if (filters.dateRange) {
    where.reservationDate = {
      [Op.between]: [filters.dateRange.start, filters.dateRange.end]
    };
  }

  return Reservation.findAll({
    where,
    include: [{ association: 'service' }],
    limit: filters.limit || 50
  });
};

export const getReservationById = async (id) => {
  return Reservation.findByPk(id, {
    include: [{ association: 'service' }]
  });
};

export const updateReservationStatus = async (id, status) => {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) return null;
  return reservation.update({ status });
};

export const cancelReservation = async (id) => {
  return updateReservationStatus(id, 'cancelled');
};
