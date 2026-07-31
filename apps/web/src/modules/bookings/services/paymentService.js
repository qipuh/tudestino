import api from '../../../services/api';

/**
 * Cobra una reserva ya creada usando un token de Culqi. El backend valida
 * dueño de la reserva y hace el cargo real contra Culqi con la llave secreta
 * - nunca se marca como pagada una reserva solo porque el cliente lo diga.
 */
export const chargeBookingWithCulqi = async (bookingId, token) => {
  // api ya desenvuelve response.data en el interceptor - esto ya es
  // el body {success, message, data} completo, no hace falta .data extra.
  return api.post('/payments/culqi/charge-booking', { bookingId, token });
};
