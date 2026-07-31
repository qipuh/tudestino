import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useBusiness from '../hooks/useBusiness';
import useAuthStore from '../../../store/authStore';
import { MapPin, Star, Clock, Phone, Mail, Globe, ChevronLeft, ArrowLeft, MessageCircle, Calendar, Users, Heart, Grid, FileText, UtensilsCrossed, Info, Image as ImageIcon, Newspaper, Home, Bed, Route, DollarSign } from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';
import ReservationModal from '../components/ReservationModal';
import BookingFlow from '../../bookings/components/BookingFlow';
import ReelsSidebar from '../../../components/social/ReelsSidebar';
import { useSidebar } from '../../../contexts/SidebarContext';
import useVerification from '../../../hooks/useVerification';

const businessTypeIcons = {
  hotel: '🏨',
  restaurant: '🍽️',
  entertainment: '🎭',
  events: '🎉',
  tours: '🗺️',
  transport: '🚗',
  spa: '💆',
  other: '🏢',
};

const MENU_CATEGORIES = {
  restaurant: {
    appetizers: { label: 'Entradas', icon: '🥗' },
    main_courses: { label: 'Platos Principales', icon: '🍽️' },
    desserts: { label: 'Postres', icon: '🍰' },
    beverages: { label: 'Bebidas', icon: '🥤' },
    alcoholic: { label: 'Bebidas Alcohólicas', icon: '🍷' },
    breakfast: { label: 'Desayunos', icon: '🍳' },
    specials: { label: 'Especialidades', icon: '⭐' },
  },
  entertainment: {
    drinks: { label: 'Bebidas', icon: '🍹' },
    cocktails: { label: 'Cócteles', icon: '🍸' },
    beer: { label: 'Cervezas', icon: '🍺' },
    wine: { label: 'Vinos', icon: '🍷' },
    spirits: { label: 'Licores', icon: '🥃' },
    snacks: { label: 'Bocadillos', icon: '🍿' },
    packages: { label: 'Paquetes/Combos', icon: '🎉' },
    specials: { label: 'Especialidades', icon: '⭐' },
  }
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending_verification: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-600',
};

const statusLabels = {
  active: 'Activo',
  pending_verification: 'Verificación pendiente',
  draft: 'Borrador',
  suspended: 'Suspendido',
  inactive: 'Inactivo',
};

const businessTypeLabels = {
  hotel: 'Hotel',
  restaurant: 'Restaurante',
  entertainment: 'Entretenimiento',
  events: 'Eventos',
  tours: 'Tours',
  transport: 'Transporte',
  spa: 'Spa',
  other: 'Otro',
};

