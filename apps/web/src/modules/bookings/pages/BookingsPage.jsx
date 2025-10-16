import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, DollarSign, AlertCircle, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import useBookingStore from '../../../store/bookingStore';
import useAuthStore from '../../../store/authStore';

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
  const { bookings, loading, error, fetchMyBookings, updateBookingStatus } = useBookingStore();
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [cancellingId, setCancellingId] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  const isHost = user?.role === 'host' || user?.role === 'admin';

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings, user]);

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

  const filteredBookings = filterBookings();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Reservas</h1>
        <p className="text-gray-600">
          {user?.role === 'host'
            ? 'Reservas de tus propiedades'
            : 'Gestiona tus viajes y reservas'}
        </p>
      </div>

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
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
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
    </div>
  );
}

export default BookingsPage;
