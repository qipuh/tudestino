import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Users, DollarSign, Clock, Phone, Mail,
  MessageCircle, CheckCircle, XCircle, ArrowLeft, User, Home
} from 'lucide-react';
import useBookingStore from '../../../store/bookingStore';
import useAuthStore from '../../../store/authStore';

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmada',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle,
  },
  completed: {
    label: 'Completada',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rechazada',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: XCircle,
  },
};

function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentBooking, loading, error, fetchBookingById, updateBookingStatus } = useBookingStore();
  const [actionLoading, setActionLoading] = useState(false);

  const isHost = user?.role === 'host' || user?.role === 'admin';

  useEffect(() => {
    fetchBookingById(id);
  }, [id, fetchBookingById]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
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

  const handleConfirm = async () => {
    if (!confirm('¿Confirmar esta reserva?')) return;

    setActionLoading(true);
    try {
      await updateBookingStatus(id, 'confirmed');
      alert('Reserva confirmada exitosamente');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Motivo del rechazo (opcional):');
    if (reason === null) return;

    setActionLoading(true);
    try {
      await updateBookingStatus(id, 'rejected', reason || 'Rechazado por el anfitrión');
      alert('Reserva rechazada');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    setActionLoading(true);
    try {
      await updateBookingStatus(id, 'cancelled', 'Cancelado por el usuario');
      alert('Reserva cancelada');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !currentBooking) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error || 'Reserva no encontrada'}</p>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver a mis reservas
          </button>
        </div>
      </div>
    );
  }

  const booking = currentBooking;
  const StatusIcon = STATUS_CONFIG[booking.status]?.icon || Clock;
  const nights = getDaysDifference(booking.checkIn, booking.checkOut);
  const canConfirmOrReject = isHost && booking.status === 'pending';
  const canCancel = !isHost && (booking.status === 'pending' || booking.status === 'confirmed');

  // Usuario a mostrar: si soy host, muestro el guest. Si soy guest, muestro el host
  const otherUser = isHost ? booking.Guest : booking.Host;
  const otherUserRole = isHost ? 'Huésped' : 'Anfitrión';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/bookings')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Volver a reservas
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Detalles de la Reserva</h1>
            <p className="text-gray-600">Código: #{booking.id}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${STATUS_CONFIG[booking.status]?.color}`}>
            <StatusIcon size={18} />
            <span className="font-medium">{STATUS_CONFIG[booking.status]?.label || booking.status}</span>
          </div>
        </div>

        {/* Actions */}
        {canConfirmOrReject && (
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading ? 'Procesando...' : 'Rechazar'}
            </button>
          </div>
        )}

        {canCancel && (
          <div className="pt-4 border-t">
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="w-full px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading ? 'Cancelando...' : 'Cancelar Reserva'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Home size={24} />
              Propiedad
            </h2>
            <div className="flex gap-4">
              {booking.Property?.images?.[0] && (
                <img
                  src={booking.Property.images[0]}
                  alt={booking.Property.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div>
                <Link
                  to={`/properties/${booking.propertyId}`}
                  className="text-lg font-bold hover:text-primary mb-2 block"
                >
                  {booking.Property?.title || 'Propiedad'}
                </Link>
                <div className="flex items-center gap-1 text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span>{booking.Property?.city}, {booking.Property?.country}</span>
                </div>
                {booking.Property?.address && (
                  <p className="text-sm text-gray-600">{booking.Property.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates & Guests */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Fechas y Huéspedes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-primary mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Check-in</p>
                  <p className="text-gray-600">{formatDate(booking.checkIn)}</p>
                  {booking.Property?.checkInTime && (
                    <p className="text-sm text-gray-500">A partir de las {booking.Property.checkInTime}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-primary mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Check-out</p>
                  <p className="text-gray-600">{formatDate(booking.checkOut)}</p>
                  {booking.Property?.checkOutTime && (
                    <p className="text-sm text-gray-500">Hasta las {booking.Property.checkOutTime}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex items-center gap-3">
              <Users className="text-primary" size={20} />
              <div>
                <p className="font-medium text-gray-900">{nights} {nights === 1 ? 'noche' : 'noches'}</p>
                <p className="text-gray-600">{booking.guests} {booking.guests === 1 ? 'huésped' : 'huéspedes'}</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign size={24} />
              Desglose de Precios
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">${booking.basePrice / nights} × {nights} {nights === 1 ? 'noche' : 'noches'}</span>
                <span className="font-medium">${booking.basePrice}</span>
              </div>
              {parseFloat(booking.cleaningFee) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarifa de limpieza</span>
                  <span className="font-medium">${booking.cleaningFee}</span>
                </div>
              )}
              {parseFloat(booking.serviceFee) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarifa de servicio</span>
                  <span className="font-medium">${booking.serviceFee}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-bold">Total ({booking.currency || 'USD'})</span>
                <span className="text-2xl font-bold text-primary">${booking.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          {otherUser && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User size={24} />
                {otherUserRole}
              </h2>
              <div className="text-center mb-4">
                {otherUser.avatar ? (
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.name}
                    className="w-24 h-24 rounded-full mx-auto mb-3"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
                <h3 className="font-bold text-lg">{otherUser.name}</h3>
                {otherUser.createdAt && isHost && (
                  <p className="text-sm text-gray-500">
                    Miembro desde {new Date(otherUser.createdAt).getFullYear()}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {otherUser.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <a href={`mailto:${otherUser.email}`} className="hover:text-primary text-sm">
                      {otherUser.email}
                    </a>
                  </div>
                )}
                {otherUser.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <a href={`tel:${otherUser.phone}`} className="hover:text-primary text-sm">
                      {otherUser.phone}
                    </a>
                  </div>
                )}
              </div>

              <Link
                to={`/messages?user=${otherUser.id}&booking=${booking.id}`}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
              >
                <MessageCircle size={20} />
                Enviar mensaje
              </Link>
            </div>
          )}

          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Estado de Pago</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${
                  booking.paymentStatus === 'paid' ? 'text-green-600' :
                  booking.paymentStatus === 'pending' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {booking.paymentStatus === 'paid' ? 'Pagado' :
                   booking.paymentStatus === 'pending' ? 'Pendiente' :
                   'No pagado'}
                </span>
              </div>
              {booking.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-medium capitalize">{booking.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Info */}
          {(booking.status === 'cancelled' || booking.status === 'rejected') && booking.cancellationReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-bold text-red-900 mb-2">
                Motivo de {booking.status === 'cancelled' ? 'cancelación' : 'rechazo'}
              </h3>
              <p className="text-sm text-red-700">{booking.cancellationReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingDetailPage;
