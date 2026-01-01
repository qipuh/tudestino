import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { ArrowLeft, Save } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useEvents from '../hooks/useEvents';
import useAuthStore from '../../../store/authStore';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar clics en el mapa
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

const eventCategories = [
  { value: 'concert', label: 'Concierto', icon: '🎵' },
  { value: 'festival', label: 'Festival', icon: '🎊' },
  { value: 'conference', label: 'Conferencia', icon: '🎤' },
  { value: 'fair', label: 'Feria', icon: '🎪' },
  { value: 'workshop', label: 'Taller', icon: '🛠️' },
  { value: 'sports', label: 'Deportivo', icon: '⚽' },
  { value: 'cultural', label: 'Cultural', icon: '🎭' },
  { value: 'gastronomic', label: 'Gastronómico', icon: '🍽️' },
  { value: 'other', label: 'Otro', icon: '📅' },
];

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { getEvent, updateEvent, loading } = useEvents();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'concert',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Perú',
      latitude: null,
      longitude: null,
    },
    organizer: '',
    capacity: '',
  });

  const [error, setError] = useState('');
  const [mapMarker, setMapMarker] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Cargar evento existente
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const result = await getEvent(id);
        if (result.success && result.data) {
          const event = result.data;

          setFormData({
            name: event.name || '',
            description: event.description || '',
            category: event.category || 'concert',
            eventDate: event.eventDate || '',
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            location: event.location || '',
            address: {
              street: event.address?.street || '',
              city: event.address?.city || event.city || '',
              state: event.address?.state || '',
              country: event.address?.country || 'Perú',
              latitude: event.address?.latitude || null,
              longitude: event.address?.longitude || null,
            },
            organizer: event.organizer || '',
            capacity: event.capacity || '',
          });

          // Configurar marcador del mapa si hay coordenadas
          if (event.address?.latitude && event.address?.longitude) {
            setMapMarker({
              lat: parseFloat(event.address.latitude),
              lng: parseFloat(event.address.longitude)
            });
          }
        } else {
          setError('No se pudo cargar el evento');
        }
      } catch (err) {
        setError('Error al cargar el evento');
        console.error(err);
      } finally {
        setLoadingEvent(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  // Actualizar marcador cuando cambien las coordenadas manualmente
  useEffect(() => {
    if (formData.address.latitude && formData.address.longitude) {
      setMapMarker({
        lat: parseFloat(formData.address.latitude),
        lng: parseFloat(formData.address.longitude)
      });
    }
  }, [formData.address.latitude, formData.address.longitude]);

  const handleMapClick = (latlng) => {
    setMapMarker(latlng);
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6)
      }
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre del evento es requerido');
      return;
    }

    if (!formData.eventDate) {
      setError('La fecha del evento es requerida');
      return;
    }

    if (!formData.startTime) {
      setError('La hora de inicio es requerida');
      return;
    }

    // Actualizar evento
    const payload = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
    };

    const result = await updateEvent(id, payload);

    if (result.success) {
      navigate(`/events/${id}`);
    } else {
      const msg = result.error || 'Error al actualizar el evento';
      setError(msg);
      console.error('EditEvent result:', result);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  const mapCenter = mapMarker || [-7.1619, -78.5128];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/events/${id}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft size={20} />
            Volver al evento
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar Evento</h1>
          <p className="text-gray-600 mt-2">
            Actualiza la información de tu evento
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Información Básica</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del evento *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Festival de Música Cajamarca 2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {eventCategories.map((cat) => (
                      <label
                        key={cat.value}
                        className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                          formData.category === cat.value
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={formData.category === cat.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-xs font-medium">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Describe tu evento..."
                  />
                </div>
              </div>
            </div>

            {/* Fecha y horario */}
            <div>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Fecha y Horario</h2>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del evento *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora inicio *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Ubicación</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lugar *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Plaza de Armas de Cajamarca"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Calle, número"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Cajamarca"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Región/Estado
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Cajamarca"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="address.latitude"
                      value={formData.address.latitude || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="-7.1619"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="address.longitude"
                      value={formData.address.longitude || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="-78.5128"
                    />
                  </div>
                </div>

                {/* Mapa interactivo */}
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Ubicación en el mapa
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Haz clic en el mapa para actualizar la ubicación
                    </p>
                  </div>
                  <div className="h-96">
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <MapClickHandler onLocationSelect={handleMapClick} />
                      {mapMarker && (
                        <Marker position={[mapMarker.lat, mapMarker.lng]} />
                      )}
                    </MapContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles adicionales */}
            <div>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Detalles Adicionales</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del organizador
                  </label>
                  <input
                    type="text"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Nombre público del organizador"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad (opcional)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Número máximo de asistentes"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <Link
                to={`/events/${id}`}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditEvent;
