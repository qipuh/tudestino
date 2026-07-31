import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import ReservationCard from '../components/ReservationCard';
import reservationsService from '../services/reservationsService';

export default function ReservationsPage() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [businessId, statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationsService.getReservations({
        businessId,
        status: statusFilter || undefined,
        limit: 50
      });
      setReservations(Array.isArray(data) ? data : (data.data || []));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando reservaciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await reservationsService.updateStatus(id, newStatus);
      setReservations(reservations.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await reservationsService.cancelReservation(id);
      setReservations(reservations.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Reservaciones</h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No hay reservaciones para mostrar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reservations.map(reservation => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onStatusChange={handleStatusChange}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
