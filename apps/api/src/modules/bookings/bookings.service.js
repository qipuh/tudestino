import Booking from './booking.model.js';
import { Property, Room } from '../properties/hotel-property.model.js';
import User from '../users/user.model-mysql.js';
import { Op } from 'sequelize';
import {
  createBookingRequestNotification,
  createBookingConfirmedNotification,
} from '../notifications/notification.helper.js';

// Condición de solapamiento de fechas reutilizada en varios chequeos de
// disponibilidad - una reserva existente choca con [checkIn, checkOut] si
// empieza dentro del rango, termina dentro del rango, o lo contiene entero.
const buildDateOverlapWhere = (checkIn, checkOut) => ({
  [Op.or]: [
    { checkIn: { [Op.between]: [checkIn, checkOut] } },
    { checkOut: { [Op.between]: [checkIn, checkOut] } },
    {
      [Op.and]: [
        { checkIn: { [Op.lte]: checkIn } },
        { checkOut: { [Op.gte]: checkOut } },
      ],
    },
  ],
});

// Cuenta reservas activas que se solapan con las fechas dadas PARA UN TIPO
// DE HABITACIÓN ESPECÍFICO - la propiedad puede tener varios tipos con
// varias unidades cada uno, así que el chequeo nunca debe ser a nivel de
// toda la propiedad.
const countOverlappingBookings = async (roomId, checkIn, checkOut) => {
  return Booking.count({
    where: {
      roomId,
      status: { [Op.notIn]: ['cancelled', 'rejected'] },
      ...buildDateOverlapWhere(checkIn, checkOut),
    },
  });
};

// Crear una nueva reserva
export const createBooking = async (bookingData) => {
  const { propertyId, roomId, guestId, checkIn, checkOut } = bookingData;

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

  const room = roomId ? property.rooms.find((r) => r.id === roomId) : property.rooms[0];

  if (!room) {
    throw new Error('Habitación no encontrada');
  }

  // Verificar que queden unidades libres de ESTE tipo de habitación para
  // las fechas pedidas - no basta con que la propiedad tenga otras
  // reservas, hay que contar contra la cantidad de unidades de este tipo.
  const overlappingCount = await countOverlappingBookings(room.id, checkIn, checkOut);

  if (overlappingCount >= room.quantity) {
    throw new Error('No quedan habitaciones de este tipo disponibles para las fechas seleccionadas');
  }

  // Calcular el total de noches
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  if (nights < 1) {
    throw new Error('La fecha de salida debe ser posterior a la fecha de entrada');
  }

  const basePrice = Number(room.pricePerNight) * nights;
  const cleaningFee = 0; // TODO: Agregar lógica de cleaning fee
  const serviceFee = basePrice * 0.10; // 10% de comisión
  const totalPrice = basePrice + cleaningFee + serviceFee;

  // Crear la reserva
  const booking = await Booking.create({
    ...bookingData,
    roomId: room.id,
    hostId: property.hostId,
    basePrice: room.pricePerNight,
    cleaningFee,
    serviceFee,
    totalPrice,
    currency: 'PEN',
    status: 'pending',
    paymentStatus: 'pending',
  });

  createBookingRequestNotification(property.hostId, guestId, booking.id, property.hotelName || property.propertyName);

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

  if (status === 'confirmed') {
    const property = await Property.findByPk(booking.propertyId, {
      attributes: ['hotelName', 'propertyName'],
    });
    createBookingConfirmedNotification(
      booking.guestId,
      booking.id,
      property?.hotelName || property?.propertyName || 'tu alojamiento'
    );
  }

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

// Verificar disponibilidad de fechas - si se pasa roomId, chequea ese tipo
// de habitación puntual; si no, la propiedad está "disponible" mientras
// AL MENOS UN tipo de habitación tenga unidades libres para esas fechas.
export const checkAvailability = async (propertyId, checkIn, checkOut, roomId = null) => {
  if (roomId) {
    const room = await Room.findByPk(roomId);
    if (!room) return false;
    const overlappingCount = await countOverlappingBookings(roomId, checkIn, checkOut);
    return overlappingCount < room.quantity;
  }

  const rooms = await Room.findAll({ where: { propertyId } });
  if (rooms.length === 0) return false;

  const availabilityChecks = await Promise.all(
    rooms.map(async (room) => {
      const overlappingCount = await countOverlappingBookings(room.id, checkIn, checkOut);
      return overlappingCount < room.quantity;
    })
  );

  return availabilityChecks.some(Boolean);
};

// Obtener todas las reservas para el panel admin, con datos de propiedad,
// huésped y anfitrión ya resueltos - separado de getAllBookings (que usan
// getGuestBookings/getHostBookings) para no cargar esos joins extra en
// cada consulta de "mis reservas" del propio usuario.
export const getAllBookingsForAdmin = async ({ page = 1, limit = 20, status = null }) => {
  const where = {};
  if (status) {
    where.status = status;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Booking.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  const bookings = await Promise.all(
    rows.map(async (booking) => {
      const bookingData = booking.toJSON();

      const [property, guest, host] = await Promise.all([
        Property.findByPk(booking.propertyId, {
          attributes: ['id', 'hotelName', 'propertyName', 'addressCity', 'addressCountry'],
        }).catch(() => null),
        User.findByPk(booking.guestId, { attributes: ['id', 'name', 'email'] }).catch(() => null),
        User.findByPk(booking.hostId, { attributes: ['id', 'name', 'email'] }).catch(() => null),
      ]);

      bookingData.property = property;
      bookingData.guest = guest;
      bookingData.host = host;
      return bookingData;
    })
  );

  return {
    bookings,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  };
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
