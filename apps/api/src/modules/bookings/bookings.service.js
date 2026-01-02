import Booking from './booking.model.js';
import { Property, Room } from '../properties/hotel-property.model.js';
import User from '../users/user.model-mysql.js';
import { Op } from 'sequelize';

// Crear una nueva reserva
export const createBooking = async (bookingData) => {
  const { propertyId, guestId, checkIn, checkOut, guests } = bookingData;

  // Verificar que la propiedad existe y obtener sus habitaciones
  const property = await Property.findByPk(propertyId, {
    include: [
      {
        model: Room,
        as: 'rooms'
      }
    ]
  });

  if (!property) {
    throw new Error('Propiedad no encontrada');
  }

  if (!property.rooms || property.rooms.length === 0) {
    throw new Error('Esta propiedad no tiene habitaciones configuradas');
  }

  // Verificar que las fechas no se crucen con reservas existentes
  const conflictingBooking = await Booking.findOne({
    where: {
      propertyId,
      status: { [Op.notIn]: ['cancelled', 'rejected'] },
      [Op.or]: [
        {
          checkIn: { [Op.between]: [checkIn, checkOut] }
        },
        {
          checkOut: { [Op.between]: [checkIn, checkOut] }
        },
        {
          [Op.and]: [
            { checkIn: { [Op.lte]: checkIn } },
            { checkOut: { [Op.gte]: checkOut } }
          ]
        }
      ]
    }
  });

  if (conflictingBooking) {
    throw new Error('Las fechas seleccionadas no están disponibles');
  }

  // Calcular el total de noches
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  if (nights < 1) {
    throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
  }

  // Calcular precios basados en la primera habitación (simplificado por ahora)
  const firstRoom = property.rooms[0];
  const basePrice = Number(firstRoom.pricePerNight) * nights;
  const cleaningFee = 0; // TODO: Agregar lógica de cleaning fee
  const serviceFee = basePrice * 0.10; // 10% de comisión
  const totalPrice = basePrice + cleaningFee + serviceFee;

  // Crear la reserva
  const booking = await Booking.create({
    ...bookingData,
    hostId: property.hostId,
    basePrice: firstRoom.pricePerNight,
    cleaningFee,
    serviceFee,
    totalPrice,
    currency: 'USD',
    status: 'pending',
    paymentStatus: 'pending',
  });

  return booking;
};

// Obtener todas las reservas (con filtros)
export const getAllBookings = async (filters = {}) => {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.guestId) {
    where.guestId = filters.guestId;
  }

  if (filters.hostId) {
    where.hostId = filters.hostId;
  }

  if (filters.propertyId) {
    where.propertyId = filters.propertyId;
  }

  console.log('🔍 getAllBookings - Filtros aplicados:', where);

  const bookings = await Booking.findAll({
    where,
    // TODO: Descomentar includes cuando las asociaciones estén configuradas
    // include: [
    //   {
    //     model: Property,
    //     as: 'property',
    //     attributes: ['id', 'title', 'city', 'country', 'images'],
    //   },
    //   {
    //     model: User,
    //     as: 'guest',
    //     attributes: ['id', 'name', 'email', 'avatar'],
    //   },
    //   {
    //     model: User,
    //     as: 'host',
    //     attributes: ['id', 'name', 'email', 'avatar'],
    //   },
    // ],
    order: [['createdAt', 'DESC']],
  });

  console.log('📊 Bookings encontradas en DB:', bookings.length);

  // Agregar manualmente los datos de la propiedad si es necesario
  const bookingsWithProperty = await Promise.all(
    bookings.map(async (booking) => {
      const bookingData = booking.toJSON();
      try {
        const property = await Property.findByPk(booking.propertyId, {
          attributes: ['id', 'hotelName', 'accommodationType', 'addressCity', 'addressCountry'],
        });
        bookingData.Property = property;
        bookingData.property = property; // También en lowercase para compatibilidad
      } catch (error) {
        console.error('Error fetching property:', error);
        bookingData.Property = null;
        bookingData.property = null;
      }
      // Asegurar que los IDs estén disponibles directamente
      bookingData.guestId = booking.guestId;
      bookingData.hostId = booking.hostId;
      bookingData.propertyId = booking.propertyId;
      return bookingData;
    })
  );

  return bookingsWithProperty;
};

