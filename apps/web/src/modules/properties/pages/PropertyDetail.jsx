import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Wifi, Star, ArrowLeft, Calendar, DollarSign, MessageCircle } from 'lucide-react';
import BookingCard from '../../bookings/components/BookingCard';
import RoomSelector from '../../bookings/components/RoomSelector';
import api from '../../../services/api';
import useAuthStore from '../../../store/authStore';

const AMENITY_ICONS = {
  wifi: { icon: '📶', name: 'WiFi' },
  kitchen: { icon: '🍳', name: 'Cocina' },
  parking: { icon: '🅿️', name: 'Estacionamiento' },
  pool: { icon: '🏊', name: 'Piscina' },
  gym: { icon: '💪', name: 'Gimnasio' },
  ac: { icon: '❄️', name: 'Aire acondicionado' },
  heating: { icon: '🔥', name: 'Calefacción' },
  tv: { icon: '📺', name: 'TV' },
  washer: { icon: '🧺', name: 'Lavadora' },
  workspace: { icon: '💻', name: 'Espacio de trabajo' },
  balcony: { icon: '🌅', name: 'Balcón' },
  pets: { icon: '🐕', name: 'Mascotas permitidas' },
};

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      console.log('🔍 Fetching property:', id);
      const result = await api.get(`/properties/${id}`);
      console.log('📦 Raw API response:', result);

      // Manejar ambos formatos: { success: true, data: {...} } o directamente {...}
      let propertyData = result;
      if (result.success && result.data) {
        propertyData = result.data;
      } else if (result.data) {
        propertyData = result.data;
      }

      console.log('✅ Property data extracted:', propertyData);
      console.log('🏠 Property title:', propertyData?.title);
      console.log('🖼️ Images:', propertyData?.images);

      setProperty(propertyData);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactHost = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login?redirect=/properties/' + id);
      return;
    }

    if (property?.host?.id === user.id) {
      alert('No puedes contactarte a ti mismo');
      return;
    }

    // Navigate to messages page with host ID as parameter
    navigate(`/messages?user=${property.host.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Propiedad no encontrada</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/" className="text-primary hover:text-primary-dark">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Soporte para ambos formatos (antiguo y nuevo)
  const rooms = property.rooms || [];
  const hasRooms = rooms.length > 0;

  // Imágenes: de las habitaciones o de la propiedad
  let images = [];
  if (hasRooms && rooms[0].images && rooms[0].images.length > 0) {
    // Combinar imágenes de todas las habitaciones
    images = rooms.flatMap(room => room.images || []);
  } else if (property.images) {
    images = property.images;
  }

  // Amenidades
  const amenities = property.amenities || property.propertyAmenities || [];

  // Información básica
  const title = property.title || property.hotelName || 'Propiedad sin título';
  const city = property.city || property.addressCity || '';
  const country = property.country || property.addressCountry || '';
  const description = property.description || 'Sin descripción disponible';

  // Calcular capacidades totales si hay habitaciones
  const maxCapacity = hasRooms ? Math.max(...rooms.map(r => r.guestCapacity)) : property.guests;
  const totalRooms = hasRooms ? rooms.length : property.bedrooms;
  const minPrice = hasRooms ? Math.min(...rooms.map(r => parseFloat(r.pricePerNight))) : property.basePrice;

  console.log('🎨 Rendering PropertyDetail with:', { property, images, amenities, rooms, hasRooms });

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Volver
        </Link>
      </div>

      {/* Images Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
            <div className="md:col-span-1 h-96 bg-gray-200">
              <img
                src={images[selectedImage]}
                alt={title}
                className="w-full h-full object-cover cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {images.slice(1, 5).map((img, index) => (
                <div key={index} className="h-48 bg-gray-200 cursor-pointer" onClick={() => setSelectedImage(index + 1)}>
                  <img src={img} alt={`${property.title} ${index + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center">
            <p className="text-gray-500">Sin imágenes disponibles</p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={18} />
                  <span>{city}, {country}</span>
                </div>
                {property.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{property.averageRating}</span>
                    <span>({property.ratingCount} reseñas)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Host Info */}
            {property.host && (
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${property.host.id}`} className="cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold hover:ring-2 hover:ring-primary hover:ring-offset-2 transition">
                        {property.host.avatar ? (
                          <img src={property.host.avatar} alt={property.host.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          property.host.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                    <div>
                      <p className="font-medium">
                        Anfitrión: {' '}
                        <Link
                          to={`/profile/${property.host.id}`}
                          className="text-primary hover:text-primary-dark hover:underline"
                        >
                          {property.host.name}
                        </Link>
                      </p>
                      {property.host.hostRating > 0 && (
                        <p className="text-sm text-gray-600">★ {property.host.hostRating} calificación</p>
                      )}
                    </div>
                  </div>
                  {user && user.id !== property.host.id && (
                    <button
                      onClick={handleContactHost}
                      className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition"
                    >
                      <MessageCircle size={18} />
                      Contactar
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="mb-6 pb-6 border-b">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="text-gray-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Huéspedes</p>
                    <p className="font-medium">Hasta {maxCapacity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="text-gray-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">
                      {hasRooms ? 'Habitaciones' : 'Dormitorios'}
                    </p>
                    <p className="font-medium">{totalRooms || 0}</p>
                  </div>
                </div>
                {!hasRooms && (
                  <>
                    <div className="flex items-center gap-2">
                      <Bed className="text-gray-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Camas</p>
                        <p className="font-medium">{property.beds || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="text-gray-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Baños</p>
                        <p className="font-medium">{property.bathrooms || 0}</p>
                      </div>
                    </div>
                  </>
                )}
                {hasRooms && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-gray-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Desde</p>
                      <p className="font-medium">${minPrice}/noche</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-xl font-bold mb-3">Acerca de este espacio</h2>
              <p className="text-gray-700 whitespace-pre-line">{description}</p>
            </div>

            {/* Rooms Section - Solo para propiedades con habitaciones */}
            {hasRooms && (
              <div className="mb-6 pb-6 border-b">
                <RoomSelector
                  rooms={rooms}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
                />
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-xl font-bold mb-3">Amenidades</h2>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map(amenityId => {
                    const amenity = AMENITY_ICONS[amenityId];
                    if (!amenity) return null;
                    return (
                      <div key={amenityId} className="flex items-center gap-2">
                        <span className="text-2xl">{amenity.icon}</span>
                        <span>{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* House Rules */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Reglas de la casa</h2>
              <div className="space-y-2 text-gray-700">
                <p>• Check-in: {property.checkIn || '15:00'}</p>
                <p>• Check-out: {property.checkOut || '11:00'}</p>
                <p>• Estancia mínima: {property.minimumStay || 1} noche(s)</p>
                {property.maximumStay && <p>• Estancia máxima: {property.maximumStay} noche(s)</p>}
                <p>• {property.smokingAllowed ? '✓' : '✗'} Se permite fumar</p>
                <p>• {property.petsAllowed ? '✓' : '✗'} Se permiten mascotas</p>
                <p>• {property.eventsAllowed ? '✓' : '✗'} Se permiten eventos</p>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <BookingCard
              property={property}
              preSelectedRoomId={selectedRoomId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
