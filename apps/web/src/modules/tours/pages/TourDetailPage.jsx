import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Users, DollarSign, Clock, Star,
  CheckCircle, XCircle, Building2, Phone, Mail, Globe,
  Coffee, Utensils, Car, User, Ticket, Shield,
  X as CloseIcon, ChevronLeft, ChevronRight, MessageCircle, Heart,
  Info, Image as ImageIcon, Newspaper, Route
} from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';
import useAuthStore from '../../../store/authStore';
import ReelsSidebar from '../../../components/social/ReelsSidebar';
import { useSidebar } from '../../../contexts/SidebarContext';

function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarVisible } = useSidebar();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Enable sidebar when component mounts
  useEffect(() => {
    setSidebarVisible(true);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  useEffect(() => {
    if (id) {
      loadTourData();
    }
  }, [id]);

  useEffect(() => {
    if (tour?.businessId && user) {
      checkFollowStatus();
    }
  }, [tour, user]);

  const loadTourData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tours/${id}`);
      console.log('Tour data:', response.data);
      setTour(response.data);
    } catch (error) {
      console.error('Error loading tour:', error);
      setError('No se pudo cargar el tour');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!tour?.businessId) return;
    try {
      const response = await api.get(`/businesses/${tour.businessId}/following`);
      setIsFollowing(response.data.data?.isFollowing || false);
    } catch (error) {
      console.error('Error checking follow status:', error);
      setIsFollowing(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login?redirect=/tours/' + id);
      return;
    }

    if (!tour?.businessId) return;

    try {
      setFollowLoading(true);

      if (isFollowing) {
        await api.delete(`/businesses/${tour.businessId}/follow`);
      } else {
        await api.post(`/businesses/${tour.businessId}/follow`);
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
      navigate('/login?redirect=/tours/' + id);
      return;
    }

    if (tour?.Business?.ownerId === user.id) {
      alert('No puedes contactarte a ti mismo');
      return;
    }

    navigate(`/messages?user=${tour.Business.ownerId}`);
  };

  const getServiceIcon = (service) => {
    const icons = {
      accommodation: Coffee,
      meals: Utensils,
      transport: Car,
      guide: User,
      entranceFees: Ticket,
      insurance: Shield
    };
    return icons[service] || CheckCircle;
  };

  const getServiceLabel = (service) => {
    const labels = {
      accommodation: 'Alojamiento',
      meals: 'Comidas',
      transport: 'Transporte',
      guide: 'Guía',
      entranceFees: 'Entradas',
      insurance: 'Seguro'
    };
    return labels[service] || service;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tour...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour no encontrado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/" className="text-primary hover:text-primary-dark">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Prepare data
  const images = tour.gallery || [];
  const businessLogo = tour.Business?.logo;
  const businessName = tour.Business?.name || tour.name;
  const businessFollowers = tour.Business?.followersCount || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Images Gallery */}
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        {images.length > 0 ? (
          <>
            {/* Main Cover Image */}
            <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-200 rounded-b-xl overflow-hidden relative mb-4">
              <img
                src={getImageUrl(images[selectedImage], 'tours')}
                alt={tour.name}
                className="w-full h-full object-cover"
              />

              {/* Info y Botones superpuestos - Diseño Premium */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 sm:p-4 lg:p-6">
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
                        🗺️
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 line-clamp-1 leading-tight drop-shadow-md">{tour.name}</h1>
                      {tour.Business && (
                        <p className="text-xs sm:text-sm text-white/80 mb-1">
                          Por {businessName}
                        </p>
                      )}

                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
                        {/* Duración */}
                        {tour.durationDays && (
                          <div className="flex items-center gap-1 text-white/90">
                            <Calendar size={14} />
                            <span className="font-semibold">{tour.durationDays}D/{tour.durationNights || tour.durationDays - 1}N</span>
                          </div>
                        )}

                        {/* Seguidores */}
                        {tour.Business && (
                          <div className="flex items-center gap-1 text-white/90">
                            <Users size={14} />
                            <span className="font-semibold">{businessFollowers}</span>
                            <span className="text-white/70">seguidores</span>
                          </div>
                        )}

                        {/* Ubicación */}
                        {tour.mainDestination && (
                          <>
                            <span className="text-white/30">•</span>
                            <div className="flex items-center gap-1 text-white/90">
                              <MapPin size={13} />
                              <span>{tour.mainDestination}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lado derecho: Botones */}
                  <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                    {tour.Business && (!user || user.id !== tour.Business.ownerId) && (
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
                          navigate('/login?redirect=/tours/' + id);
                          return;
                        }
                        document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-2 sm:px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-xs sm:text-sm flex-1 sm:flex-initial justify-center flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Calendar size={14} className="sm:w-4 sm:h-4" />
                      Reservar
                    </button>
                    {tour.Business && (
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
                    <img src={getImageUrl(img, 'tours')} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-96 bg-gray-200 rounded-b-xl flex items-center justify-center relative">
            <div className="text-center">
              <span className="text-6xl mb-2 block">🗺️</span>
              <p className="text-gray-500">Sin imágenes disponibles</p>
            </div>

            {/* Info y Botones superpuestos */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 sm:p-4 lg:p-6">
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
                      🗺️
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 line-clamp-1 leading-tight drop-shadow-md">{tour.name}</h1>
                    {tour.Business && (
                      <p className="text-xs sm:text-sm text-white/80 mb-1">
                        Por {businessName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
                      {tour.durationDays && (
                        <div className="flex items-center gap-1 text-white/90">
                          <Calendar size={14} />
                          <span className="font-semibold">{tour.durationDays}D/{tour.durationNights || tour.durationDays - 1}N</span>
                        </div>
                      )}
                      {tour.Business && (
                        <div className="flex items-center gap-1 text-white/90">
                          <Users size={14} />
                          <span className="font-semibold">{businessFollowers}</span>
                          <span className="text-white/70">seguidores</span>
                        </div>
                      )}
                      {tour.mainDestination && (
                        <>
                          <span className="text-white/30">•</span>
                          <div className="flex items-center gap-1 text-white/90">
                            <MapPin size={13} />
                            <span>{tour.mainDestination}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                  {tour.Business && (!user || user.id !== tour.Business.ownerId) && (
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
                        navigate('/login?redirect=/tours/' + id);
                        return;
                      }
                      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-2 sm:px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-semibold text-xs sm:text-sm flex-1 sm:flex-initial justify-center flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Calendar size={16} />
                    Reservar
                  </button>
                  {tour.Business && (
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
            {tour.itinerary && tour.itinerary.length > 0 && (
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium border-b-2 transition flex items-center gap-2 ${
                  activeTab === 'itinerary'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Route size={18} />
                Itinerario
              </button>
            )}
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'requirements'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle size={18} />
              Requisitos
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
                {(tour.description || tour.fullDescription) && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-3 text-gray-900">Acerca de este tour</h3>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {tour.fullDescription || tour.description}
                    </p>
                  </div>
                )}

                {/* Business Info */}
                {tour.Business && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Operador Turístico</h3>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="text-primary" size={32} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{tour.Business.name}</h4>
                        {tour.Business.verificationStatus === 'verified' && (
                          <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle size={12} />
                            Verificado
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/business/${tour.businessId}`}
                        className="text-primary hover:text-primary-dark text-sm font-medium whitespace-nowrap"
                      >
                        Ver agencia →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Included Services */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Incluye</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tour.includes && Object.entries(tour.includes).map(([key, value]) => {
                      const Icon = getServiceIcon(key);
                      return value ? (
                        <div key={key} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Icon className="text-green-600" size={20} />
                          </div>
                          <span className="text-gray-700">{getServiceLabel(key)}</span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  {tour.mealsIncluded && tour.mealsIncluded.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Comidas incluidas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tour.mealsIncluded.map((meal, idx) => (
                          <span key={idx} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                            {meal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Not Included */}
                {tour.notIncluded && tour.notIncluded.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">No Incluye</h3>
                    <div className="space-y-2">
                      {tour.notIncluded.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <XCircle className="text-red-500 flex-shrink-0" size={20} />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Itinerario */}
            {activeTab === 'itinerary' && tour.itinerary && tour.itinerary.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Itinerario del Tour</h3>
                {tour.itinerary.map((day, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gray-50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                          {day.day}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{day.title || `Día ${day.day}`}</h3>
                      </div>
                      <p className="text-gray-700 mb-3">{day.description}</p>
                      {day.activities && day.activities.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Actividades:</h4>
                          <ul className="space-y-3">
                            {day.activities.map((activity, idx) => (
                              <li key={idx} className="flex gap-3">
                                {typeof activity === 'object' ? (
                                  <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                      {activity.time && (
                                        <span className="text-primary font-semibold text-sm">{activity.time}</span>
                                      )}
                                      {activity.title && (
                                        <span className="font-medium text-gray-900">{activity.title}</span>
                                      )}
                                    </div>
                                    {activity.description && (
                                      <p className="text-gray-700 text-sm mt-1">{activity.description}</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-700">{activity}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Requisitos */}
            {activeTab === 'requirements' && (
              <div className="space-y-6">
                {tour.requirements && tour.requirements.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Requisitos</h3>
                    <ul className="space-y-2">
                      {tour.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={18} />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tour.guideLanguages && tour.guideLanguages.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Idiomas del guía</h3>
                    <div className="flex flex-wrap gap-2">
                      {tour.guideLanguages.map((lang, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tour.cancellationPolicy && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">Política de cancelación</h3>
                    <p className="text-gray-700">{tour.cancellationPolicy}</p>
                  </div>
                )}

                {!tour.requirements && !tour.guideLanguages && !tour.cancellationPolicy && (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                    <CheckCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No hay información de requisitos disponible</p>
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
                          src={getImageUrl(img, 'tours')}
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

          {/* Sidebar - Booking Section */}
          <div className="lg:col-span-1" id="booking-section">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {tour.priceCurrency || tour.currency} {tour.basePricePerPerson}
                  </div>
                  <p className="text-gray-600">por persona</p>
                </div>

                {/* Tour Details */}
                <div className="space-y-4 mb-6 border-t border-b border-gray-200 py-4">
                  {tour.durationDays && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={18} />
                        <span>Duración</span>
                      </div>
                      <span className="font-semibold">{tour.durationDays}D/{tour.durationNights || tour.durationDays - 1}N</span>
                    </div>
                  )}

                  {tour.serviceType && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={18} />
                        <span>Tipo</span>
                      </div>
                      <span className="font-semibold">{tour.serviceType}</span>
                    </div>
                  )}

                  {tour.difficulty && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Star size={18} />
                        <span>Dificultad</span>
                      </div>
                      <span className="font-semibold">{tour.difficulty}</span>
                    </div>
                  )}

                  {tour.maxGroupSize && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={18} />
                        <span>Grupo máx.</span>
                      </div>
                      <span className="font-semibold">{tour.maxGroupSize} personas</span>
                    </div>
                  )}
                </div>

                {/* Supplements */}
                {tour.supplements && (tour.supplements.single || tour.supplements.highSeason) && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Suplementos:</h4>
                    <div className="space-y-2 text-sm">
                      {tour.supplements.single && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Habitación individual</span>
                          <span className="font-semibold">+{tour.priceCurrency} {tour.supplements.single}</span>
                        </div>
                      )}
                      {tour.supplements.highSeason && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Temporada alta</span>
                          <span className="font-semibold">+{tour.priceCurrency} {tour.supplements.highSeason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Buttons */}
                <div className="space-y-3">
                  <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark font-semibold transition">
                    Reservar Ahora
                  </button>
                  <button className="w-full border border-primary text-primary py-3 rounded-lg hover:bg-primary/5 font-semibold transition">
                    Consultar Disponibilidad
                  </button>
                </div>
              </div>

              {/* Meeting Point */}
              {tour.meetingPoint?.address && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="text-primary" size={20} />
                    Punto de Encuentro
                  </h3>
                  <p className="text-gray-700 mb-2">{tour.meetingPoint.address}</p>
                  {tour.meetingPoint.instructions && (
                    <p className="text-sm text-gray-600">{tour.meetingPoint.instructions}</p>
                  )}
                  {(tour.departureTime || tour.returnTime) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {tour.departureTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Clock size={16} />
                          <span>Salida: {tour.departureTime}</span>
                        </div>
                      )}
                      {tour.returnTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} />
                          <span>Retorno: {tour.returnTime}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reels Sidebar */}
      <ReelsSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
    </div>
  );
}

export default TourDetailPage;
