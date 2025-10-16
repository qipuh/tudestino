import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import RoomForm from '../components/rooms/RoomForm';
import api from '../../../services/api';

function EditRoomPage() {
  const { propertyId, roomId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPropertyAndRoom();
  }, [propertyId, roomId]);

  const fetchPropertyAndRoom = async () => {
    try {
      const response = await api.get(`/properties/${propertyId}/full`);
      const propertyData = response.success ? response.data : response;
      setProperty(propertyData);

      // Find the specific room
      const room = propertyData.rooms?.find((r) => r.id === roomId);
      if (!room) {
        setError('Habitación no encontrada');
        return;
      }

      setRoomData(room);
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('No se pudo cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validar
    if (!roomData.name || !roomData.pricePerNight) {
      alert('Por favor completa el nombre y precio de la habitación');
      return;
    }

    if (roomData.images.length < 3) {
      alert('Se requieren al menos 3 fotos de la habitación');
      return;
    }

    setSubmitting(true);
    try {
      // Usar el nuevo endpoint para actualizar habitación individual
      const response = await api.put(`/properties/${propertyId}/rooms/${roomId}`, roomData);

      if (response.success) {
        alert('¡Habitación actualizada exitosamente!');
        navigate(`/host/properties/${propertyId}/rooms`);
      }
    } catch (err) {
      console.error('Error updating room:', err);
      alert(err.response?.data?.message || 'Error al actualizar la habitación');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !property || !roomData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to={`/host/properties/${propertyId}/rooms`}
            className="text-primary hover:underline"
          >
            Volver a habitaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/host/properties/${propertyId}/rooms`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a habitaciones
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar habitación</h1>
          <p className="text-gray-600 mt-1">
            {property.hotelName || property.title}
          </p>
        </div>

        {/* Room Form */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
          <RoomForm
            roomData={roomData}
            onChange={setRoomData}
            isMultiUnit={property.multipleUnits}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            to={`/host/properties/${propertyId}/rooms`}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditRoomPage;
