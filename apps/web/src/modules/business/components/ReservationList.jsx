import { Calendar, User, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
  pending: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    label: 'Pendiente'
  },
  confirmed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Confirmada'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Cancelada'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Completada'
  }
};

function ReservationList({ reservations = [], title = "Reservas Recientes" }) {
  if (!reservations || reservations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">No hay reservas para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {reservations.map((reservation) => {
          const StatusIcon = statusConfig[reservation.status]?.icon || AlertCircle;
          const statusInfo = statusConfig[reservation.status] || statusConfig.pending;

          return (
            <div
              key={reservation.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {reservation.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{reservation.user?.name || 'Usuario'}</h4>
                    <p className="text-sm text-gray-500">{reservation.user?.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon size={14} />
                  {statusInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {reservation.checkIn && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{format(new Date(reservation.checkIn), "d 'de' MMM, yyyy", { locale: es })}</span>
                  </div>
                )}
                {reservation.checkOut && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>{format(new Date(reservation.checkOut), "d 'de' MMM, yyyy", { locale: es })}</span>
                  </div>
                )}
                {reservation.room && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{reservation.room.name}</span>
                  </div>
                )}
                {reservation.guests && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={16} className="text-gray-400" />
                    <span>{reservation.guests} huésped{reservation.guests > 1 ? 'es' : ''}</span>
                  </div>
                )}
              </div>

              {reservation.totalAmount && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-bold text-lg text-primary">S/ {reservation.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReservationList;