// Obtener una reserva por ID
export const getBookingById = async (id) => {
  const booking = await Booking.findByPk(id);

  if (!booking) {
    throw new Error('Reserva no encontrada');
  }

  // Agregar datos de la propiedad y usuarios manualmente
  const bookingData = booking.toJSON();
  try {
    const property = await Property.findByPk(booking.propertyId, {
      attributes: ['id', 'hotelName', 'accommodationType', 'addressStreet', 'addressCity', 'addressCountry', 'checkInTime', 'checkOutTime'],
    });
    bookingData.Property = property;

    // Obtener información del huésped (guest)
    const guest = await User.findByPk(booking.guestId, {
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'createdAt'],
    });
    bookingData.Guest = guest;

    // Obtener información del anfitrión (host)
    const host = await User.findByPk(booking.hostId, {
      attributes: ['id', 'name', 'email', 'phone', 'avatar'],
    });
    bookingData.Host = host;
  } catch (error) {
    console.error('Error fetching related data:', error);
  }

  return bookingData;
};

// Actualizar estado de una reserva
export const updateBookingStatus = async (id, userId, status, userRole) => {
  const booking = await Booking.findByPk(id);

  if (!booking) {
    throw new Error('Reserva no encontrada');
  }

  // Verificar permisos
  if (userRole !== 'admin') {
    if (status === 'confirmed' && booking.hostId !== userId) {
      throw new Error('Solo el anfitrión puede confirmar la reserva');
    }
    if (status === 'cancelled' && booking.guestId !== userId && booking.hostId !== userId) {
      throw new Error('No tienes permiso para cancelar esta reserva');
    }
  }

  booking.status = status;

  if (status === 'cancelled') {
    booking.cancelledBy = userId;
    booking.cancelledAt = new Date();
  }

  await booking.save();

  return booking;
};

// Actualizar estado de pago
export const updatePaymentStatus = async (id, paymentData) => {
  const booking = await Booking.findByPk(id);

  if (!booking) {
    throw new Error('Reserva no encontrada');
  }

  booking.paymentStatus = paymentData.status;
  booking.paymentIntentId = paymentData.paymentIntentId;
  booking.paymentMethod = paymentData.paymentMethod;

  if (paymentData.status === 'paid') {
    booking.status = 'confirmed';
  }

  await booking.save();

  return booking;
};

// Verificar disponibilidad de fechas
export const checkAvailability = async (propertyId, checkIn, checkOut) => {
  const conflictingBooking = await Booking.findOne({
    where: {
      propertyId,
      status: { [Op.notIn]: ['cancelled', 'rejected'] },
      [Op.or]: [
        {
          checkIn: { [Op.between]: [checkIn, checkOut] }
        },
        {
          checkOut: { [Op.between]: [checkIn, checkOut] }
        },
        {
          [Op.and]: [
            { checkIn: { [Op.lte]: checkIn } },
            { checkOut: { [Op.gte]: checkOut } }
          ]
        }
      ]
    }
  });

  return !conflictingBooking;
};

// Obtener reservas de un huésped
export const getGuestBookings = async (guestId) => {
  console.log('🔎 getGuestBookings - Buscando reservas para guestId:', guestId);
  const bookings = await getAllBookings({ guestId });
  console.log('📊 Reservas de guest encontradas:', bookings.length);
  return bookings;
};

// Obtener reservas de un anfitrión
export const getHostBookings = async (hostId) => {
  console.log('🔎 getHostBookings - Buscando reservas para hostId:', hostId);
  const bookings = await getAllBookings({ hostId });
  console.log('📊 Reservas de host encontradas:', bookings.length);
  return bookings;
};
