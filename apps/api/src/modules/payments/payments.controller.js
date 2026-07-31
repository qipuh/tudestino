import { createCulqiCharge } from './culqi.service.js';
import Booking from '../bookings/booking.model.js';
import { Property } from '../properties/hotel-property.model.js';
import { createBookingConfirmedNotification } from '../notifications/notification.helper.js';

/**
 * Cobra una reserva ya creada usando un token de Culqi.
 * El estado de pago SOLO se actualiza aquí, tras confirmar el cargo con
 * Culqi server-side - nunca se confía en un "paymentStatus" que mande
 * el cliente directamente (ver bookings.service.js updatePaymentStatus,
 * pensado para un webhook de proveedor, no para ser llamado desde la app).
 */
export const chargeBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { bookingId, token } = req.body;

    if (!bookingId || !token) {
      return res.status(400).json({
        success: false,
        message: 'bookingId y token son requeridos',
      });
    }

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    if (booking.guestId !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permiso sobre esta reserva' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Esta reserva ya fue pagada' });
    }

    const property = await Property.findByPk(booking.propertyId, {
      attributes: ['hotelName', 'propertyName'],
    });
    const propertyName = property?.hotelName || property?.propertyName || 'tu alojamiento';

    const amountInCents = Math.round(Number(booking.totalPrice) * 100);

    let charge;
    try {
      charge = await createCulqiCharge({
        token,
        amount: amountInCents,
        email: userEmail,
        description: `Reserva en ${propertyName}`,
        currency: booking.currency || 'PEN',
      });
    } catch (culqiError) {
      return res.status(402).json({ success: false, message: culqiError.message });
    }

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentIntentId = charge.id;
    booking.paymentMethod = 'culqi';
    await booking.save();

    createBookingConfirmedNotification(booking.guestId, booking.id, propertyName);

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: booking,
    });
  } catch (error) {
    console.error('Error en chargeBooking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar el pago',
    });
  }
};