function BusinessDetail({ businessIdProp }) {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isVerified, status, loading: verificationLoading } = useVerification();
  const { sidebarOpen, toggleSidebar, setSidebarVisible } = useSidebar();
  const { business, loading, error, fetchBusiness, deleteBusiness } = useBusiness();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [spaServices, setSpaServices] = useState([]);
  const [loadingSpaServices, setLoadingSpaServices] = useState(false);
  const [showSpaGallery, setShowSpaGallery] = useState(false);
  const [currentSpaService, setCurrentSpaService] = useState(null);
  const [spaGalleryPhotos, setSpaGalleryPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // Default to info tab
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [tours, setTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(false);

  // Usar businessIdProp si está disponible, de lo contrario usar el ID de la URL
  const id = businessIdProp || urlId;

  // Verificar si el usuario actual es el dueño del negocio
  const isOwner = business && user && business.ownerId === user.id;

  // Enable sidebar on public view, disable on owner view
  useEffect(() => {
    setSidebarVisible(!isOwner);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible, isOwner]);

  useEffect(() => {
    if (id) {
      loadBusiness();
    }
  }, [id]);

  useEffect(() => {
    if (business) {
      // Set default tab based on business type
      if (business.businessType === 'restaurant' || business.businessType === 'entertainment') {
        setActiveTab('menu');
        loadMenu();
      } else if (business.businessType === 'hotel') {
        loadProperty();
      } else if (business.businessType === 'spa') {
        setActiveTab('spa-services');
        loadSpaServices();
      } else if (business.businessType === 'tours') {
        setActiveTab('tours');
        loadTours();
      } else {
        setActiveTab('info');
      }
      loadPhotos();
      if (user) {
        checkFollowStatus();
      }
    }
  }, [business, user]);

  const loadBusiness = async () => {
    await fetchBusiness(id);
  };

  const loadMenu = async () => {
    try {
      setLoadingMenu(true);
      const response = await api.get(`/businesses/${id}/menu`);
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error loading menu:', error);
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  const loadSpaServices = async () => {
    try {
      setLoadingSpaServices(true);
      const response = await api.get(`/businesses/${id}/spa-services`);
      setSpaServices(response.data || []);
    } catch (error) {
      console.error('Error loading spa services:', error);
      setSpaServices([]);
    } finally {
      setLoadingSpaServices(false);
    }
  };

  const loadTours = async () => {
    try {
      setLoadingTours(true);
      const response = await api.get(`/businesses/${id}/tours`);
      setTours(response.data || []);
    } catch (error) {
      console.error('Error loading tours:', error);
      setTours([]);
    } finally {
      setLoadingTours(false);
    }
  };

  const handleOpenSpaGallery = async (service) => {
    setCurrentSpaService(service);
    setShowSpaGallery(true);
    try {
      const response = await api.get(`/businesses/${id}/spa-services/${service.id}/photos`);
      setSpaGalleryPhotos(response.data || []);
    } catch (error) {
      console.error('Error loading spa gallery:', error);
      setSpaGalleryPhotos([]);
    }
  };

  const loadProperty = async () => {
    try {
      setLoadingProperty(true);
      // Buscar la propiedad asociada al negocio
      const response = await api.get(`/businesses/${id}/properties`);

      if (response.data) {
        const propertyData = response.data;
        setProperty(propertyData);
        setRooms(propertyData.rooms || []);

        // Si hay habitaciones, mostrar ese tab por defecto
        if (propertyData.rooms && propertyData.rooms.length > 0) {
          setActiveTab('rooms');
        }
      }
    } catch (error) {
      // 404 es esperado cuando el negocio no tiene propiedades configuradas
      if (error.response?.status !== 404) {
        console.error('Error loading property:', error);
      }
      setProperty(null);
      setRooms([]);
    } finally {
      setLoadingProperty(false);
    }
  };

  const loadPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const response = await api.get(`/businesses/${id}/photos`);
      setPhotos(response.data.data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await api.get(`/businesses/${id}/following`);
      setIsFollowing(response.data.data?.isFollowing || false);
    } catch (error) {
      console.error('Error checking follow status:', error);
      setIsFollowing(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login?redirect=/businesses/' + id);
      return;
    }

    try {
      setFollowLoading(true);

      if (isFollowing) {
        console.log('🔄 Dejando de seguir negocio:', id);
        const response = await api.delete(`/businesses/${id}/follow`);
        console.log('✅ Response unfollow:', response);
        setIsFollowing(false);
      } else {
        console.log('🔄 Siguiendo negocio:', id);
        const response = await api.post(`/businesses/${id}/follow`);
        console.log('✅ Response follow:', response);
        setIsFollowing(true);
      }

      await loadBusiness();
    } catch (error) {
      console.error('❌ Error toggling follow:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Error al actualizar seguimiento';
      alert(errorMsg);
      // Restaurar el estado anterior en caso de error
      await checkFollowStatus();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await deleteBusiness(id);
    if (result.success) {
      navigate('/account/businesses');
    }
  };

  const handleContactBusiness = () => {
    if (!user) {
      navigate('/login?redirect=/business/' + id);
      return;
    }
    if (business?.ownerId === user.id) {
      alert('No puedes contactarte a ti mismo');
      return;
    }
    // Check verification status
    if (!verificationLoading && !isVerified && status !== 'verified') {
      alert('Debes verificar tu identidad para contactar negocios. Serás redirigido a la página de verificación.');
      navigate('/verify-identity');
      return;
    }
    navigate(`/messages?user=${business.ownerId}`);
  };

  // Si es el dueño, redirigir al panel de gestión
  useEffect(() => {
    if (isOwner && business && !businessIdProp) {
      navigate(`/business/${business.id}/manage`, { replace: true });
    }
  }, [isOwner, business, businessIdProp, navigate]);

  if (loading && !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando negocio...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar negocio</h2>
          <p className="text-gray-600 mb-6">{error || 'Negocio no encontrado'}</p>
          <Link
            to="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  // Obtener imágenes del negocio
  let images = [];

  // Primero la imagen de portada si existe
  if (business.coverImage) {
    images.push({ url: business.coverImage, isCover: true });
  }

  // Luego las fotos de la galería
  if (photos && photos.length > 0) {
    images = [...images, ...photos.map(photo => ({ url: photo.url, id: photo.id }))];
  }

  // Si no hay fotos, agregar el logo
  if (images.length === 0 && business.logo) {
    images.push({ url: business.logo });
  }

  // Vista pública (para clientes)
  if (!isOwner) {
    return (
      <div className="min-h-screen">
        {/* Images Gallery */}
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {images.length > 0 ? (
            <>
              {/* Cover Image - Full Width */}
              {images[selectedImage].isCover ? (
                <div className="w-full h-[500px] bg-gray-200 rounded-b-xl overflow-hidden relative mb-4">
                  <img
                    src={getImageUrl(images[selectedImage].url, 'business')}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Info y Botones superpuestos - Diseño Premium */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                      {/* Lado izquierdo: Logo, nombre, seguidores, ubicación */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {business.logo ? (
                          <img
                            src={getImageUrl(business.logo, 'business')}
                            alt={business.name}
                            className="w-14 h-14 rounded-2xl object-cover shadow-lg ring-2 ring-white/30"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/30">
                            {businessTypeIcons[business.businessType]}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h1 className="text-xl font-bold text-white mb-1 truncate leading-tight drop-shadow-md">{business.name}</h1>

                          <div className="flex items-center gap-3 flex-wrap text-sm">
                            {/* Rating */}
                            {business.averageRating > 0 && (
                              <div className="flex items-center gap-1 text-white/90">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{business.averageRating.toFixed(1)}</span>
                              </div>
                            )}

                            {/* Seguidores */}
                            <div className="flex items-center gap-1 text-white/90">
                              <Users size={14} />
                              <span className="font-semibold">{business.followersCount || 0}</span>
                              <span className="text-white/70">seguidores</span>
                            </div>

                            {/* Ubicación */}
                            {business.address?.city && (
                              <>
                                <span className="text-white/30">•</span>
                                <div className="flex items-center gap-1 text-white/90">
                                  <MapPin size={13} />
                                  <span>{business.address.city}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Lado derecho: Botones */}
                      <div className="flex items-center gap-2">
                        {user && user.id !== business.ownerId && (
                          <button
                            onClick={handleContactBusiness}
                            className="px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                          >
                            <MessageCircle size={16} />
                            Contactar
                          </button>
                        )}
                        {business.businessType === 'hotel' && property ? (
                          <button
                            onClick={() => {
                              if (!user) {
                                navigate('/login?redirect=/businesses/' + id);
                                return;
                              }
                              document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                          >
                            <Calendar size={16} />
                            Reservar
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (!user) {
                                navigate('/login?redirect=/businesses/' + id);
                                return;
                              }
                              setShowReservationModal(true);
                            }}
                            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                          >
                            <Calendar size={16} />
                            Reservar
                          </button>
                        )}
                        <button
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg flex items-center gap-2 ${
                            isFollowing
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'text-black hover:opacity-90'
                          } ${followLoading ? 'opacity-50' : ''}`}
                          style={!isFollowing ? { backgroundColor: '#ffb649' } : {}}
                        >
                          {isFollowing ? (
                            <MessageCircle size={16} />
                          ) : (
                            <Heart size={16} />
                          )}
                          {isFollowing ? 'Siguiendo' : 'Seguir'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular Gallery Grid */
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
                    <div className="md:col-span-1 h-96 bg-gray-200 relative">
                      <img
                        src={getImageUrl(images[selectedImage].url, 'business')}
                        alt={business.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(0)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {images.slice(1, 5).map((img, index) => (
                        <div
                          key={img.id || index}
                          className="h-48 bg-gray-200 cursor-pointer relative"
                          onClick={() => setSelectedImage(index + 1)}
                        >
                          <img
                            src={getImageUrl(img.url, 'business')}
                            alt={`${business.name} ${index + 2}`}
                            className="w-full h-full object-cover hover:opacity-90 transition"
                          />
                        </div>
                      ))}
                      {images.length > 5 && (
                        <div className="h-48 bg-gray-900 bg-opacity-70 flex items-center justify-center text-white text-xl font-bold cursor-pointer">
                          +{images.length - 5} más
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info y Botones superpuestos */}
                  <div className="absolute bottom-4 left-0 right-0 px-4">
                    <div className="bg-black/50 backdrop-blur-sm p-4 rounded-xl">
                      <div className="flex items-center justify-between gap-4">
                        {/* Lado izquierdo: Logo, nombre, seguidores, ubicación */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {business.logo ? (
                            <img
                              src={getImageUrl(business.logo, 'business')}
                              alt={business.name}
                              className="w-12 h-12 rounded-xl object-cover shadow-lg ring-2 ring-white/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl shadow-lg ring-2 ring-white/30">
                              {businessTypeIcons[business.businessType]}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-white mb-0.5 truncate leading-tight drop-shadow-md">{business.name}</h1>

                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              {business.averageRating > 0 && (
                                <div className="flex items-center gap-1 text-white/90">
                                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{business.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-white/90">
                                <Users size={12} />
                                <span className="font-semibold">{business.followersCount || 0}</span>
                              </div>
                              {business.address?.city && (
                                <>
                                  <span className="text-white/30">•</span>
                                  <div className="flex items-center gap-1 text-white/90">
                                    <MapPin size={11} />
                                    <span>{business.address.city}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lado derecho: Botones */}
                        <div className="flex items-center gap-2">
                          {user && user.id !== business.ownerId && (
                            <button
                              onClick={handleContactBusiness}
                              className="px-3 py-1.5 bg-white/90 hover:bg-white text-gray-900 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all shadow-lg"
                            >
                              <MessageCircle size={14} />
                              Contactar
                            </button>
                          )}
                          {business.businessType === 'hotel' && property ? (
                            <button
                              onClick={() => {
                                if (!user) {
                                  navigate('/login?redirect=/businesses/' + id);
                                  return;
                                }
                                // Scroll to booking section
                                document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow-lg"
                            >
                              <Calendar size={14} />
                              Reservar
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (!user) {
                                  navigate('/login?redirect=/businesses/' + id);
                                  return;
                                }
                                setShowReservationModal(true);
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow-lg"
                            >
                              <Calendar size={14} />
                              Reservar
                            </button>
                          )}
                          <button
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-lg flex items-center gap-1.5 ${
                              isFollowing
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'text-black hover:opacity-90'
                            } ${followLoading ? 'opacity-50' : ''}`}
                            style={!isFollowing ? { backgroundColor: '#ffb649' } : {}}
                          >
                            {isFollowing ? (
                              <MessageCircle size={14} />
                            ) : (
                              <Heart size={14} />
                            )}
                            {isFollowing ? 'Siguiendo' : 'Seguir'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thumbnail Navigation */}
              {images.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <div
                      key={img.id || index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                        selectedImage === index ? 'border-primary' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(img.url, 'business')}
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center relative">
              <div className="text-center">
                <span className="text-6xl mb-2 block">
                  {businessTypeIcons[business.businessType] || businessTypeIcons.other}
                </span>
              <p className="text-gray-500">Sin imágenes disponibles</p>
              </div>

              {/* Info y Botones superpuestos */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                  {/* Lado izquierdo: Logo, nombre, seguidores, ubicación */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {business.logo ? (
                      <img
                        src={getImageUrl(business.logo, 'business')}
                        alt={business.name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-lg ring-2 ring-white/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/30">
                        {businessTypeIcons[business.businessType]}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-bold text-white mb-1 truncate leading-tight drop-shadow-md">{business.name}</h1>

                      <div className="flex items-center gap-3 flex-wrap text-sm">
                        {business.averageRating > 0 && (
                          <div className="flex items-center gap-1 text-white/90">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{business.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-white/90">
                          <Users size={14} />
                          <span className="font-semibold">{business.followersCount || 0}</span>
                          <span className="text-white/70">seguidores</span>
                        </div>
                        {business.address?.city && (
                          <>
                            <span className="text-white/30">•</span>
                            <div className="flex items-center gap-1 text-white/90">
                              <MapPin size={13} />
                              <span>{business.address.city}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lado derecho: Botones */}
                  <div className="flex items-center gap-2">
                    {user && user.id !== business.ownerId && (
                      <button
                        onClick={handleContactBusiness}
                        className="px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                      >
                        <MessageCircle size={16} />
                        Contactar
                      </button>
                    )}
                    {business.businessType === 'hotel' && property ? (
                      <button
                        onClick={() => {
                          if (!user) {
                            navigate('/login?redirect=/businesses/' + id);
                            return;
                          }
                          document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                      >
                        <Calendar size={16} />
                        Reservar
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!user) {
                            navigate('/login?redirect=/businesses/' + id);
                            return;
                          }
                          setShowReservationModal(true);
                        }}
                        className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                      >
                        <Calendar size={16} />
                        Reservar
                      </button>
                    )}
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg flex items-center gap-2 ${
                        isFollowing
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'text-black hover:opacity-90'
                      } ${followLoading ? 'opacity-50' : ''}`}
                      style={!isFollowing ? { backgroundColor: '#ffb649' } : {}}
                    >
                      {isFollowing ? (
                        <MessageCircle size={16} />
                      ) : (
                        <Heart size={16} />
                      )}
                      {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-1">
              {business.businessType === 'hotel' && rooms.length > 0 && (
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                    activeTab === 'rooms'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home size={18} />
                  Habitaciones
                </button>
              )}
              {(business.businessType === 'restaurant' || business.businessType === 'entertainment') && (
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                    activeTab === 'menu'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UtensilsCrossed size={18} />
                  {business.businessType === 'entertainment' ? 'Carta' : 'Menú'}
                </button>
              )}
              {business.businessType === 'spa' && (
                <button
                  onClick={() => setActiveTab('spa-services')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                    activeTab === 'spa-services'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💆 Servicios
                </button>
              )}
              {business.businessType === 'tours' && (
                <button
                  onClick={() => setActiveTab('tours')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                    activeTab === 'tours'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Route size={18} />
                  Tours Disponibles
                </button>
              )}
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'info'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Info size={18} />
                Información
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
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
                className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
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
          <div className={business.businessType === 'hotel' && property ? 'grid grid-cols-1 lg:grid-cols-3 gap-8' : ''}>
            <div className={business.businessType === 'hotel' && property ? 'lg:col-span-2' : ''}>

          {/* TAB: Habitaciones (Solo para hoteles) */}
          {activeTab === 'rooms' && business.businessType === 'hotel' && rooms.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Habitaciones disponibles</h3>
              {rooms.map((room, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
                    {room.images && room.images.length > 0 && (
                      <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                        <img
                          src={getImageUrl(room.images[0])}
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

          {/* TAB: Información */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Descripción */}
              {business.description && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-900">Acerca de</h3>
                  <p className="text-gray-700 leading-relaxed">{business.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {businessTypeLabels[business.businessType]}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contacto */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Phone size={20} className="text-primary" />
                  Contacto
                </h3>
                <div className="space-y-3">
                  {business.contactPhone && (
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <a href={`tel:${business.contactPhone}`} className="font-medium text-gray-900 hover:text-primary">
                        {business.contactPhone}
                      </a>
                    </div>
                  )}
                  {business.contactEmail && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href={`mailto:${business.contactEmail}`} className="font-medium text-gray-900 hover:text-primary">
                        {business.contactEmail}
                      </a>
                    </div>
                  )}
                  {business.website && (
                    <div>
                      <p className="text-sm text-gray-600">Sitio Web</p>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-primary"
                      >
                        {business.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Redes Sociales */}
                {(business.socialMedia || business.socialMediaLinks) && Object.values(business.socialMedia || business.socialMediaLinks).some(v => v) && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700">Redes Sociales</h4>
                    <div className="flex gap-3">
                      {(business.socialMedia?.facebook || business.socialMediaLinks?.facebook) && (
                        <a href={business.socialMedia?.facebook || business.socialMediaLinks?.facebook} target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition">
                          📘
                        </a>
                      )}
                      {(business.socialMedia?.instagram || business.socialMediaLinks?.instagram) && (
                        <a href={business.socialMedia?.instagram || business.socialMediaLinks?.instagram} target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition">
                          📷
                        </a>
                      )}
                      {(business.socialMedia?.twitter || business.socialMediaLinks?.twitter) && (
                        <a href={business.socialMedia?.twitter || business.socialMediaLinks?.twitter} target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition">
                          🐦
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Horarios */}
              {business.operatingHours && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    Horarios de Atención
                  </h3>
                  <div className="space-y-2">
                    {[
                      { key: 'monday', label: 'Lunes' },
                      { key: 'tuesday', label: 'Martes' },
                      { key: 'wednesday', label: 'Miércoles' },
                      { key: 'thursday', label: 'Jueves' },
                      { key: 'friday', label: 'Viernes' },
                      { key: 'saturday', label: 'Sábado' },
                      { key: 'sunday', label: 'Domingo' },
                    ].map(day => {
                      const dayData = business.operatingHours[day.key];
                      if (!dayData) return null;

                      return (
                        <div key={day.key} className="flex items-center justify-between py-2 border-gray-100 last:border-0">
                          <span className="font-medium text-gray-900">{day.label}</span>
                          {dayData.closed ? (
                            <span className="text-gray-500 text-sm italic">Cerrado</span>
                          ) : (
                            <span className="text-gray-700 text-sm">
                              {dayData.open} - {dayData.close}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ubicación con Mapa */}
              {business.address && (
                <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-primary" />
                    Ubicación
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      {business.address.street && (
                        <p className="text-gray-700">{business.address.street}</p>
                      )}
                      <p className="text-gray-700">
                        {business.address.city}
                        {business.address.state && `, ${business.address.state}`}
                      </p>
                      <p className="text-gray-700">{business.address.country || 'Perú'}</p>
                      {business.address.zipCode && (
                        <p className="text-gray-600 text-sm mt-2">CP: {business.address.zipCode}</p>
                      )}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                      {business.address.latitude && business.address.longitude ? (
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps?q=${business.address.latitude},${business.address.longitude}&z=15&output=embed`}
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <MapPin size={32} className="mx-auto mb-2" />
                            <p className="text-sm">Mapa no disponible</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          {/* TAB: Menú (Solo para restaurantes) */}
          {activeTab === 'menu' && (business.businessType === 'restaurant' || business.businessType === 'entertainment') && (
            <div>
              {loadingMenu ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando menú...</p>
                </div>
              ) : menuItems.length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(MENU_CATEGORIES).map(([categoryKey, category]) => {
                    const categoryItems = menuItems.filter(
                      item => item.category === categoryKey && item.isAvailable
                    );

                    if (categoryItems.length === 0) return null;

                    return (
                      <div key={categoryKey}>
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 border-b pb-3">
                          <span className="text-3xl">{category.icon}</span>
                          {category.label}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {categoryItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                              {item.image && (
                                <div className="h-48 overflow-hidden bg-gray-100">
                                  <img
                                    src={getImageUrl(item.image, 'menu')}
                                    alt={item.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-lg text-gray-900 flex-1">
                                    {item.name}
                                    {item.isSpecial && (
                                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                        ⭐ Especial
                                      </span>
                                    )}
                                  </h4>
                                  <span className="text-xl font-bold text-primary whitespace-nowrap ml-3">
                                    S/ {parseFloat(item.price).toFixed(2)}
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-gray-600">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
                  <span className="text-6xl mb-4 block">🍽️</span>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Menú no disponible</h3>
                  <p className="text-gray-600">Este restaurante aún no ha agregado su menú.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Servicios de Spa */}
          {activeTab === 'spa-services' && business.businessType === 'spa' && (
            <div>
              {loadingSpaServices ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando servicios...</p>
                </div>
              ) : spaServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spaServices.filter(service => service.isAvailable).map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
                    >
                      {service.image ? (
                        <img
                          src={getImageUrl(service.image, 'spa-services')}
                          alt={service.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-purple-100 flex items-center justify-center">
                          <span className="text-6xl">💆</span>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-900 mb-2">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          {service.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock size={16} />
                              <span>{service.duration} min</span>
                            </div>
                          )}
                          <div className="text-2xl font-bold text-primary">
                            S/ {parseFloat(service.price).toFixed(2)}
                          </div>
                        </div>
                        {service.photoCount > 0 && (
                          <button
                            onClick={() => handleOpenSpaGallery(service)}
                            className="w-full mb-3 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium flex items-center justify-center gap-2"
                          >
                            <ImageIcon size={16} />
                            Ver galería ({service.photoCount} foto{service.photoCount !== 1 ? 's' : ''})
                          </button>
                        )}
                        {user && (
                          <button
                            onClick={() => setShowReservationModal(true)}
                            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
                          >
                            Reservar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
                  <span className="text-6xl mb-4 block">💆</span>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Servicios no disponibles</h3>
                  <p className="text-gray-600">Este negocio aún no ha agregado sus servicios.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Tours */}
          {activeTab === 'tours' && business.businessType === 'tours' && (
            <div>
              {loadingTours ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando tours...</p>
                </div>
              ) : tours.length > 0 ? (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Tours Disponibles</h3>
                    <p className="text-gray-600">Descubre nuestras experiencias turísticas</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tours.map((tour) => (
                      <Link
                        key={tour.id}
                        to={`/tours/${tour.id}`}
                        className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all bg-white"
                      >
                        {/* Tour Image */}
                        {tour.gallery && tour.gallery.length > 0 ? (
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={getImageUrl(tour.gallery[0], 'tours')}
                              alt={tour.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {/* Duration Badge */}
                            {tour.durationDays && (
                              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                                  <Calendar size={14} />
                                  <span>{tour.durationDays}D/{tour.durationNights || tour.durationDays - 1}N</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-56 bg-blue-100 flex items-center justify-center">
                            <span className="text-7xl">🗺️</span>
                          </div>
                        )}

                        {/* Tour Info */}
                        <div className="p-5">
                          <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-primary transition line-clamp-1">
                            {tour.name}
                          </h3>

                          {/* Location */}
                          {tour.mainDestination && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                              <MapPin size={14} />
                              <span>{tour.mainDestination}</span>
                            </div>
                          )}

                          {/* Description */}
                          {tour.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {tour.description}
                            </p>
                          )}

                          {/* Tour Details */}
                          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-500">
                            {tour.maxGroupSize && (
                              <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>Hasta {tour.maxGroupSize} pax</span>
                              </div>
                            )}
                            {tour.difficulty && (
                              <div className="flex items-center gap-1">
                                <Star size={14} />
                                <span>{tour.difficulty}</span>
                              </div>
                            )}
                          </div>

                          {/* Price & CTA */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                              <p className="text-xs text-gray-500">Desde</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-primary">
                                  {tour.priceCurrency || tour.currency} {tour.basePricePerPerson}
                                </span>
                                <span className="text-xs text-gray-500">/ persona</span>
                              </div>
                            </div>
                            <div className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm group-hover:bg-primary-dark transition">
                              Ver detalles
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
                  <span className="text-6xl mb-4 block">🗺️</span>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Tours no disponibles</h3>
                  <p className="text-gray-600">Este negocio aún no ha agregado tours.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Galería */}
          {activeTab === 'gallery' && (
            <div>
              {loadingPhotos ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando galería...</p>
                </div>
              ) : photos && photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-lg overflow-hidden hover:shadow-xl transition cursor-pointer bg-gray-100 group relative"
                    >
                      <img
                        src={getImageUrl(photo.url, 'business')}
                        alt={photo.caption || business.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        title={photo.caption}
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
                  <span className="text-6xl mb-4 block">📸</span>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin fotos</h3>
                  <p className="text-gray-600">Este negocio aún no ha agregado fotos a su galería.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Publicaciones */}
          {activeTab === 'posts' && (
            <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
              <span className="text-6xl mb-4 block">📱</span>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Publicaciones próximamente</h3>
              <p className="text-gray-600">
                Las publicaciones del negocio aparecerán aquí pronto.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>📊</span>
                <span>{business.postsCount || 0} publicaciones totales</span>
              </div>
            </div>
          )}

            </div>

            {/* Booking Flow Sidebar - Solo para hoteles con propiedad */}
            {business.businessType === 'hotel' && property && (
              <div className="lg:col-span-1">
                <div className="sticky top-24" id="booking-section">
                  <BookingFlow property={property} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reservation Modal */}
        <ReservationModal
          business={business}
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          onSuccess={(reservation) => {
            alert(`¡Reservación confirmada! Código: ${reservation.confirmationCode}`);
            setShowReservationModal(false);
          }}
        />

        {/* Reels Sidebar - Filtrado por negocio */}
        <ReelsSidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          businessId={id}
          filterByBusiness={true}
        />
      </div>
    );
  }

  // Vista de administrador (para dueños del negocio)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/account/businesses" className="text-primary hover:text-primary-dark">
            ← Volver a mis negocios
          </Link>
          <a
            href={`/businesses/${business.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-2"
          >
            👁️ Ver perfil público
          </a>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                {businessTypeIcons[business.businessType] || businessTypeIcons.other}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-gray-600 mt-1">{business.description}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[business.status]}`}>
              {statusLabels[business.status]}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/business/${business.id}/manage`}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:shadow-lg font-bold flex items-center gap-2 transition-all"
            >
              <Grid size={20} />
              Panel de Gestión
            </Link>
            <Link
              to={`/business/${business.id}/analytics`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              📊 Estadísticas
            </Link>
            <Link
              to={`/business/${business.id}/edit`}
              className="px-6 py-2 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white font-medium transition-all"
            >
              Editar Información
            </Link>
            {(business.businessType === 'restaurant' || business.businessType === 'entertainment') && (
              <Link
                to={`/business/${business.id}/menu`}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {business.businessType === 'entertainment' ? '🍹 Gestionar Carta y Fotos' : '🍽️ Gestionar Menú y Fotos'}
              </Link>
            )}
            {business.businessType === 'spa' && (
              <Link
                to={`/business/${business.id}/spa-services`}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                💆 Gestionar Servicios
              </Link>
            )}
            {!['spa', 'restaurant', 'entertainment', 'tours'].includes(business.businessType) && (
              <Link
                to={`/business/${business.id}/services`}
                className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-gray-50 font-medium"
              >
                Gestionar Servicios
              </Link>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium"
            >
              Eliminar Negocio
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-gray-900">
              {business.servicesCount || 0}
            </div>
            <div className="text-sm text-gray-600">Servicios</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-blue-600">
              {business.followersCount || 0}
            </div>
            <div className="text-sm text-gray-600">Seguidores</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">📱</div>
            <div className="text-2xl font-bold text-purple-600">
              {business.postsCount || 0}
            </div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-yellow-600">
              {business.averageRating?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Rating promedio</div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Información de Contacto</h2>
            <div className="space-y-3">
              {business.contactPhone && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <div className="text-sm text-gray-600">Teléfono</div>
                    <div className="font-medium">{business.contactPhone}</div>
                  </div>
                </div>
              )}
              {business.contactEmail && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{business.contactEmail}</div>
                  </div>
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="text-sm text-gray-600">Sitio Web</div>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:text-primary-dark"
                    >
                      {business.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Ubicación</h2>
            {business.address && (
              <div className="space-y-2">
                {business.address.street && (
                  <p className="text-gray-700">{business.address.street}</p>
                )}
                <p className="text-gray-700">
                  {business.address.city}
                  {business.address.state && `, ${business.address.state}`}
                </p>
                <p className="text-gray-700">{business.address.country || 'Perú'}</p>
                {business.address.zipCode && (
                  <p className="text-gray-600 text-sm">CP: {business.address.zipCode}</p>
                )}
                {business.address.latitude && business.address.longitude && (
                  <p className="text-gray-600 text-sm">
                    📍 {business.address.latitude}, {business.address.longitude}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Social Media */}
          {(business.socialMedia || business.socialMediaLinks) && Object.values(business.socialMedia || business.socialMediaLinks).some(v => v) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Redes Sociales</h2>
              <div className="space-y-3">
                {(business.socialMedia?.facebook || business.socialMediaLinks?.facebook) && (
                  <a
                    href={business.socialMedia?.facebook || business.socialMediaLinks?.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-primary"
                  >
                    <span className="text-2xl">📘</span>
                    <span>Facebook</span>
                  </a>
                )}
                {(business.socialMedia?.instagram || business.socialMediaLinks?.instagram) && (
                  <a
                    href={business.socialMedia?.instagram || business.socialMediaLinks?.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-primary"
                  >
                    <span className="text-2xl">📷</span>
                    <span>Instagram</span>
                  </a>
                )}
                {(business.socialMedia?.twitter || business.socialMediaLinks?.twitter) && (
                  <a
                    href={business.socialMedia?.twitter || business.socialMediaLinks?.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-primary"
                  >
                    <span className="text-2xl">🐦</span>
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Información Adicional</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Slug:</span>
                <span className="font-medium">{business.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{business.businessType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado de verificación:</span>
                <span className="font-medium">{business.verificationStatus || 'unverified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Creado:</span>
                <span className="font-medium">
                  {new Date(business.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to={
                business.businessType === 'spa'
                  ? `/business/${business.id}/spa-services`
                  : business.businessType === 'restaurant' || business.businessType === 'entertainment'
                  ? `/business/${business.id}/menu`
                  : business.businessType === 'tours'
                  ? `/business/${business.id}/tours`
                  : `/business/${business.id}/services`
              }
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">
                {business.businessType === 'spa' ? '💆' : business.businessType === 'restaurant' ? '🍽️' : business.businessType === 'tours' ? '🗺️' : '📦'}
              </span>
              <div>
                <div className="font-medium">
                  {business.businessType === 'spa' ? 'Gestionar Servicios' : business.businessType === 'restaurant' || business.businessType === 'entertainment' ? 'Gestionar Menú' : business.businessType === 'tours' ? 'Gestionar Tours' : 'Gestionar Servicios'}
                </div>
                <div className="text-sm text-gray-600">Añadir o editar servicios</div>
              </div>
            </Link>
            <Link
              to={`/business/${business.id}/posts`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">📱</span>
              <div>
                <div className="font-medium">Posts Sociales</div>
                <div className="text-sm text-gray-600">Publicar contenido</div>
              </div>
            </Link>
            <Link
              to={`/business/${business.id}/analytics`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">📊</span>
              <div>
                <div className="font-medium">Estadísticas</div>
                <div className="text-sm text-gray-600">Ver métricas</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">¿Eliminar negocio?</h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Se eliminarán todos los servicios, posts y datos asociados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spa Service Gallery Modal */}
      {showSpaGallery && currentSpaService && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentSpaService.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Galería de fotos</p>
                </div>
                <button
                  onClick={() => setShowSpaGallery(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6">
              {spaGalleryPhotos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spaGalleryPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={getImageUrl(photo.url, 'spa-services')}
                        alt={photo.caption || currentSpaService.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 rounded-b-lg">
                          <p className="text-sm">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
                  <p>No hay fotos disponibles</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSpaGallery(false)}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reels Sidebar - Filtrado por negocio */}
      <ReelsSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        businessId={id}
        filterByBusiness={true}
      />
    </div>
  );
}

export default BusinessDetail;
