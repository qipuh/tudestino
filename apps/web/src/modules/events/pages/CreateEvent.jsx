import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useEvents from '../hooks/useEvents';
import useAuthStore from '../../../store/authStore';
import LocationPicker from '../../../components/LocationPicker';

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

function CreateEvent() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { createEvent, loading } = useEvents();

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
    locationData: {
      countryId: '',
      departmentId: '',
      provinceId: '',
      districtId: '',
    },
    organizer: '',
    capacity: '',
  });

  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [mapMarker, setMapMarker] = useState(null);
  const [organizedBy, setOrganizedBy] = useState('user');
  const [selectedBusinessService, setSelectedBusinessService] = useState(null);
  const [userBusinesses, setUserBusinesses] = useState([]);

  // Cargar negocios del usuario si tiene
  useEffect(() => {
    const fetchUserBusinesses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/businesses/my-businesses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUserBusinesses(data);
        }
      } catch (err) {
        console.error('Error loading businesses:', err);
      }
    };

    if (user) {
      fetchUserBusinesses();
    }
  }, [user]);

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

  const handleLocationChange = (locationData) => {
    setFormData(prev => ({
      ...prev,
      locationData,
    }));
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

    if (organizedBy === 'business' && !selectedBusinessService) {
      setError('Debes seleccionar un negocio');
      return;
    }

    // Crear evento
    const payload = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
    };

    const result = await createEvent(
      payload,
      organizedBy,
      organizedBy === 'business' ? selectedBusinessService : null
    );

    if (result.success && result.data && result.data.id) {
      navigate(`/events/${result.data.id}`);
    } else {
      const msg = result.error || 'Error al crear el evento';
      setError(msg);
      console.error('CreateEvent result:', result);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.category) {
        setError('Completa todos los campos requeridos');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/events" className="text-primary hover:text-primary-dark mb-4 inline-block">
            ← Volver a eventos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Evento</h1>
          <p className="text-gray-600 mt-2">
            Completa la información de tu evento
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className="text-xs text-center">Información básica</div>
            </div>
            <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-primary' : 'border-gray-200'}`}></div>
            <div className={`flex-1 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <div className="text-xs text-center">Fecha y Ubicación</div>
            </div>
            <div className={`flex-1 border-t-2 ${step >= 3 ? 'border-primary' : 'border-gray-200'}`}></div>
            <div className={`flex-1 ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <div className="text-xs text-center">Detalles finales</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Información básica */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Tipo de organizador */}
                {userBusinesses.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organizado por
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${organizedBy === 'user' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          value="user"
                          checked={organizedBy === 'user'}
                          onChange={(e) => setOrganizedBy(e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-2xl">👤</span>
                        <span className="text-sm font-medium">Yo (Usuario)</span>
                      </label>
                      <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${organizedBy === 'business' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          value="business"
                          checked={organizedBy === 'business'}
                          onChange={(e) => setOrganizedBy(e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-2xl">🏢</span>
                        <span className="text-sm font-medium">Mi Negocio</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Selección de negocio si aplica */}
                {organizedBy === 'business' && userBusinesses.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona tu negocio *
                    </label>
                    <select
                      value={selectedBusinessService || ''}
                      onChange={(e) => setSelectedBusinessService(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="">-- Seleccionar negocio --</option>
                      {userBusinesses.map((business) => (
                        <option key={business.id} value={business.id}>
                          {business.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                        className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${formData.category === cat.value
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
            )}

            {/* Step 2: Fecha y Ubicación */}
            {step === 2 && (
              <div className="space-y-6">
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
                </div>

                {/* Ubicación Jerárquica */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <LocationPicker
                    value={formData.locationData}
                    onChange={handleLocationChange}
                    label="Ubicación del Evento"
                  />
                </div>

                <div>

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
                      Haz clic en el mapa para marcar la ubicación del evento
                    </p>
                  </div>
                  <div className="h-96">
                    <MapContainer
                      center={mapMarker || [-7.1619, -78.5128]}
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
            )}

            {/* Step 3: Detalles finales */}
            {step === 3 && (
              <div className="space-y-6">
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Resumen del evento
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>Nombre:</strong> {formData.name || 'Sin nombre'}</li>
                    <li><strong>Categoría:</strong> {eventCategories.find(c => c.value === formData.category)?.label}</li>
                    <li><strong>Fecha:</strong> {formData.eventDate || 'Sin fecha'}</li>
                    <li><strong>Hora:</strong> {formData.startTime || 'Sin hora'}</li>
                    <li><strong>Lugar:</strong> {formData.location || 'Sin lugar'}</li>
                    {formData.capacity && <li><strong>Capacidad:</strong> {formData.capacity} personas</li>}
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Atrás
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creando...' : 'Crear Evento'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;
