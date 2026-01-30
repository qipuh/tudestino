import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Star, Calendar, DollarSign, MessageCircle, Heart, Info, Home, Sparkles, Image as ImageIcon, Newspaper } from 'lucide-react';
import BookingFlow from '../../bookings/components/BookingFlow';
import api, { getImageUrl } from '../../../services/api';
import useAuthStore from '../../../store/authStore';
import ReelsSidebar from '../../../components/social/ReelsSidebar';
import { useSidebar } from '../../../contexts/SidebarContext';

const AMENITY_ICONS = {
  wifi: { icon: '📶', name: 'WiFi' },
  kitchen: { icon: '🍳', name: 'Cocina' },
  parking: { icon: '🅿️', name: 'Estacionamiento' },
  pool: { icon: '🏊', name: 'Piscina' },
  swimming_pool: { icon: '🏊', name: 'Piscina' },
  restaurant: { icon: '🍽️', name: 'Restaurante' },
  gym: { icon: '💪', name: 'Gimnasio' },
  ac: { icon: '❄️', name: 'Aire acondicionado' },
  heating: { icon: '🔥', name: 'Calefacción' },
  tv: { icon: '📺', name: 'TV' },
  washer: { icon: '🧺', name: 'Lavadora' },
  workspace: { icon: '💻', name: 'Espacio de trabajo' },
  balcony: { icon: '🌅', name: 'Balcón' },
  pets: { icon: '🐕', name: 'Mascotas permitidas' },
};

