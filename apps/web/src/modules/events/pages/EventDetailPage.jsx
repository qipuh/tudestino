import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Calendar, Clock, MapPin, Users, User, Building2, ArrowLeft, Image as ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useEvents from '../hooks/useEvents';
import useAuthStore from '../../../store/authStore';
import { getImageUrl } from '../../../services/api';
import { useSidebar } from '../../../contexts/SidebarContext';
import ReelsSidebar from '../../../components/social/ReelsSidebar';
import EventImageGallery from '../components/EventImageGallery';
import TicketManagement from '../components/TicketManagement';
import EventRegistration from '../components/EventRegistration';
import ShareButtons from '../components/ShareButtons';
import EventStats from '../components/EventStats';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const categoryIcons = {
  concert: '🎵',
  festival: '🎊',
  conference: '🎤',
  fair: '🎪',
  workshop: '🛠️',
  sports: '⚽',
  cultural: '🎭',
  gastronomic: '🍽️',
  other: '📅',
};

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { getEvent, deleteEvent, loading } = useEvents();
  const { sidebarOpen, toggleSidebar, setSidebarVisible } = useSidebar();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // info, tickets, stats, gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Enable sidebar on this page
  useEffect(() => {
    setSidebarVisible(true);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  useEffect(() => {
    const fetchEvent = async () => {
      const result = await getEvent(id);
      if (result.success) {
        setEvent(result.data);
      } else {
        setError(result.error);
      }
    };

    fetchEvent();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(true);
    const result = await deleteEvent(id);

    if (result.success) {
      navigate('/events/my-events');
    } else {
      alert(result.error || 'Error al eliminar el evento');
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/events" className="text-primary hover:text-primary-dark">
            Volver a eventos
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const isOrganizer = user && (
    (event.organizedBy === 'user' && event.organizerId === user.id) ||
    (event.organizedBy === 'business' && user.businesses?.some(b => b.id === event.businessServiceId))
  );

  const mapCenter = event.address?.latitude && event.address?.longitude
    ? [parseFloat(event.address.latitude), parseFloat(event.address.longitude)]
    : [-7.1619, -78.5128];

  // Obtener todas las imágenes del evento
  const eventImages = event.eventImages || event.images || [];
  const imageUrls = eventImages.map(img =>
    typeof img === 'string' ? img : img.url
  ).filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link to="/events" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-4">
            <ArrowLeft size={20} />
            Volver a eventos
          </Link>
        </div>

        {/* Layout principal con grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Contenido del evento */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Slider de imágenes */}
              {imageUrls.length > 0 && (
                <div className="relative h-96 bg-gray-200 group">
                  <img
                    src={getImageUrl(imageUrls[currentImageIndex], 'events')}
                    alt={event.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowLightbox(true)}
                  />

                  {/* Controles del slider */}
                  {imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight size={24} />
                      </button>

                      {/* Indicadores */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {imageUrls.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-white w-8'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Botón ver galería completa */}
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ImageIcon size={16} />
                    Ver galería ({imageUrls.length})
                  </button>
                </div>
              )}

              <div className="p-8">
                {/* Título y organizador */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{event.name}</h1>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-xs font-medium">
                      {event.category}
                    </span>
                    {event.organizedBy === 'business' && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Building2 size={12} />
                        {event.organizer || 'Organizado por negocio'}
                      </span>
                    )}
                    {event.organizedBy === 'user' && event.organizer && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <User size={12} />
                        {event.organizer}
                      </span>
                    )}
                    {event.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        ⭐ Destacado
                      </span>
                    )}
                  </div>
                </div>

                {/* Información clave en una sola fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 mb-8 p-4 bg-gray-50 rounded-lg">
                  {/* Fecha - más ancho */}
                  <div className="lg:col-span-4 flex items-center gap-2">
                    <Calendar className="text-primary flex-shrink-0" size={18} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">Fecha</p>
                      <p className="font-semibold text-sm text-gray-900">{formatDate(event.eventDate)}</p>
                    </div>
                  </div>

                  {/* Horario */}
                  <div className="lg:col-span-3 flex items-center gap-2">
                    <Clock className="text-primary flex-shrink-0" size={18} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">Horario</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {formatTime(event.startTime)}
                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                      </p>
                    </div>
                  </div>

                  {/* Lugar */}
                  <div className="lg:col-span-3 flex items-center gap-2">
                    <MapPin className="text-primary flex-shrink-0" size={18} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600">Lugar</p>
                      <p className="font-semibold text-sm text-gray-900 truncate" title={event.location}>
                        {event.location}
                      </p>
                    </div>
                  </div>

                  {/* Capacidad */}
                  {event.capacity && (
                    <div className="lg:col-span-2 flex items-center gap-2">
                      <Users className="text-primary flex-shrink-0" size={18} />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600">Capacidad</p>
                        <p className="font-semibold text-sm text-gray-900">{event.capacity}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                {event.description && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Descripción</h2>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{event.description}</p>
                  </div>
                )}

            {/* Mapa */}
            {event.address?.latitude && event.address?.longitude && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ubicación en el mapa</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">📍 Dirección:</span> {event.location}
                    {event.address?.city && <span className="ml-2">- {event.address.city}</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Usa los botones + y - para hacer zoom. El scroll del mouse está deshabilitado.
                  </p>
                </div>
                <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                  <MapContainer
                    center={mapCenter}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={mapCenter} />
                  </MapContainer>
                </div>
                <div className="mt-3 flex items-center justify-center">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapCenter[0]},${mapCenter[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                  >
                    <MapPin size={16} />
                    Abrir en Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* Tabs para organizadores */}
            {isOrganizer && (
              <div className="border-t pt-6">
                <div className="flex gap-2 mb-6 border-b">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 font-medium transition ${
                      activeTab === 'info'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Información
                  </button>
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className={`px-4 py-2 font-medium transition ${
                      activeTab === 'tickets'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tickets
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-4 py-2 font-medium transition ${
                      activeTab === 'stats'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Estadísticas
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-4 py-2 font-medium transition ${
                      activeTab === 'gallery'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Galería
                  </button>
                </div>

                {activeTab === 'tickets' && <TicketManagement eventId={event.id} canEdit={true} />}
                {activeTab === 'stats' && <EventStats event={event} registrations={[]} tickets={[]} />}
                {activeTab === 'gallery' && (
                  <EventImageGallery
                    eventId={event.id}
                    images={event.eventImages || event.images || []}
                    canEdit={true}
                    onImageUploaded={(response) => {
                      // La respuesta tiene { message, images: [...] }
                      const newImages = response.images || [];
                      setEvent({
                        ...event,
                        eventImages: [...(event.eventImages || []), ...newImages],
                        images: [...(event.images || []), ...newImages.map(img => img.url)]
                      });
                    }}
                    onImageDeleted={(deletedImage) => {
                      setEvent({
                        ...event,
                        eventImages: (event.eventImages || []).filter(img => img.id !== deletedImage.id),
                        images: (event.images || []).filter(img => img !== (deletedImage.url || deletedImage))
                      });
                    }}
                  />
                )}
              </div>
            )}

            {/* Tabs para organizadores se mantienen en la columna principal */}
          </div>
        </div>
          </div>

          {/* Columna lateral - Registro de tickets (solo para usuarios) */}
          {!isOrganizer && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    🎟️ Registro al evento
                  </h3>
                  <EventRegistration
                    eventId={event.id}
                    eventData={{
                      name: event.name,
                      eventDate: event.eventDate,
                      startTime: event.startTime,
                      location: event.location,
                      category: event.category
                    }}
                    tickets={event.tickets || []}
                  />
                </div>

                {/* Card de información adicional */}
                <div className="mt-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">ℹ️ Información importante</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Recibirás confirmación por email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Código QR para acceso al evento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Soporte 24/7 para dudas</span>
                    </li>
                  </ul>
                </div>

                {/* Card de compartir */}
                <div className="mt-4 bg-white rounded-lg shadow-md p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">📤 Compartir evento</h4>
                  <ShareButtons event={event} />
                </div>
              </div>
            </div>
          )}

          {/* Si es organizador, mostrar sidebar con estadísticas rápidas */}
          {isOrganizer && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Resumen rápido</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-700">Asistentes</span>
                      <span className="text-lg font-bold text-blue-700">{event.currentAttendees || 0}/{event.capacity || '∞'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-700">Tickets vendidos</span>
                      <span className="text-lg font-bold text-green-700">
                        {event.tickets?.reduce((sum, t) => sum + (t.soldQuantity || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-700">Ingresos</span>
                      <span className="text-lg font-bold text-purple-700">
                        S/ {event.tickets?.reduce((sum, t) => sum + ((t.soldQuantity || 0) * parseFloat(t.price || 0)), 0).toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Link
                      to={`/events/${event.id}/edit`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition"
                    >
                      ✏️ Editar evento
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium disabled:opacity-50 transition"
                    >
                      {deleting ? 'Eliminando...' : '🗑️ Eliminar evento'}
                    </button>
                  </div>
                </div>

                {/* Card de compartir para organizadores */}
                <div className="mt-4 bg-white rounded-lg shadow-md p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">📤 Compartir evento</h4>
                  <ShareButtons event={event} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lightbox para galería completa */}
        {showLightbox && imageUrls.length > 0 && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            >
              <X size={32} />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
            >
              <ChevronLeft size={32} />
            </button>

            <div className="max-w-5xl max-h-full flex flex-col items-center">
              <img
                src={getImageUrl(imageUrls[currentImageIndex], 'events')}
                alt={`Imagen ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <p className="text-white mt-4 text-sm">
                {currentImageIndex + 1} / {imageUrls.length}
              </p>
            </div>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        )}
      </div>

      {/* Reels Sidebar */}
      <ReelsSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
    </div>
  );
}

export default EventDetailPage;
