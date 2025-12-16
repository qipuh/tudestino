import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useBusiness from '../hooks/useBusiness';

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

const businessTypes = [
  { value: 'hotel', label: 'Hotel / Alojamiento', icon: '🏨' },
  { value: 'restaurant', label: 'Restaurante', icon: '🍽️' },
  { value: 'entertainment', label: 'Entretenimiento', icon: '🎭' },
  { value: 'events', label: 'Eventos', icon: '🎉' },
  { value: 'tours', label: 'Tours y Excursiones', icon: '🗺️' },
  { value: 'transport', label: 'Transporte', icon: '🚗' },
  { value: 'spa', label: 'Spa y Bienestar', icon: '💆' },
  { value: 'other', label: 'Otro', icon: '🏢' },
];

function CreateBusiness() {
  const navigate = useNavigate();
  const { createBusiness, loading } = useBusiness();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    businessType: 'hotel',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Perú',
      zipCode: '',
      latitude: null,
      longitude: null,
    },
    contactPhone: '',
    contactEmail: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [mapMarker, setMapMarker] = useState(null);
  const [showMap, setShowMap] = useState(false);

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
    } else if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData({
        ...formData,
        socialMedia: {
          ...formData.socialMedia,
          [socialField]: value,
        },
      });
    } else {
      // Auto-generar slug desde el nombre en tiempo real
      if (name === 'name') {
        const slug = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remover acentos
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        setFormData({
          ...formData,
          [name]: value,
          slug: slug,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre del negocio es requerido');
      return;
    }

    if (!formData.slug.trim()) {
      setError('El slug es requerido');
      return;
    }

    if (!formData.address.city.trim()) {
      setError('La ciudad es requerida');
      return;
    }

    // Crear negocio
    // Prepare payload: remove optional empty values so backend validators don't fail
    const payload = { ...formData };
    if (!payload.website || payload.website.trim() === '') delete payload.website;
    if (!payload.contactEmail || payload.contactEmail.trim() === '') delete payload.contactEmail;

    const result = await createBusiness(payload);

    if (result.success && result.data && result.data.id) {
      navigate(`/business/${result.data.id}`);
    } else if (result.success && result.data && result.data.slug) {
      // fallback if API returns slug instead of id
      navigate(`/business/${result.data.slug}`);
    } else {
      const msg = result.error || result.raw?.message || 'Respuesta inesperada del servidor';
      setError(msg);
      // keep a console log for debugging API shape
      // eslint-disable-next-line no-console
      console.error('CreateBusiness result:', result);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.businessType) {
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
          <Link to="/business/dashboard" className="text-primary hover:text-primary-dark mb-4 inline-block">
            ← Volver al dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Negocio</h1>
          <p className="text-gray-600 mt-2">
            Completa la información de tu negocio para empezar a ofrecer servicios
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
              <div className="text-xs text-center">Ubicación</div>
            </div>
            <div className={`flex-1 border-t-2 ${step >= 3 ? 'border-primary' : 'border-gray-200'}`}></div>
            <div className={`flex-1 ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <div className="text-xs text-center">Contacto</div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del negocio *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Hotel Paradise Cajamarca"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL amigable) *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="hotel-paradise-cajamarca"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este será parte de la URL: tudestino.lat/business/{formData.slug}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de negocio *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {businessTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                          formData.businessType === type.value
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="businessType"
                          value={type.value}
                          checked={formData.businessType === type.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
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
                    placeholder="Describe tu negocio..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Ubicación */}
            {step === 2 && (
              <div className="space-y-6">
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
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Cajamarca"
                      required
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
                      País
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Perú"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="06001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitud (opcional)
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
                      Longitud (opcional)
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
                      📍 Selecciona la ubicación en el mapa
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Haz clic en el mapa para marcar la ubicación exacta de tu negocio
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 Las coordenadas se actualizarán automáticamente al hacer clic en el mapa
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Contacto */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de contacto
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="+51 976 123 456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contacto
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="info@minegocio.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio web
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="https://minegocio.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Redes Sociales (opcional)
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📘</span>
                      <input
                        type="text"
                        name="socialMedia.facebook"
                        value={formData.socialMedia.facebook}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="facebook.com/minegocio"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📷</span>
                      <input
                        type="text"
                        name="socialMedia.instagram"
                        value={formData.socialMedia.instagram}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="instagram.com/minegocio"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐦</span>
                      <input
                        type="text"
                        name="socialMedia.twitter"
                        value={formData.socialMedia.twitter}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="twitter.com/minegocio"
                      />
                    </div>
                  </div>
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
                  {loading ? 'Creando...' : 'Crear Negocio'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateBusiness;
