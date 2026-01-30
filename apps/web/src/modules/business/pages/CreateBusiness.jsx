import { useState, useEffect, useRef } from 'react';
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

// Componente para actualizar la vista del mapa cuando cambia el marcador
function MapUpdater({ center }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);

  return null;
}

const businessTypes = [
  { value: 'hotel', label: 'Hotel / Alojamiento', icon: 'bed-outline', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'restaurant', label: 'Restaurante', icon: 'restaurant-outline', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { value: 'entertainment', label: 'Entretenimiento', icon: 'musical-notes-outline', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { value: 'tours', label: 'Tours y Excursiones', icon: 'map-outline', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'transport', label: 'Transporte', icon: 'car-outline', color: 'text-gray-600', bgColor: 'bg-gray-50', comingSoon: true },
  { value: 'spa', label: 'Spa y Bienestar', icon: 'sparkles-outline', color: 'text-pink-600', bgColor: 'bg-pink-50' },
];

// Configuración de subtipos de alojamiento y sus categorías con Ionicons
const hotelSubtypes = {
  hotel: {
    label: 'Hotel',
    icon: 'business-outline',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    categories: [
      { value: '1-star', label: '1 Estrella', stars: 1 },
      { value: '2-star', label: '2 Estrellas', stars: 2 },
      { value: '3-star', label: '3 Estrellas', stars: 3 },
      { value: '4-star', label: '4 Estrellas', stars: 4 },
      { value: '5-star', label: '5 Estrellas', stars: 5 },
      { value: '5-star-grand', label: '5 Estrellas Gran Lujo', stars: 5, grand: true },
    ]
  },
  hostel: {
    label: 'Hostal / Albergue',
    icon: 'home-outline',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    categories: [
      { value: 'basic', label: 'Básica' },
      { value: 'standard', label: 'Estándar' },
      { value: 'superior', label: 'Superior' },
    ]
  },
  apartment: {
    label: 'Apartamento Turístico',
    icon: 'apps-outline',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    categories: [
      { value: '1-key', label: '1 Llave', keys: 1 },
      { value: '2-key', label: '2 Llaves', keys: 2 },
      { value: '3-key', label: '3 Llaves', keys: 3 },
      { value: '4-key', label: '4 Llaves', keys: 4 },
      { value: '5-key', label: '5 Llaves', keys: 5 },
    ]
  },
  bnb: {
    label: 'Bed & Breakfast',
    icon: 'bed-outline',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    categories: [
      { value: 'basic', label: 'Básica' },
      { value: 'standard', label: 'Estándar' },
      { value: 'superior', label: 'Superior' },
    ]
  },
  resort: {
    label: 'Resort / Complejo',
    icon: 'water-outline',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    categories: [
      { value: '3-star', label: '3 Estrellas', stars: 3 },
      { value: '4-star', label: '4 Estrellas', stars: 4 },
      { value: '5-star', label: '5 Estrellas', stars: 5 },
    ]
  },
  villa: {
    label: 'Villa / Chalet',
    icon: 'home-sharp',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    categories: [
      { value: 'standard', label: 'Estándar' },
      { value: 'superior', label: 'Superior' },
      { value: 'luxury', label: 'De Lujo' },
    ]
  },
  guesthouse: {
    label: 'Posada / Casa Rural',
    icon: 'leaf-outline',
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-200',
    categories: [
      { value: '1-spike', label: '1 Espiga', spikes: 1 },
      { value: '2-spike', label: '2 Espigas', spikes: 2 },
      { value: '3-spike', label: '3 Espigas', spikes: 3 },
      { value: '4-spike', label: '4 Espigas', spikes: 4 },
      { value: '5-spike', label: '5 Espigas', spikes: 5 },
    ]
  },
  motel: {
    label: 'Motel',
    icon: 'car-outline',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    categories: [
      { value: '1-star', label: '1 Estrella', stars: 1 },
      { value: '2-star', label: '2 Estrellas', stars: 2 },
      { value: '3-star', label: '3 Estrellas', stars: 3 },
    ]
  },
  homestay: {
    label: 'Casa Particular',
    icon: 'people-outline',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    categories: [
      { value: 'unrated', label: 'Sin categoría oficial' },
    ]
  },
  parador: {
    label: 'Parador',
    icon: 'library-outline',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    categories: [
      { value: '3-star', label: '3 Estrellas', stars: 3 },
      { value: '4-star', label: '4 Estrellas', stars: 4 },
      { value: '5-star', label: '5 Estrellas', stars: 5 },
    ]
  },
  glamping: {
    label: 'Glamping',
    icon: 'bonfire-outline',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    categories: [
      { value: 'basic', label: 'Básica' },
      { value: 'luxury', label: 'Lujo' },
      { value: 'ultra-luxury', label: 'Ultra Lujo' },
    ]
  },
  youth_hostel: {
    label: 'Albergue Juvenil',
    icon: 'backpack-outline',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    categories: [
      { value: '1-backpack', label: '1 Mochila', backpacks: 1 },
      { value: '2-backpack', label: '2 Mochilas', backpacks: 2 },
      { value: '3-backpack', label: '3 Mochilas', backpacks: 3 },
    ]
  },
  pension: {
    label: 'Pensión',
    icon: 'grid-outline',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    categories: [
      { value: '1st-class', label: '1ª Categoría' },
      { value: '2nd-class', label: '2ª Categoría' },
      { value: '3rd-class', label: '3ª Categoría' },
    ]
  },
  monastery: {
    label: 'Hospedería / Monasterio',
    icon: 'moon-outline',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    categories: [
      { value: 'unrated', label: 'Sin categoría' },
    ]
  },
  boat: {
    label: 'Barco / Casa Flotante',
    icon: 'boat-outline',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    categories: [
      { value: 'unrated', label: 'Sin categoría' },
    ]
  },
};

function CreateBusiness() {
  const navigate = useNavigate();
  const { createBusiness, loading } = useBusiness();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    businessType: 'hotel',
    hotelSubtype: '', // Subtipo de alojamiento (hotel, hostel, apartment, etc.)
    hotelCategory: '', // Categoría según el subtipo (estrellas, llaves, etc.)
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      latitude: null,
      longitude: null,
    },
    contactPhone: '',
    contactEmail: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      tiktok: '',
      youtube: '',
    },
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [mapMarker, setMapMarker] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Estados para búsqueda de ubicación
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationInputRef = useRef(null);

  // Buscar ubicaciones usando Nominatim (OpenStreetMap)
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    setLoadingLocations(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();

      const suggestions = data.map(item => ({
        name: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state || item.address?.region,
        country: item.address?.country,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));

      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Debounce para buscar ubicaciones
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(locationQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [locationQuery]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Geocodificar dirección específica cuando cambie
  useEffect(() => {
    // Solo ejecutar en el paso 3 (ubicación)
    if (step !== 3) return;

    const geocodeAddress = async () => {
      const { street, city, state, country } = formData.address;

      // Solo geocodificar si hay dirección específica Y ya hay una ciudad seleccionada
      if (!street || street.length < 5 || !city) {
        return;
      }

      // Construir query completo con dirección, ciudad, estado y país
      const fullAddress = [street, city, state, country]
        .filter(Boolean)
        .join(', ');

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const location = data[0];
          const newLat = parseFloat(location.lat);
          const newLng = parseFloat(location.lon);

          // Actualizar coordenadas y marcador
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              latitude: newLat,
              longitude: newLng,
            }
          }));

          setMapMarker({
            lat: newLat,
            lng: newLng
          });
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      geocodeAddress();
    }, 800); // Debounce más largo para la dirección específica

    return () => clearTimeout(timeoutId);
  }, [step, formData.address.street, formData.address.city, formData.address.state, formData.address.country]);

  // Manejar selección de ubicación de la lista de sugerencias
  const handleSelectLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: location.city || '',
        state: location.state || '',
        country: location.country || '',
        latitude: location.latitude,
        longitude: location.longitude,
      }
    }));

    // Actualizar marcador en el mapa
    setMapMarker({
      lat: location.latitude,
      lng: location.longitude
    });

    setLocationQuery(location.name);
    setShowLocationSuggestions(false);
  };

  const handleMapClick = async (latlng) => {
    setMapMarker(latlng);

    // Geocodificación inversa para obtener la dirección del punto seleccionado
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.address) {
        const address = data.address;

        // Construir la dirección de la calle a partir de los componentes disponibles
        const streetParts = [
          address.road,
          address.house_number,
        ].filter(Boolean);

        const streetAddress = streetParts.length > 0 ? streetParts.join(' ') : '';

        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: streetAddress || prev.address.street,
            city: address.city || address.town || address.village || prev.address.city,
            state: address.state || address.region || prev.address.state,
            country: address.country || prev.address.country,
            latitude: latlng.lat,
            longitude: latlng.lng
          }
        }));

        // Actualizar el query de ubicación si cambió la ciudad
        if (address.city || address.town || address.village) {
          const locationName = [
            address.city || address.town || address.village,
            address.state || address.region,
            address.country
          ].filter(Boolean).join(', ');
          setLocationQuery(locationName);
        }
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      // Si falla, solo actualizar las coordenadas
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          latitude: latlng.lat,
          longitude: latlng.lng
        }
      }));
    }
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
      } else if (name === 'businessType') {
        // Limpiar campos de hotel si se cambia a otro tipo
        setFormData({
          ...formData,
          [name]: value,
          hotelSubtype: value === 'hotel' ? formData.hotelSubtype : '',
          hotelCategory: value === 'hotel' ? formData.hotelCategory : '',
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

    // Solo permitir submit en el paso 4
    if (step < 4) {
      // Si no estamos en el paso 4, avanzar al siguiente paso
      nextStep();
      return;
    }

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
    if (step === 2) {
      // Validar campos adicionales para hoteles
      if (formData.businessType === 'hotel') {
        if (!formData.hotelSubtype) {
          setError('Selecciona el tipo de alojamiento');
          return;
        }
        if (!formData.hotelCategory) {
          setError('Selecciona la categoría del alojamiento');
          return;
        }
      }
    }
    if (step === 3) {
      if (!formData.address.city) {
        setError('Debes seleccionar una ubicación antes de continuar');
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
              <div className="text-xs text-center">Tipo de negocio</div>
            </div>
            <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-primary' : 'border-gray-200'}`}></div>
            <div className={`flex-1 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <div className="text-xs text-center">Detalles</div>
            </div>
            <div className={`flex-1 border-t-2 ${step >= 3 ? 'border-primary' : 'border-gray-200'}`}></div>
            <div className={`flex-1 ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <div className="text-xs text-center">Ubicación</div>
            </div>
            <div className={`flex-1 border-t-2 ${step >= 4 ? 'border-primary' : 'border-gray-200'}`}></div>
            <div className={`flex-1 ${step >= 4 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 4 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                4
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
            {/* Step 1: Nombre y tipo de negocio */}
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
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg transition relative ${
                          type.comingSoon
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                            : formData.businessType === type.value
                            ? 'border-primary bg-primary bg-opacity-5 cursor-pointer'
                            : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                        }`}
                      >
                        <input
                          type="radio"
                          name="businessType"
                          value={type.value}
                          checked={formData.businessType === type.value}
                          onChange={handleChange}
                          disabled={type.comingSoon}
                          className="sr-only"
                        />
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          type.comingSoon ? 'bg-gray-100' : formData.businessType === type.value ? type.bgColor : 'bg-gray-100'
                        }`}>
                          <ion-icon
                            name={type.icon}
                            className={`text-3xl ${
                              type.comingSoon ? 'text-gray-400' : formData.businessType === type.value ? type.color : 'text-gray-500'
                            }`}
                          ></ion-icon>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium block">{type.label}</span>
                          {type.comingSoon && (
                            <span className="text-xs text-orange-600 font-semibold mt-0.5 block">
                              PRÓXIMAMENTE
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Detalles del alojamiento (solo para hotel) */}
            {step === 2 && formData.businessType === 'hotel' && (
              <div className="space-y-6">
                {/* Tipo de Alojamiento */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ion-icon name="home" className="text-xl text-primary"></ion-icon>
                    Tipo de Alojamiento *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(hotelSubtypes).map(([key, subtype]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            hotelSubtype: key,
                            hotelCategory: '', // Reset category when subtype changes
                          });
                        }}
                        className={`group relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 bg-white ${
                          formData.hotelSubtype === key
                            ? `${subtype.borderColor} ring-2 ring-offset-2 ${subtype.color.replace('text-', 'ring-')}`
                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                        }`}
                      >
                        {/* Icono siempre visible */}
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                          formData.hotelSubtype === key ? subtype.bgColor : 'bg-gray-100'
                        }`}>
                          <ion-icon
                            name={subtype.icon}
                            className={`text-3xl ${formData.hotelSubtype === key ? subtype.color : 'text-gray-400'}`}
                          ></ion-icon>
                        </div>

                        {/* Texto */}
                        <div className="flex-1 text-left">
                          <span className={`text-sm font-semibold block ${
                            formData.hotelSubtype === key ? subtype.color : 'text-gray-900'
                          }`}>
                            {subtype.label}
                          </span>
                        </div>

                        {/* Checkmark */}
                        {formData.hotelSubtype === key && (
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full ${subtype.bgColor} flex items-center justify-center`}>
                              <ion-icon name="checkmark-circle" className={`text-2xl ${subtype.color}`}></ion-icon>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categoría */}
                {formData.hotelSubtype && hotelSubtypes[formData.hotelSubtype] && (
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 animate-fadeIn">
                    <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ion-icon name="ribbon" className="text-xl text-primary"></ion-icon>
                      Categoría / Clasificación *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hotelSubtypes[formData.hotelSubtype].categories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              hotelCategory: category.value,
                            });
                          }}
                          className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 bg-white min-h-[120px] justify-center ${
                            formData.hotelCategory === category.value
                              ? `${hotelSubtypes[formData.hotelSubtype].borderColor} ring-2 ring-offset-2 ${hotelSubtypes[formData.hotelSubtype].color.replace('text-', 'ring-')}`
                              : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                          }`}
                        >
                          {/* Renderizar iconos según categoría */}
                          {category.stars && (
                            <div className="flex gap-1">
                              {[...Array(category.stars)].map((_, i) => (
                                <ion-icon
                                  key={i}
                                  name="star"
                                  className="text-2xl text-yellow-500"
                                ></ion-icon>
                              ))}
                              {category.grand && (
                                <ion-icon
                                  name="medal"
                                  className="text-2xl text-amber-600 ml-1"
                                ></ion-icon>
                              )}
                            </div>
                          )}

                          {category.keys && (
                            <div className="flex gap-1">
                              {[...Array(category.keys)].map((_, i) => (
                                <ion-icon
                                  key={i}
                                  name="key"
                                  className="text-2xl text-amber-600"
                                ></ion-icon>
                              ))}
                            </div>
                          )}

                          {category.spikes && (
                            <div className="flex gap-1">
                              {[...Array(category.spikes)].map((_, i) => (
                                <ion-icon
                                  key={i}
                                  name="flower"
                                  className="text-2xl text-lime-600"
                                ></ion-icon>
                              ))}
                            </div>
                          )}

                          {category.backpacks && (
                            <div className="flex gap-1">
                              {[...Array(category.backpacks)].map((_, i) => (
                                <ion-icon
                                  key={i}
                                  name="backpack"
                                  className="text-2xl text-indigo-600"
                                ></ion-icon>
                              ))}
                            </div>
                          )}

                          {/* Texto de categoría */}
                          <span className={`text-sm font-semibold text-center ${
                            formData.hotelCategory === category.value
                              ? hotelSubtypes[formData.hotelSubtype].color
                              : 'text-gray-900'
                          }`}>
                            {category.label}
                          </span>

                          {/* Checkmark */}
                          {formData.hotelCategory === category.value && (
                            <div className="absolute top-3 right-3">
                              <ion-icon
                                name="checkmark-circle"
                                className={`text-2xl ${hotelSubtypes[formData.hotelSubtype].color}`}
                              ></ion-icon>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                      <ion-icon name="information-circle" className="text-lg text-blue-500"></ion-icon>
                      Clasificación oficial de {hotelSubtypes[formData.hotelSubtype].label}
                    </p>
                  </div>
                )}

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={200}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Describe tu negocio..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Describe brevemente tu negocio
                    </p>
                    <p className={`text-xs font-medium ${
                      200 - formData.description.length <= 20
                        ? 'text-orange-600'
                        : 'text-gray-500'
                    }`}>
                      {200 - formData.description.length} caracteres restantes
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Descripción (para otros tipos de negocio) */}
            {step === 2 && formData.businessType !== 'hotel' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={200}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Describe tu negocio..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Describe brevemente tu negocio
                    </p>
                    <p className={`text-xs font-medium ${
                      200 - formData.description.length <= 20
                        ? 'text-orange-600'
                        : 'text-gray-500'
                    }`}>
                      {200 - formData.description.length} caracteres restantes
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Ubicación */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Búsqueda de ubicación */}
                <div className="relative" ref={locationInputRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar ubicación *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onFocus={() => locationSuggestions.length > 0 && setShowLocationSuggestions(true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Ej: Cajamarca, Perú"
                    />
                    {loadingLocations && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>

                  {/* Sugerencias de ubicación */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectLocation(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                        >
                          <span className="text-xl mt-0.5">📍</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {suggestion.name}
                            </div>
                            {(suggestion.city || suggestion.country) && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {[suggestion.city, suggestion.country].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ubicación seleccionada (solo lectura) */}
                {formData.address.city && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">✓ Ubicación seleccionada</h4>
                    <div className="text-sm text-green-800 space-y-1">
                      {formData.address.city && <div>Ciudad: {formData.address.city}</div>}
                      {formData.address.state && <div>Región: {formData.address.state}</div>}
                      {formData.address.country && <div>País: {formData.address.country}</div>}
                      {formData.address.latitude && formData.address.longitude && (
                        <div className="text-xs text-green-600 mt-2">
                          Coordenadas: {formData.address.latitude.toFixed(6)}, {formData.address.longitude.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dirección adicional opcional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección específica (opcional)
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Jr. Lima 123, 2do piso"
                  />
                </div>

                {/* Mapa interactivo */}
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">
                      📍 Ajusta la ubicación en el mapa
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Haz clic en el mapa para ajustar la ubicación exacta de tu negocio
                    </p>
                  </div>
                  <div className="h-96">
                    <MapContainer
                      center={mapMarker || [-7.1619, -78.5128]}
                      zoom={mapMarker ? 15 : 6}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <MapClickHandler onLocationSelect={handleMapClick} />
                      <MapUpdater center={mapMarker ? [mapMarker.lat, mapMarker.lng] : null} />
                      {mapMarker && (
                        <Marker position={[mapMarker.lat, mapMarker.lng]} />
                      )}
                    </MapContainer>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 Primero busca tu ubicación, luego ajusta las coordenadas haciendo clic en el mapa
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Contacto */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Teléfono y Email en una fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ion-icon name="logo-facebook" className="text-2xl text-blue-600"></ion-icon>
                      </div>
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
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ion-icon name="logo-instagram" className="text-2xl text-pink-600"></ion-icon>
                      </div>
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
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ion-icon name="logo-tiktok" className="text-2xl text-white"></ion-icon>
                      </div>
                      <input
                        type="text"
                        name="socialMedia.tiktok"
                        value={formData.socialMedia.tiktok}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="tiktok.com/@minegocio"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ion-icon name="logo-youtube" className="text-2xl text-red-600"></ion-icon>
                      </div>
                      <input
                        type="text"
                        name="socialMedia.youtube"
                        value={formData.socialMedia.youtube}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="youtube.com/@minegocio"
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
              {step < 4 ? (
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
