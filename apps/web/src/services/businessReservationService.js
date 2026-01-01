import api from './api';

/**
 * Obtener mis reservaciones de negocios (restaurantes, entretenimiento, etc.)
 */
export const getMyBusinessReservations = async () => {
  try {
    const response = await api.get('/businesses/reservations/my-reservations');
    return response;
  } catch (error) {
    console.error('Error fetching business reservations:', error);
    throw error;
  }
};

/**
 * Cancelar una reservación de negocio
 */
export const cancelBusinessReservation = async (reservationId) => {
  try {
    const response = await api.put(`/businesses/reservations/${reservationId}/cancel`);
    return response;
  } catch (error) {
    console.error('Error cancelling business reservation:', error);
    throw error;
  }
};

/**
 * Obtener reservaciones de un negocio específico (solo para dueños)
 */
export const getBusinessReservations = async (businessId) => {
  try {
    const response = await api.get(`/businesses/${businessId}/reservations`);
    return response;
  } catch (error) {
    console.error('Error fetching business reservations:', error);
    throw error;
  }
};

/**
 * Actualizar estado de una reservación (solo para dueños)
 */
export const updateBusinessReservationStatus = async (businessId, reservationId, status) => {
  try {
    const response = await api.put(`/businesses/${businessId}/reservations/${reservationId}/status`, { status });
    return response;
  } catch (error) {
    console.error('Error updating business reservation status:', error);
    throw error;
  }
};
