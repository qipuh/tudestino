import { useState, useEffect } from 'react';
import { Calendar, MapPin, User as UserIcon } from 'lucide-react';
import api from '../../services/api';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  rejected: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  rejected: 'Rechazada',
};

function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await api.get('/admin/bookings', { params });
      setBookings(response.data?.bookings || []);
      setTotalPages(response.data?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('es-PE');
  const formatCurrency = (amount) => `S/ ${Number(amount || 0).toFixed(2)}`;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h1>
          <p className="text-sm text-gray-600 mt-1">Todas las reservas de la plataforma</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propiedad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Huésped</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No hay reservas</td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.property?.hotelName || booking.property?.propertyName || 'Propiedad eliminada'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.property?.addressCity}, {booking.property?.addressCountry}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserIcon size={14} className="text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{booking.guest?.name || 'Usuario eliminado'}</div>
                        <div className="text-xs text-gray-500">{booking.guest?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(booking.totalPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {booking.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[booking.status] || booking.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingsManagement;
