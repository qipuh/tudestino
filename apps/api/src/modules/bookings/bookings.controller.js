import * as bookingsService from './bookings.service.js';

// Crear una nueva reserva
export const createBooking = async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      guestId: req.user.id,
    };

    const booking = await bookingsService.createBooking(bookingData);

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Reserva creada exitosamente',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener todas las reservas del usuario
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('🔍 getMyBookings - Buscando reservas para userId:', userId, 'role:', userRole);

    let bookings;

    // Si el usuario es HOST, buscar reservas de sus propiedades
    if (userRole === 'host' || userRole === 'admin') {
      bookings = await bookingsService.getHostBookings(userId);
    } else {
      // Si es GUEST, buscar sus propias reservas
      bookings = await bookingsService.getGuestBookings(userId);
    }

    console.log('✅ Reservas encontradas:', bookings.length);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('❌ Error en getMyBookings:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener una reserva por ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingsService.getBookingById(req.params.id);

    // Verificar que el usuario tiene permiso para ver esta reserva
    if (
      req.user.role !== 'admin' &&
      booking.guestId !== req.user.id &&
      booking.hostId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reserva',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Actualizar estado de una reserva
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;

    const booking = await bookingsService.updateBookingStatus(
      req.params.id,
      req.user.id,
      status,
      req.user.role
    );

    if (cancellationReason && status === 'cancelled') {
      booking.cancellationReason = cancellationReason;
      await booking.save();
    }

    res.json({
      success: true,
      data: booking,
      message: `Reserva ${status === 'confirmed' ? 'confirmada' : 'actualizada'} exitosamente`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Verificar disponibilidad
export const checkAvailability = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, roomId } = req.query;

    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'propertyId, checkIn y checkOut son requeridos',
      });
    }

    const available = await bookingsService.checkAvailability(
      propertyId,
      checkIn,
      checkOut,
      roomId || null
    );

    res.json({
      success: true,
      available,
      message: available
        ? 'Las fechas están disponibles'
        : 'Las fechas no están disponibles',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Actualizar pago (webhook de Stripe/PayPal)
export const updatePayment = async (req, res) => {
  try {
    const { bookingId, status, paymentIntentId, paymentMethod } = req.body;

    const booking = await bookingsService.updatePaymentStatus(bookingId, {
      status,
      paymentIntentId,
      paymentMethod,
    });

    res.json({
      success: true,
      data: booking,
      message: 'Pago actualizado exitosamente',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
