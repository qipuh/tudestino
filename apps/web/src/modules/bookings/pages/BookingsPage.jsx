import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, DollarSign, AlertCircle, CheckCircle, XCircle, MessageCircle, Hotel, Utensils } from 'lucide-react';
import useBookingStore from '../../../store/bookingStore';
import useAuthStore from '../../../store/authStore';
import * as businessReservationService from '../../../services/businessReservationService';
import api, { getImageUrl } from '../../../services/api';
import UserAccountLayout from '../../../layouts/UserAccountLayout';
import useVerification from '../../../hooks/useVerification';
import VerificationAlert from '../../../components/VerificationAlert';

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmada',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  completed: {
    label: 'Completada',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rechazada',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
  },
};

function BookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isVerified, status, loading: verificationLoading } = useVerification();
  const { bookings, loading, error, fetchMyBookings, updateBookingStatus } = useBookingStore();
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [cancellingId, setCancellingId] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [bookingType, setBookingType] = useState('properties'); // properties, businesses
  const [businessReservations, setBusinessReservations] = useState([]);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessError, setBusinessError] = useState(null);
  const [viewMode, setViewMode] = useState('made'); // received (como dueño) o made (como cliente)
  const [myBusinesses, setMyBusinesses] = useState([]);

  const isHost = user?.role === 'host' || user?.role === 'admin';
  const hasBusinesses = myBusinesses && myBusinesses.length > 0;

  useEffect(() => {
    if (bookingType === 'properties') {
      fetchMyBookings();
    } else {
      fetchBusinessReservations();
    }
  }, [fetchMyBookings, user, bookingType, viewMode]);

  // Fetch user's businesses to determine if they should see the toggle
  useEffect(() => {
    const fetchMyBusinesses = async () => {
      try {
        const response = await api.get('/businesses/my-businesses');
        setMyBusinesses(response.data || []);
      } catch (error) {
        console.error('Error fetching my businesses:', error);
        setMyBusinesses([]);
      }
    };

    if (bookingType === 'businesses') {
      fetchMyBusinesses();
    }
  }, [bookingType]);

  const fetchBusinessReservations = async () => {
    setBusinessLoading(true);
    setBusinessError(null);
    try {
      if (viewMode === 'made') {
        // Reservaciones que yo hice como cliente
        const response = await businessReservationService.getMyBusinessReservations();
        setBusinessReservations(response.data || []);
      } else {
        // Reservaciones que recibí en mis negocios
        // Primero obtener mis negocios
        const businessesResponse = await api.get('/businesses/my-businesses');
        const myBusinesses = businessesResponse.data || [];

        // Obtener reservaciones de cada negocio
        const allReservations = [];
        for (const business of myBusinesses) {
          try {
            const reservationsResponse = await businessReservationService.getBusinessReservations(business.id);
            const reservations = reservationsResponse.data || [];
            allReservations.push(...reservations);
          } catch (err) {
            console.error(`Error fetching reservations for business ${business.id}:`, err);
          }
        }
        setBusinessReservations(allReservations);
      }
    } catch (error) {
      setBusinessError(error.message);
    } finally {
      setBusinessLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await updateBookingStatus(bookingId, 'cancelled', 'Cancelado por el usuario');
      alert('Reserva cancelada exitosamente');
    } catch (error) {
      alert('Error al cancelar la reserva: ' + error.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (!confirm('¿Confirmar esta reserva?')) {
      return;
    }

    setActioningId(bookingId);
    try {
      await updateBookingStatus(bookingId, 'confirmed');
      alert('Reserva confirmada exitosamente');
    } catch (error) {
      alert('Error al confirmar la reserva: ' + error.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Motivo del rechazo (opcional):');
    if (reason === null) return; // Usuario canceló

    setActioningId(bookingId);
    try {
      await updateBookingStatus(bookingId, 'rejected', reason || 'Rechazado por el anfitrión');
      alert('Reserva rechazada');
    } catch (error) {
      alert('Error al rechazar la reserva: ' + error.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleCancelBusinessReservation = async (reservationId) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reservación?')) {
      return;
    }

    setCancellingId(reservationId);
    try {
      await businessReservationService.cancelBusinessReservation(reservationId);
      alert('Reservación cancelada exitosamente');
      fetchBusinessReservations(); // Recargar lista
    } catch (error) {
      alert('Error al cancelar la reservación: ' + error.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirmBusinessReservation = async (businessId, reservationId) => {
    if (!confirm('¿Confirmar esta reservación?')) {
      return;
    }

    setActioningId(reservationId);
    try {
      await businessReservationService.updateBusinessReservationStatus(businessId, reservationId, 'confirmed');
      alert('Reservación confirmada exitosamente');
      fetchBusinessReservations(); // Recargar lista
    } catch (error) {
      alert('Error al confirmar la reservación: ' + error.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectBusinessReservation = async (businessId, reservationId) => {
    if (!confirm('¿Rechazar esta reservación?')) {
      return;
    }

    setActioningId(reservationId);
    try {
      await businessReservationService.updateBusinessReservationStatus(businessId, reservationId, 'cancelled');
      alert('Reservación rechazada');
      fetchBusinessReservations(); // Recargar lista
    } catch (error) {
      alert('Error al rechazar la reservación: ' + error.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleOpenMessages = (booking) => {
    // Determinar el ID del otro usuario (host o guest dependiendo del rol)
    const otherUserId = isHost ? booking.guestId : booking.hostId;
    // Navegar a la página de mensajes con parámetros de booking
    navigate(`/messages?user=${otherUserId}&booking=${booking.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isUpcoming = (checkIn) => {
    return new Date(checkIn) > new Date();
  };

  const isPast = (checkOut) => {
    return new Date(checkOut) < new Date();
  };

  const filterBookings = () => {
    if (!bookings) return [];

    // Filtrar solo elementos válidos (no undefined)
    const validBookings = bookings.filter(b => b && b.checkIn && b.checkOut);

    switch (filter) {
      case 'upcoming':
        return validBookings.filter(b => isUpcoming(b.checkIn) && b.status !== 'cancelled');
      case 'past':
        return validBookings.filter(b => isPast(b.checkOut));
      case 'cancelled':
        return validBookings.filter(b => b.status === 'cancelled');
      default:
        return validBookings;
    }
  };

  const filterBusinessReservations = () => {
    if (!businessReservations) return [];

    const validReservations = businessReservations.filter(r => r && r.reservationDate);

    switch (filter) {
      case 'upcoming':
        return validReservations.filter(r => new Date(r.reservationDate) > new Date() && r.status !== 'cancelled');
      case 'past':
        return validReservations.filter(r => new Date(r.reservationDate) < new Date());
      case 'cancelled':
        return validReservations.filter(r => r.status === 'cancelled');
      default:
        return validReservations;
    }
  };

  const filteredBookings = filterBookings();
  const filteredBusinessReservations = filterBusinessReservations();

  const currentLoading = bookingType === 'properties' ? loading : businessLoading;
  const currentError = bookingType === 'properties' ? error : businessError;

  return (
    <UserAccountLayout activeMenu="bookings">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Reservas</h1>
          <p className="text-gray-600">
            {user?.role === 'host'
              ? 'Reservas de tus propiedades'
              : 'Gestiona tus viajes y reservas'}
          </p>
        </div>

        {/* Verification Alert */}
        {!verificationLoading && !isVerified && status !== 'verified' && (
          <div className="mb-6">
            <VerificationAlert action="hacer nuevas reservas" />
          </div>
        )}

      {/* Booking Type Tabs */}
      <div className="flex gap-2 md:gap-4 mb-6 border-b overflow-x-auto">
        <button
          onClick={() => setBookingType('properties')}
          className={`flex items-center gap-2 px-4 md:px-6 py-3 font-medium transition -mb-px whitespace-nowrap ${
            bookingType === 'properties'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Hotel size={20} />
          Alojamientos
          {bookings && bookings.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
              {bookings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setBookingType('businesses')}
          className={`flex items-center gap-2 px-4 md:px-6 py-3 font-medium transition -mb-px whitespace-nowrap ${
            bookingType === 'businesses'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Utensils size={20} />
          Restaurantes y Servicios
          {businessReservations && businessReservations.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
              {businessReservations.length}
            </span>
          )}
        </button>
      </div>

      {/* View Mode Toggle for Business Reservations - Solo para dueños de negocios */}
      {bookingType === 'businesses' && !currentLoading && hasBusinesses && (
        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setViewMode('received')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              viewMode === 'received'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reservaciones Recibidas
          </button>
          <button
            onClick={() => setViewMode('made')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              viewMode === 'made'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mis Reservaciones
          </button>
        </div>
      )}

      {/* Loading State */}
      {currentLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservas...</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas ({bookings?.length || 0})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'upcoming'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Próximas ({bookings?.filter(b => b && b.checkIn && isUpcoming(b.checkIn) && b.status !== 'cancelled').length || 0})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'past'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pasadas ({bookings?.filter(b => b && b.checkOut && isPast(b.checkOut)).length || 0})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'cancelled'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Canceladas ({bookings?.filter(b => b && b.status === 'cancelled').length || 0})
        </button>
      </div>

      {/* Error */}
      {currentError && !currentLoading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600">{currentError}</p>
        </div>
      )}

      {/* Property Bookings List */}
      {bookingType === 'properties' && filteredBookings.length === 0 && !loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No tienes reservas {filter !== 'all' && `${filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : 'canceladas'}`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? '¡Es hora de planear tu próxima aventura!'
              : 'Intenta cambiar el filtro para ver otras reservas'}
          </p>
          {filter === 'all' && (
            <Link
              to="/search"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark"
            >
              Buscar alojamientos
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const StatusIcon = STATUS_CONFIG[booking.status]?.icon || Clock;
            const nights = getDaysDifference(booking.checkIn, booking.checkOut);
            const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

            return (
              <div
                key={booking.id}
                className="bg-white border rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Property Image */}
                  <div className="lg:w-64 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {booking.Property?.images?.[0] ? (
                      <img
                        src={booking.Property.images[0]}
                        alt={booking.Property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link
                          to={`/properties/${booking.propertyId}`}
                          className="text-xl font-bold hover:text-primary"
                        >
                          {booking.Property?.title || 'Propiedad'}
                        </Link>
                        {booking.Property?.city && (
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <MapPin size={14} />
                            <span className="text-sm">
                              {booking.Property.city}, {booking.Property.country}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          STATUS_CONFIG[booking.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <StatusIcon size={14} />
                        {STATUS_CONFIG[booking.status]?.label || booking.status}
                      </div>
                    </div>

                    {/* Dates and Guests */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Check-in</p>
                          <p className="text-sm">{formatDate(booking.checkIn)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Check-out</p>
                          <p className="text-sm">{formatDate(booking.checkOut)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Huéspedes</p>
                          <p className="text-sm">{booking.guests} {booking.guests === 1 ? 'persona' : 'personas'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          ${booking.basePrice / nights} × {nights} {nights === 1 ? 'noche' : 'noches'}
                        </span>
                        <span className="text-sm">${booking.basePrice}</span>
                      </div>
                      {parseFloat(booking.cleaningFee) > 0 && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Tarifa de limpieza</span>
                          <span className="text-sm">${booking.cleaningFee}</span>
                        </div>
                      )}
                      {parseFloat(booking.serviceFee) > 0 && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Tarifa de servicio</span>
                          <span className="text-sm">${booking.serviceFee}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 mt-2 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <DollarSign size={18} />
                          Total
                        </span>
                        <span className="text-lg font-bold">${booking.totalPrice}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 flex-wrap">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
                      >
                        Ver detalles
                      </Link>
                      <Link
                        to={`/properties/${booking.propertyId}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Ver propiedad
                      </Link>

                      {/* Botón de Mensajes - Disponible para reservas confirmadas o completadas */}
                      {(booking.status === 'confirmed' || booking.status === 'completed') && (
                        <button
                          onClick={() => handleOpenMessages(booking)}
                          className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition flex items-center gap-2"
                        >
                          <MessageCircle size={16} />
                          Mensajes
                        </button>
                      )}

                      {/* Acciones para HOST */}
                      {isHost && booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmBooking(booking.id)}
                            disabled={actioningId === booking.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            {actioningId === booking.id ? 'Confirmando...' : 'Confirmar'}
                          </button>
                          <button
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={actioningId === booking.id}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                          >
                            {actioningId === booking.id ? 'Rechazando...' : 'Rechazar'}
                          </button>
                        </>
                      )}

                      {/* Acciones para GUEST */}
                      {!isHost && canCancel && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? 'Cancelando...' : 'Cancelar reserva'}
                        </button>
                      )}
                    </div>

                    {/* Cancellation Info */}
                    {booking.status === 'cancelled' && booking.cancellationReason && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Motivo de cancelación:</span> {booking.cancellationReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Business Reservations List */}
      {bookingType === 'businesses' && filteredBusinessReservations.length === 0 && !businessLoading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No tienes reservaciones {filter !== 'all' && `${filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : 'canceladas'}`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? '¡Explora restaurantes y servicios para hacer tu primera reservación!'
              : 'Intenta cambiar el filtro para ver otras reservaciones'}
          </p>
          {filter === 'all' && (
            <Link
              to="/search"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark"
            >
              Explorar negocios
            </Link>
          )}
        </div>
      ) : bookingType === 'businesses' && !businessLoading && (
        <div className="space-y-4">
          {filteredBusinessReservations.map((reservation) => {
            const StatusIcon = STATUS_CONFIG[reservation.status]?.icon || Clock;
            const canCancel = reservation.status === 'pending' || reservation.status === 'confirmed';
            const business = reservation.business;

            return (
              <div
                key={reservation.id}
                className="bg-white border rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Business Image */}
                  <div className="lg:w-64 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {business?.logo ? (
                      <img
                        src={getImageUrl(business.logo, 'business')}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        🏢
                      </div>
                    )}
                  </div>

                  {/* Reservation Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link
                          to={`/business/${reservation.businessId}`}
                          className="text-xl font-bold hover:text-primary"
                        >
                          {business?.name || 'Negocio'}
                        </Link>
                        {business?.address && (
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <MapPin size={14} />
                            <span className="text-sm">
                              {business.address.city || 'Ciudad'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          STATUS_CONFIG[reservation.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <StatusIcon size={14} />
                        {STATUS_CONFIG[reservation.status]?.label || reservation.status}
                      </div>
                    </div>

                    {/* Customer Info (solo para dueños) */}
                    {viewMode === 'received' && reservation.user && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-2">Cliente:</p>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                            {reservation.user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{reservation.user.name || 'Usuario'}</p>
                            <p className="text-sm text-gray-600">{reservation.user.email}</p>
                            {reservation.user.phone && (
                              <p className="text-sm text-gray-600">📞 {reservation.user.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reservation Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Fecha</p>
                          <p className="text-sm">{formatDate(reservation.reservationDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Hora</p>
                          <p className="text-sm">{reservation.reservationTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users size={18} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Personas</p>
                          <p className="text-sm">{reservation.numberOfPeople} {reservation.numberOfPeople === 1 ? 'persona' : 'personas'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {reservation.specialRequests && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Solicitudes especiales:</p>
                        <p className="text-sm text-gray-600">{reservation.specialRequests}</p>
                      </div>
                    )}

                    {/* Confirmation Code */}
                    {reservation.confirmationCode && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-1">Código de confirmación:</p>
                        <p className="text-lg font-mono font-bold text-blue-700">{reservation.confirmationCode}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 flex-wrap">
                      <Link
                        to={`/business/${reservation.businessId}`}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
                      >
                        Ver negocio
                      </Link>

                      {/* Botones para dueños del negocio (vista de reservaciones recibidas) */}
                      {viewMode === 'received' && reservation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirmBusinessReservation(reservation.businessId, reservation.id)}
                            disabled={actioningId === reservation.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            {actioningId === reservation.id ? 'Confirmando...' : 'Confirmar'}
                          </button>
                          <button
                            onClick={() => handleRejectBusinessReservation(reservation.businessId, reservation.id)}
                            disabled={actioningId === reservation.id}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                          >
                            {actioningId === reservation.id ? 'Rechazando...' : 'Rechazar'}
                          </button>
                        </>
                      )}

                      {/* Cancel Button para clientes (vista de mis reservaciones) */}
                      {viewMode === 'made' && canCancel && (
                        <button
                          onClick={() => handleCancelBusinessReservation(reservation.id)}
                          disabled={cancellingId === reservation.id}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancellingId === reservation.id ? 'Cancelando...' : 'Cancelar reservación'}
                        </button>
                      )}
                    </div>

                    {/* Cancellation Info */}
                    {reservation.status === 'cancelled' && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">
                          Reservación cancelada
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </UserAccountLayout>
  );
}

export default BookingsPage;
