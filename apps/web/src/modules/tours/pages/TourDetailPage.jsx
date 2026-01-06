import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Calendar, Users, DollarSign, Clock, Star,
  CheckCircle, XCircle, Building2, Phone, Mail, Globe,
  Coffee, Utensils, Car, User, Ticket, Shield, ChevronDown, ChevronUp,
  X as CloseIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';

function TourDetailPage() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    loadTourData();
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxIndex, tour]);

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

  const toggleDay = (dayNumber) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    if (tour.gallery) {
      setLightboxIndex((lightboxIndex + 1) % tour.gallery.length);
    }
  };

  const prevImage = () => {
    if (tour.gallery) {
      setLightboxIndex((lightboxIndex - 1 + tour.gallery.length) % tour.gallery.length);
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tour...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Tour no encontrado'}</p>
          <Link to="/" className="text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-teal-500 to-teal-700">
        {tour.coverImage ? (
          <img
            src={getImageUrl(tour.coverImage, 'tours')}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-9xl">
            🗺️
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">{tour.name}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <span>{tour.mainDestination}</span>
              </div>
              {tour.durationDays && (
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>{tour.durationDays}D/{tour.durationNights || tour.durationDays - 1}N</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Info */}
            {tour.Business && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="text-primary" size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{tour.Business.name}</h3>
                    <p className="text-sm text-gray-600">Operador Turístico</p>
                    {tour.Business.verificationStatus === 'verified' && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle size={12} />
                        Verificado
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/business/${tour.businessId}`}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    Ver agencia →
                  </Link>
                </div>
              </div>
            )}

            {/* Description */}
            {(tour.description || tour.fullDescription) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {tour.fullDescription || tour.description}
                </p>
              </div>
            )}

            {/* Gallery */}
            {tour.gallery && tour.gallery.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Galería de Fotos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tour.gallery.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => openLightbox(index)}
                      className="aspect-square rounded-lg overflow-hidden hover:shadow-xl transition cursor-pointer bg-gray-100 group relative"
                    >
                      <img
                        src={getImageUrl(image, 'tours')}
                        alt={`${tour.name} - Foto ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {tour.itinerary && tour.itinerary.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerario</h2>
                <div className="space-y-4">
                  {tour.itinerary.map((day, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDay(day.day)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                            {day.day}
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-gray-900">{day.title || `Día ${day.day}`}</h3>
                          </div>
                        </div>
                        {expandedDay === day.day ? (
                          <ChevronUp className="text-gray-600" />
                        ) : (
                          <ChevronDown className="text-gray-600" />
                        )}
                      </button>

                      {expandedDay === day.day && (
                        <div className="p-4 bg-white">
                          <p className="text-gray-700 mb-3">{day.description}</p>
                          {day.activities && day.activities.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Actividades:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {day.activities.map((activity, idx) => (
                                  <li key={idx} className="text-gray-700">{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included Services */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Incluye</h2>
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
                  <h3 className="font-semibold text-gray-900 mb-2">Comidas incluidas:</h3>
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Incluye</h2>
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

            {/* Requirements & Policies */}
            {(tour.requirements || tour.cancellationPolicy || tour.guideLanguages) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Importante</h2>

                {tour.requirements && tour.requirements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Requisitos:</h3>
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
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Idiomas del guía:</h3>
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
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Política de cancelación:</h3>
                    <p className="text-gray-700">{tour.cancellationPolicy}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
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

      {/* Lightbox Modal */}
      {lightboxOpen && tour.gallery && tour.gallery.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
          >
            <CloseIcon size={32} />
          </button>

          {/* Previous Button */}
          {tour.gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition z-10"
            >
              <ChevronLeft size={48} />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-7xl max-h-[90vh] px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(tour.gallery[lightboxIndex], 'tours')}
              alt={`${tour.name} - Foto ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            {/* Image Counter */}
            <div className="text-center mt-4 text-white">
              {lightboxIndex + 1} / {tour.gallery.length}
            </div>
          </div>

          {/* Next Button */}
          {tour.gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition z-10"
            >
              <ChevronRight size={48} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TourDetailPage;