function PropertyDetail({ propertyIdProp }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarVisible } = useSidebar();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
  const [roomGalleryIndex, setRoomGalleryIndex] = useState(0);

  // Usar propertyIdProp si está disponible, de lo contrario usar el ID de la URL
  const id = propertyIdProp || urlId;

  // Enable sidebar when PropertyDetail mounts, disable when unmounts
  useEffect(() => {
    setSidebarVisible(true);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
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
                    {property?.business && (!user || user.id !== property.business.ownerId) && (
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
                  {property?.business && (!user || user.id !== property.business.ownerId) && (
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
                        <div
                          className="w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 relative cursor-pointer group"
                          onClick={() => setSelectedRoomDetails(room)}
                        >
                          <img
                            src={getImageUrl(room.images[0])}
                            alt={room.name || room.roomType}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                            <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                          </div>
                          {room.images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs hover:bg-opacity-90 transition flex items-center gap-1">
                              <ion-icon name="images-outline"></ion-icon>
                              {room.images.length} fotos
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 p-4 sm:p-6 sm:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-xl text-gray-900 mb-2">
                              {room.name || room.roomType}
                            </h4>

                            {/* Descripción - Más prominente */}
                            {room.description && (
                              <div className="bg-gray-50 border-l-4 border-primary p-3 rounded mb-3">
                                <p className="text-gray-800 text-sm leading-relaxed">{room.description}</p>
                              </div>
                            )}

                            {/* Vista y Plan de Comidas */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {room.view && room.view !== 'interior' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                  <ion-icon name="eye-outline" style={{ fontSize: '14px' }}></ion-icon>
                                  Vista {room.view === 'exterior' ? 'exterior' : room.view === 'garden' ? 'al jardín' : room.view === 'pool' ? 'a la piscina' : room.view === 'sea' ? 'al mar' : room.view === 'mountain' ? 'a la montaña' : room.view === 'city' ? 'a la ciudad' : room.view}
                                </span>
                              )}
                              {room.mealPlan && room.mealPlan !== 'none' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                                  <ion-icon name="restaurant-outline" style={{ fontSize: '14px' }}></ion-icon>
                                  {room.mealPlan === 'breakfast' ? 'Desayuno incluido' : room.mealPlan === 'half_board' ? 'Media pensión' : room.mealPlan === 'full_board' ? 'Pensión completa' : room.mealPlan === 'all_inclusive' ? 'Todo incluido' : room.mealPlan}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-1">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold text-primary">
                                S/ {parseFloat(room.pricePerNight).toFixed(2)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">por noche</span>
                            {room.quantity > 0 && (
                              <div className="mt-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                {room.quantity} disponible{room.quantity > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mb-3">
                          <div className="flex items-center gap-1.5">
                            <Users size={18} className="text-gray-400" />
                            <span>Hasta {room.guestCapacity} {room.guestCapacity === 1 ? 'persona' : 'personas'}</span>
                          </div>

                          {/* Configuración de camas */}
                          {room.beds && Array.isArray(room.beds) && room.beds.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Bed size={18} className="text-gray-400" />
                              <span>
                                {room.beds.map((bed, i) => {
                                  const bedLabels = {
                                    'single': 'Individual',
                                    'double': 'Doble',
                                    'queen': 'Queen',
                                    'king': 'King',
                                    'sofa_bed': 'Sofá cama',
                                    'bunk_bed': 'Litera'
                                  };
                                  return `${bed.quantity} ${bedLabels[bed.type] || bed.type}`;
                                }).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Amenidades destacadas */}
                        {room.amenities && (
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                            {(() => {
                              const allAmenities = [];
                              if (typeof room.amenities === 'object' && !Array.isArray(room.amenities)) {
                                if (room.amenities.basic) allAmenities.push(...room.amenities.basic);
                                if (room.amenities.bathroom) allAmenities.push(...room.amenities.bathroom);
                                if (room.amenities.extras) allAmenities.push(...room.amenities.extras);
                              } else if (Array.isArray(room.amenities)) {
                                allAmenities.push(...room.amenities);
                              }

                              const amenityConfig = {
                                'wifi': { icon: 'wifi-outline', label: 'WiFi' },
                                'tv': { icon: 'tv-outline', label: 'TV' },
                                'air_conditioning': { icon: 'snow-outline', label: 'A/C' },
                                'private_bathroom': { icon: 'water-outline', label: 'Baño privado' },
                                'hot_water': { icon: 'thermometer-outline', label: 'Agua caliente' },
                                'minibar': { icon: 'wine-outline', label: 'Minibar' },
                                'safe_box': { icon: 'lock-closed-outline', label: 'Caja fuerte' },
                                'balcony': { icon: 'eye-outline', label: 'Balcón' },
                                'shower': { icon: 'water-outline', label: 'Ducha' },
                                'bathtub': { icon: 'water-outline', label: 'Bañera' },
                                'towels': { icon: 'document-outline', label: 'Toallas' },
                              };

                              return allAmenities.slice(0, 6).map((amenity, i) => {
                                const config = amenityConfig[amenity] || { icon: 'checkmark-circle-outline', label: amenity };
                                return (
                                  <span key={i} className="px-2 py-1 bg-gray-100 rounded flex items-center gap-1">
                                    <ion-icon name={config.icon} style={{ fontSize: '14px' }}></ion-icon>
                                    {config.label}
                                  </span>
                                );
                              });
                            })()}
                            {(() => {
                              const allAmenities = [];
                              if (typeof room.amenities === 'object' && !Array.isArray(room.amenities)) {
                                if (room.amenities.basic) allAmenities.push(...room.amenities.basic);
                                if (room.amenities.bathroom) allAmenities.push(...room.amenities.bathroom);
                                if (room.amenities.extras) allAmenities.push(...room.amenities.extras);
                              }
                              return allAmenities.length > 6 ? (
                                <button
                                  onClick={() => setSelectedRoomDetails(room)}
                                  className="px-2 py-1 text-primary font-medium hover:bg-primary hover:text-white rounded transition flex items-center gap-1"
                                >
                                  <ion-icon name="add-circle-outline"></ion-icon>
                                  {allAmenities.length - 6} más
                                </button>
                              ) : null;
                            })()}
                          </div>
                        )}
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

      {/* Modal Integrada de Detalles de Habitación */}
      {selectedRoomDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedRoomDetails(null)}>
          <div className="relative bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header con cerrar */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-900">{selectedRoomDetails.name || selectedRoomDetails.roomType}</h2>
              <button
                onClick={() => setSelectedRoomDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition p-2"
              >
                <ion-icon name="close-circle-outline" style={{ fontSize: '32px' }}></ion-icon>
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto">
              {/* Galería de Imágenes */}
              {selectedRoomDetails.images && selectedRoomDetails.images.length > 0 && (
                <div className="relative">
                  <img
                    src={getImageUrl(selectedRoomDetails.images[roomGalleryIndex])}
                    alt={`${selectedRoomDetails.name || selectedRoomDetails.roomType} - Imagen ${roomGalleryIndex + 1}`}
                    className="w-full h-96 object-cover"
                  />
                  {selectedRoomDetails.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setRoomGalleryIndex((roomGalleryIndex - 1 + selectedRoomDetails.images.length) % selectedRoomDetails.images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition"
                      >
                        <ion-icon name="chevron-back-outline" style={{ fontSize: '24px' }}></ion-icon>
                      </button>
                      <button
                        onClick={() => setRoomGalleryIndex((roomGalleryIndex + 1) % selectedRoomDetails.images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition"
                      >
                        <ion-icon name="chevron-forward-outline" style={{ fontSize: '24px' }}></ion-icon>
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                        {roomGalleryIndex + 1} / {selectedRoomDetails.images.length}
                      </div>
                    </>
                  )}
                  {/* Precio destacado sobre la imagen */}
                  <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="text-3xl font-bold">S/ {parseFloat(selectedRoomDetails.pricePerNight).toFixed(2)}</div>
                    <div className="text-xs opacity-90">por noche</div>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Descripción */}
                {selectedRoomDetails.description && (
                  <div>
                    <p className="text-gray-700 text-base leading-relaxed">{selectedRoomDetails.description}</p>
                  </div>
                )}

                {/* Información Principal */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <ion-icon name="people-outline" style={{ fontSize: '28px', color: '#3b82f6' }}></ion-icon>
                    <div>
                      <div className="text-sm text-gray-600">Capacidad</div>
                      <div className="font-semibold text-gray-900">{selectedRoomDetails.guestCapacity} personas</div>
                    </div>
                  </div>

                  {selectedRoomDetails.quantity > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <ion-icon name="home-outline" style={{ fontSize: '28px', color: '#10b981' }}></ion-icon>
                      <div>
                        <div className="text-sm text-gray-600">Disponibles</div>
                        <div className="font-semibold text-gray-900">{selectedRoomDetails.quantity} habitaciones</div>
                      </div>
                    </div>
                  )}

                  {selectedRoomDetails.view && selectedRoomDetails.view !== 'interior' && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                      <ion-icon name="eye-outline" style={{ fontSize: '28px', color: '#8b5cf6' }}></ion-icon>
                      <div>
                        <div className="text-sm text-gray-600">Vista</div>
                        <div className="font-semibold text-gray-900 capitalize">{selectedRoomDetails.view === 'exterior' ? 'Exterior' : selectedRoomDetails.view === 'garden' ? 'Jardín' : selectedRoomDetails.view === 'pool' ? 'Piscina' : selectedRoomDetails.view === 'sea' ? 'Mar' : selectedRoomDetails.view === 'mountain' ? 'Montaña' : selectedRoomDetails.view === 'city' ? 'Ciudad' : selectedRoomDetails.view}</div>
                      </div>
                    </div>
                  )}

                  {selectedRoomDetails.mealPlan && selectedRoomDetails.mealPlan !== 'none' && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                      <ion-icon name="restaurant-outline" style={{ fontSize: '28px', color: '#f97316' }}></ion-icon>
                      <div>
                        <div className="text-sm text-gray-600">Comidas</div>
                        <div className="font-semibold text-gray-900">{selectedRoomDetails.mealPlan === 'breakfast' ? 'Desayuno' : selectedRoomDetails.mealPlan === 'half_board' ? 'Media pensión' : selectedRoomDetails.mealPlan === 'full_board' ? 'Pensión completa' : selectedRoomDetails.mealPlan === 'all_inclusive' ? 'Todo incluido' : selectedRoomDetails.mealPlan}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Configuración de Camas */}
                {selectedRoomDetails.beds && Array.isArray(selectedRoomDetails.beds) && selectedRoomDetails.beds.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <ion-icon name="bed-outline" style={{ fontSize: '24px' }}></ion-icon>
                      Configuración de Camas
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedRoomDetails.beds.map((bed, i) => {
                        const bedLabels = {
                          'single': 'Individual',
                          'double': 'Doble',
                          'queen': 'Queen',
                          'king': 'King',
                          'sofa_bed': 'Sofá cama',
                          'bunk_bed': 'Litera'
                        };
                        return (
                          <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <ion-icon name="bed-outline" style={{ fontSize: '24px', color: '#6b7280' }}></ion-icon>
                            <span className="text-gray-900">{bed.quantity} {bedLabels[bed.type] || bed.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Amenidades */}
                {selectedRoomDetails.amenities && (
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <ion-icon name="checkmark-circle-outline" style={{ fontSize: '24px' }}></ion-icon>
                      Amenidades
                    </h3>
                    {(() => {
                      const amenities = selectedRoomDetails.amenities || {};
                      const amenityConfig = {
                        'wifi': { icon: 'wifi-outline', label: 'WiFi gratis' },
                        'tv': { icon: 'tv-outline', label: 'Televisión' },
                        'air_conditioning': { icon: 'snow-outline', label: 'Aire acondicionado' },
                        'heating': { icon: 'flame-outline', label: 'Calefacción' },
                        'fan': { icon: 'refresh-outline', label: 'Ventilador' },
                        'desk': { icon: 'laptop-outline', label: 'Escritorio' },
                        'safe_box': { icon: 'lock-closed-outline', label: 'Caja fuerte' },
                        'minibar': { icon: 'wine-outline', label: 'Minibar' },
                        'coffee_maker': { icon: 'cafe-outline', label: 'Cafetera' },
                        'iron': { icon: 'shirt-outline', label: 'Plancha' },
                        'hairdryer': { icon: 'cut-outline', label: 'Secador de pelo' },
                        'private_bathroom': { icon: 'water-outline', label: 'Baño privado' },
                        'shared_bathroom': { icon: 'people-outline', label: 'Baño compartido' },
                        'hot_water': { icon: 'thermometer-outline', label: 'Agua caliente 24h' },
                        'shower': { icon: 'water-outline', label: 'Ducha' },
                        'bathtub': { icon: 'water-outline', label: 'Bañera' },
                        'towels': { icon: 'document-outline', label: 'Toallas' },
                        'toiletries': { icon: 'medical-outline', label: 'Artículos de aseo' },
                        'balcony': { icon: 'eye-outline', label: 'Balcón' },
                        'terrace': { icon: 'home-outline', label: 'Terraza' },
                        'soundproofing': { icon: 'volume-mute-outline', label: 'Insonorización' },
                      };

                      return (
                        <div className="space-y-4">
                          {amenities.basic && amenities.basic.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Básicas</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {amenities.basic.map((amenity, i) => {
                                  const config = amenityConfig[amenity] || { icon: 'checkmark-circle-outline', label: amenity };
                                  return (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                      <ion-icon name={config.icon} style={{ fontSize: '20px', color: '#6b7280' }}></ion-icon>
                                      <span className="text-sm text-gray-700">{config.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {amenities.bathroom && amenities.bathroom.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Baño</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {amenities.bathroom.map((amenity, i) => {
                                  const config = amenityConfig[amenity] || { icon: 'checkmark-circle-outline', label: amenity };
                                  return (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                      <ion-icon name={config.icon} style={{ fontSize: '20px', color: '#3b82f6' }}></ion-icon>
                                      <span className="text-sm text-gray-700">{config.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {amenities.extras && amenities.extras.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Extras</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {amenities.extras.map((amenity, i) => {
                                  const config = amenityConfig[amenity] || { icon: 'checkmark-circle-outline', label: amenity };
                                  return (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                      <ion-icon name={config.icon} style={{ fontSize: '20px', color: '#10b981' }}></ion-icon>
                                      <span className="text-sm text-gray-700">{config.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reels Sidebar */}
      <ReelsSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
    </div>
  );
}

export default PropertyDetail;
