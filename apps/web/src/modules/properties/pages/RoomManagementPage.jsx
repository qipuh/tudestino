import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Bed, Users, DollarSign } from 'lucide-react';
import api from '../../../services/api';
import { ROOM_TYPE_LABELS, BED_TYPE_LABELS } from '@tudestino/shared';

function RoomManagementPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${propertyId}/full`);
      const propertyData = response.success ? response.data : response;
      setProperty(propertyData);
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('No se pudo cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      return;
    }

    setDeletingRoomId(roomId);
    try {
      // Usar el nuevo endpoint para eliminar habitación individual
      const response = await api.delete(`/properties/${propertyId}/rooms/${roomId}`);

      if (response.success) {
        alert('Habitación eliminada exitosamente');
        fetchProperty();
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      alert(err.response?.data?.message || 'Error al eliminar la habitación');
    } finally {
      setDeletingRoomId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/host/properties" className="text-primary hover:underline">
            Volver a mis propiedades
          </Link>
        </div>
      </div>
    );
  }

  const rooms = property.rooms || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/host/properties"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a mis propiedades
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Habitaciones</h1>
              <p className="text-gray-600 mt-1">
                {property.hotelName || property.title}
              </p>
            </div>
            <Link
              to={`/host/properties/${propertyId}/rooms/add`}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <Plus size={20} />
              Agregar habitación
            </Link>
          </div>
        </div>

        {/* Rooms List */}
        {rooms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Bed size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay habitaciones registradas
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando la primera habitación de tu establecimiento
            </p>
            <Link
              to={`/host/properties/${propertyId}/rooms/add`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <Plus size={20} />
              Agregar primera habitación
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const totalBeds = room.beds.reduce((sum, bed) => sum + bed.count, 0);
              const bedSummary = room.beds
                .map((bed) => `${bed.count} ${BED_TYPE_LABELS[bed.type]}`)
                .join(', ');

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition"
                >
                  {/* Room Image */}
                  {room.images && room.images.length > 0 ? (
                    <div className="aspect-video relative">
                      <img
                        src={room.images[0]}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      {room.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          +{room.images.length - 1} fotos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <Bed size={48} className="text-gray-400" />
                    </div>
                  )}

                  {/* Room Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded mb-2">
                          {ROOM_TYPE_LABELS[room.roomType]}
                        </span>
                        <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{room.guestCapacity} huéspedes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bed size={16} />
                        <span>{bedSummary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span className="font-semibold text-gray-900">
                          ${parseFloat(room.pricePerNight).toFixed(2)} / noche
                        </span>
                      </div>
                    </div>

                    {/* Amenities count */}
                    {room.amenities && room.amenities.length > 0 && (
                      <p className="text-xs text-gray-500 mb-4">
                        {room.amenities.length} servicios disponibles
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/host/properties/${propertyId}/rooms/${room.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                      >
                        <Edit2 size={16} />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        disabled={deletingRoomId === room.id}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                        {deletingRoomId === room.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>

                    {/* Availability status */}
                    <div className="mt-3 pt-3 border-t">
                      <span
                        className={`text-xs font-medium ${
                          room.isAvailable ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {room.isAvailable ? '● Disponible' : '● No disponible'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomManagementPage;
