import { createCulqiCharge } from './culqi.service.js';
import { getSetting } from '../settings/settings.service.js';
import BusinessReservation from '../businesses/business-reservation.model.js';
import Business from '../businesses/business.model.js';

const DEFAULT_PLATFORM_FEE_PERCENT = 15;

/**
 * Cobra una reserva de negocio (restaurant/spa/entertainment/etc) ya creada,
 * usando un token de Culqi. Mismo patrón que chargeBooking (payments.controller.js)
 * pero para business_reservations, con split de comisión tudestino/gateway/negocio.
 * El estado de pago SOLO se actualiza aquí, tras confirmar el cargo con Culqi
 * server-side - nunca se confía en un paymentStatus que mande el cliente.
 */
export const chargeBusinessReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { reservationId, token } = req.body;

    if (!reservationId || !token) {
      return res.status(400).json({
        success: false,
        message: 'reservationId y token son requeridos',
      });
    }

    const reservation = await BusinessReservation.findByPk(reservationId);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    if (reservation.userId !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permiso sobre esta reserva' });
    }

    if (reservation.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Esta reserva ya fue pagada' });
    }

    if (!reservation.totalPrice) {
      return res.status(400).json({ success: false, message: 'La reserva no tiene un monto a cobrar' });
    }

    const business = await Business.findByPk(reservation.businessId, {
      attributes: ['id', 'name', 'platformFeePercent'],
    });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Negocio no encontrado' });
    }

    const platformFeePercent = business.platformFeePercent != null
      ? Number(business.platformFeePercent)
      : Number(await getSetting('platformFeePercent', DEFAULT_PLATFORM_FEE_PERCENT));

    const totalPrice = Number(reservation.totalPrice);
    const amountInCents = Math.round(totalPrice * 100);

    let charge;
    try {
      charge = await createCulqiCharge({
        token,
        amount: amountInCents,
        email: userEmail,
        description: `Reserva en ${business.name}`,
        currency: reservation.currency || 'PEN',
      });
    } catch (culqiError) {
      return res.status(402).json({ success: false, message: culqiError.message });
    }

    // Split: platformFee se calcula sobre el monto cobrado; gatewayFee llega
    // como 'estimado' hasta que el gateway reporte el fee real post-settlement
    // (ver R20 en el análisis de riesgos — no bloquea el cobro, se ajusta después).
    const platformFeeAmount = Math.round(totalPrice * (platformFeePercent / 100) * 100) / 100;
    const gatewayFeeAmount = charge?.fee_amount != null ? Number(charge.fee_amount) / 100 : null;
    const businessNetAmount = gatewayFeeAmount != null
      ? Math.round((totalPrice - platformFeeAmount - gatewayFeeAmount) * 100) / 100
      : null; // se completa cuando confirmGatewayFee reciba el fee real

    reservation.paymentStatus = 'paid';
    reservation.status = 'confirmed';
    reservation.paymentIntentId = charge.id;
    reservation.paymentMethod = 'culqi';
    reservation.platformFeePercent = platformFeePercent;
    reservation.platformFeeAmount = platformFeeAmount;
    reservation.gatewayFeeAmount = gatewayFeeAmount;
    reservation.businessNetAmount = businessNetAmount;
    await reservation.save();

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: reservation,
    });
  } catch (error) {
    console.error('Error en chargeBusinessReservation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar el pago',
    });
  }
};
