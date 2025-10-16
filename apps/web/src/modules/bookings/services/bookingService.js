import api from '../../../services/api';

/**
 * Servicio para gestión de reservas
 */

// Crear una nueva reserva
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// Obtener mis reservas
export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings');
  return response.data;
};

// Obtener una reserva específica por ID
export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// Actualizar estado de una reserva
export const updateBookingStatus = async (id, status, cancellationReason = null) => {
  const response = await api.patch(`/bookings/${id}/status`, {
    status,
    cancellationReason,
  });
  return response.data;
};

// Verificar disponibilidad de fechas
export const checkAvailability = async (propertyId, checkIn, checkOut) => {
  const response = await api.get('/bookings/check-availability', {
    params: {
      propertyId,
      checkIn,
      checkOut,
    },
  });
  return response.available; // Retornar directamente el valor booleano
};

// Calcular precio total de una reserva
export const calculateBookingPrice = (basePrice, nights, cleaningFee = 0) => {
  const subtotal = basePrice * nights;
  const serviceFee = subtotal * 0.14; // 14% de comisión
  const total = subtotal + cleaningFee + serviceFee;

  return {
    basePrice,
    nights,
    subtotal,
    cleaningFee,
    serviceFee,
    total,
  };
};
