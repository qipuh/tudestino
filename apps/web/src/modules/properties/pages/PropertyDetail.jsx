import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Star, Calendar, DollarSign, MessageCircle, Heart, Info, Home, Sparkles, Image as ImageIcon, Newspaper } from 'lucide-react';
import BookingFlow from '../../bookings/components/BookingFlow';
import api, { getImageUrl } from '../../../services/api';
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (property?.business?.id && user) {
      checkFollowStatus();
    }
    // Set initial tab based on room availability
    if (property) {
      const hasRooms = property.rooms && property.rooms.length > 0;
      setActiveTab(hasRooms ? 'rooms' : 'info');
    }
  }, [property, user]);

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

  const checkFollowStatus = async () => {
    if (!property?.business?.id) return;
    try {
      const response = await api.get(`/businesses/${property.business.id}/following`);
      setIsFollowing(response.data.data?.isFollowing || false);
    } catch (error) {
      console.error('Error checking follow status:', error);
      setIsFollowing(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login?redirect=/properties/' + id);
      return;
    }

    if (!property?.business?.id) return;

    try {
      setFollowLoading(true);

      if (isFollowing) {
        await api.delete(`/businesses/${property.business.id}/follow`);
      } else {
        await api.post(`/businesses/${property.business.id}/follow`);
      }

      await checkFollowStatus();
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert(error.response?.data?.message || 'Error al actualizar seguimiento');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleContactBusiness = () => {
    if (!user) {
      navigate('/login?redirect=/properties/' + id);
      return;
    }

    if (property?.business?.ownerId === user.id) {
      alert('No puedes contactarte a ti mismo');
      return;
    }

    navigate(`/messages?user=${property.business.ownerId}`);
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
    // Combinar imágenes de todas las habitaciones con la ruta correcta
    images = rooms.flatMap(room =>
      (room.images || []).map(img =>
        img.startsWith('/uploads/') || img.startsWith('http') ? img : `/uploads/rooms/${img}`
      )
    );
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

  const businessLogo = property?.business?.logo;
  const businessName = property?.business?.name || title;
  const businessFollowers = property?.business?.followersCount || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Images Gallery */}
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        {images.length > 0 ? (
          <>
            {/* Main Cover Image */}
            <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-200 rounded-b-xl overflow-hidden relative mb-4">
              <img
                src={getImageUrl(images[selectedImage])}
                alt={title}
                className="w-full h-full object-cover"
              />

              {/* Info y Botones superpuestos - Diseño Premium */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 lg:p-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  {/* Lado izquierdo: Logo, nombre, seguidores, ubicación */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {businessLogo ? (
                      <img
                        src={getImageUrl(businessLogo, 'business')}
                        alt={businessName}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover shadow-lg ring-2 ring-white/30"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl shadow-lg ring-2 ring-white/30">
                        🏨
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 line-clamp-1 leading-tight drop-shadow-md">{businessName}</h1>

                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
                        {/* Rating */}
                        {property.averageRating > 0 && (
                          <div className="flex items-center gap-1 text-white/90">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{property.averageRating.toFixed(1)}</span>
                          </div>
                        )}

                        {/* Seguidores */}
                        {property?.business && (
                          <div className="flex items-center gap-1 text-white/90">
                            <Users size={14} />
                            <span className="font-semibold">{businessFollowers}</span>
                            <span className="text-white/70">seguidores</span>
                          </div>
                        )}

                        {/* Ubicación */}
                        {city && (
                          <>
                            <span className="text-white/30">•</span>
                            <div className="flex items-center gap-1 text-white/90">
                              <MapPin size={13} />
                              <span>{city}{country && `, ${country}`}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lado derecho: Botones */}
                  <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                    {user && property?.business && user.id !== property.business.ownerId && (
                      <button
                        onClick={handleContactBusiness}
                        className="px-3 py-2 sm:px-4 bg-white/90 hover:bg-white text-gray-900 rounded-lg font-medium text-xs sm:text-sm flex-1 sm:flex-initial justify-center flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:shadow-xl"
                      >
                        <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Contactar</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!user) {
                          navigate('/login?redirect=/properties/' + id);
                          return;
                        }
                        // Scroll to booking section
                        document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-2 sm:px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-xs sm:text-sm flex-1 sm:flex-initial justify-center flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Calendar size={14} className="sm:w-4 sm:h-4" />
                      Reservar
                    </button>
                    {property?.business && (
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm flex-1 sm:flex-initial justify-center font-semibold transition-all shadow-lg flex items-center gap-1.5 sm:gap-2 ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'text-black hover:opacity-90'
                        } ${followLoading ? 'opacity-50' : ''}`}
                        style={!isFollowing ? { backgroundColor: '#ffb649' } : {}}
                      >
                        <Heart size={14} className={`sm:w-4 sm:h-4 ${isFollowing ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{isFollowing ? 'Dejar de seguir' : 'Seguir'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-96 bg-gray-200 rounded-b-xl flex items-center justify-center relative">
            <div className="text-center">
              <span className="text-6xl mb-2 block">🏨</span>
              <p className="text-gray-500">Sin imágenes disponibles</p>
            </div>

            {/* Info y Botones superpuestos */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 lg:p-6">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {businessLogo ? (
                    <img
                      src={getImageUrl(businessLogo, 'business')}
                      alt={businessName}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover shadow-lg ring-2 ring-white/30"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl shadow-lg ring-2 ring-white/30">
                      🏨
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 line-clamp-1 leading-tight drop-shadow-md">{businessName}</h1>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
                      {property.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-white/90">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{property.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                      {property?.business && (
                        <div className="flex items-center gap-1 text-white/90">
                          <Users size={14} />
                          <span className="font-semibold">{businessFollowers}</span>
                          <span className="text-white/70">seguidores</span>
                        </div>
                      )}
                      {city && (
                        <>
                          <span className="text-white/30">•</span>
                          <div className="flex items-center gap-1 text-white/90">
                            <MapPin size={13} />
                            <span>{city}{country && `, ${country}`}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                  {user && property?.business && user.id !== property.business.ownerId && (
                    <button
                      onClick={handleContactBusiness}
                      className="px-3 py-2 sm:px-4 bg-white/90 hover:bg-white text-gray-900 rounded-lg font-medium text-xs sm:text-sm flex-1 sm:flex-initial justify-center flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <MessageCircle size={16} />
                      Contactar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login?redirect=/properties/' + id);
                        return;
                      }
                      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-2 sm:px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-xs sm:text-sm flex-1 sm:flex-initial justify-center flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Calendar size={16} />
                    Reservar
                  </button>
                  {property?.business && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm flex-1 sm:flex-initial justify-center font-semibold transition-all shadow-lg flex items-center gap-1.5 sm:gap-2 ${
                        isFollowing
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'text-black hover:opacity-90'
                      } ${followLoading ? 'opacity-50' : ''}`}
                      style={!isFollowing ? { backgroundColor: '#ffb649' } : {}}
                    >
                      <Heart size={16} className={isFollowing ? 'fill-current' : ''} />
                      {isFollowing ? 'Dejar de seguir' : 'Seguir'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {hasRooms && (
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'rooms'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home size={18} />
                Habitaciones
              </button>
            )}
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'info'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Info size={18} />
              Información
            </button>
            <button
              onClick={() => setActiveTab('amenities')}
              className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'amenities'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles size={18} />
              Comodidades
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon size={18} />
              Galería
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'posts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Newspaper size={18} />
              Publicaciones
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* TAB: Información */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Description */}
                {description && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-3 text-gray-900">Acerca de este espacio</h3>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{description}</p>
                  </div>
                )}

                {/* Property Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Detalles de la propiedad</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="text-primary" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Huéspedes</p>
                        <p className="font-medium">Hasta {maxCapacity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bed className="text-primary" size={20} />
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
                          <Bed className="text-primary" size={20} />
                          <div>
                            <p className="text-sm text-gray-600">Camas</p>
                            <p className="font-medium">{property.beds || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bath className="text-primary" size={20} />
                          <div>
                            <p className="text-sm text-gray-600">Baños</p>
                            <p className="font-medium">{property.bathrooms || 0}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {hasRooms && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-primary" size={20} />
                        <div>
                          <p className="text-sm text-gray-600">Desde</p>
                          <p className="font-medium">S/ {minPrice}/noche</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* House Rules */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Reglas de la casa</h3>
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
            )}

            {/* TAB: Habitaciones */}
            {activeTab === 'rooms' && hasRooms && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Habitaciones disponibles</h3>
                {rooms.map((room, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
                      {room.images && room.images.length > 0 && (
                        <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                          <img
                            src={getImageUrl(room.images[0].startsWith('/uploads/') || room.images[0].startsWith('http') ? room.images[0] : `/uploads/rooms/${room.images[0]}`)}
                            alt={room.roomType}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4 sm:p-6 sm:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-xl text-gray-900 mb-1">{room.roomType}</h4>
                            {room.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{room.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold text-primary">
                                S/ {parseFloat(room.pricePerNight).toFixed(2)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">por noche</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Users size={18} className="text-gray-400" />
                            <span>Hasta {room.guestCapacity} personas</span>
                          </div>
                          {room.bedType && (
                            <div className="flex items-center gap-1.5">
                              <Bed size={18} className="text-gray-400" />
                              <span>{room.bedType}</span>
                            </div>
                          )}
                          {room.quantity > 0 && (
                            <div className="flex items-center gap-1.5 ml-auto">
                              <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                {room.quantity} disponible{room.quantity > 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Comodidades */}
            {activeTab === 'amenities' && (
              <div className="space-y-6">
                {amenities.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Comodidades disponibles</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {amenities.map(amenityId => {
                        const amenity = AMENITY_ICONS[amenityId];
                        if (!amenity) return null;
                        return (
                          <div key={amenityId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-3xl">{amenity.icon}</span>
                            <span className="font-medium">{amenity.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                    No hay comodidades disponibles
                  </div>
                )}
              </div>
            )}

            {/* TAB: Galería */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={getImageUrl(img)}
                          alt={`Galería ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                          onClick={() => setSelectedImage(index)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                    <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No hay imágenes en la galería</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Publicaciones */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                  <Newspaper size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No hay publicaciones disponibles</p>
                  <p className="text-sm mt-2">Las publicaciones del negocio aparecerán aquí</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking Flow - Always visible */}
          <div className="lg:col-span-1" id="booking-section">
            <div className="sticky top-24">
              <BookingFlow property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
