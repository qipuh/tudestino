import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, MapPin, Clock, Users, Building2, User } from 'lucide-react';
import useEvents from '../hooks/useEvents';
import { getImageUrl } from '../../../services/api';
import UserAccountLayout from '../../../layouts/UserAccountLayout';

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

function MyEventsPage() {
  const { getMyEvents, loading } = useEvents();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('created'); // created, registered
  const [filter, setFilter] = useState('all'); // all, upcoming, past, draft

  useEffect(() => {
    const fetchMyEvents = async () => {
      const result = await getMyEvents();
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.error);
      }
    };

    const fetchMyRegistrations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/events/user/registrations`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRegistrations(data);
        }
      } catch (err) {
        console.error('Error loading registrations:', err);
      }
    };

    fetchMyEvents();
    fetchMyRegistrations();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  const filterEvents = (events) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'upcoming':
        return events.filter(e => new Date(e.eventDate) >= now && e.status === 'active');
      case 'past':
        return events.filter(e => new Date(e.eventDate) < now);
      case 'draft':
        return events.filter(e => e.status === 'draft');
      default:
        return events;
    }
  };

  const filteredEvents = filterEvents(events);

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Activo' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
      inactive: { bg: 'bg-red-100', text: 'text-red-700', label: 'Inactivo' },
      under_maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Mantenimiento' },
    };

    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-2 py-1 ${badge.bg} ${badge.text} rounded-full text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  return (
    <UserAccountLayout activeMenu="events">
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Eventos</h1>
              <p className="text-gray-600">
                Gestiona tus eventos y revisa tus registros
              </p>
            </div>
            {activeTab === 'created' && (
              <Link
                to="/events/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
              >
                <Plus size={20} />
                Crear Evento
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'created'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Eventos Creados ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'registered'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Mis Registros ({registrations.length})
            </button>
          </div>

          {/* Filtros - solo para eventos creados */}
          {activeTab === 'created' && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Todos ({events.length})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'upcoming'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Próximos ({filterEvents(events).filter(e => new Date(e.eventDate) >= new Date()).length})
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'past'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Pasados ({filterEvents(events).filter(e => new Date(e.eventDate) < new Date()).length})
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'draft'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Borradores ({filterEvents(events).filter(e => e.status === 'draft').length})
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Tab: Eventos Creados */}
            {activeTab === 'created' && (
              <>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {filter === 'all' ? 'No tienes eventos aún' : 'No hay eventos en esta categoría'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {filter === 'all' ? 'Crea tu primer evento para empezar' : 'Prueba con otro filtro'}
                    </p>
                    {filter === 'all' && (
                      <Link
                        to="/events/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
                      >
                        <Plus size={20} />
                        Crear Evento
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    {/* Imagen */}
                    {event.images && event.images.length > 0 ? (
                      <div className="h-48 bg-gray-200 relative">
                        <img
                          src={getImageUrl(event.images[0], 'events')}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                        <span className="text-6xl">
                          {categoryIcons[event.category] || '📅'}
                        </span>
                      </div>
                    )}

                    {/* Contenido */}
                    <div className="p-4">
                      {/* Status y tipo */}
                      <div className="flex items-center justify-between mb-2">
                        {getStatusBadge(event.status)}
                        {event.organizedBy === 'business' ? (
                          <div className="flex items-center gap-1 text-blue-600 text-xs">
                            <Building2 size={12} />
                            <span>Negocio</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-600 text-xs">
                            <User size={12} />
                            <span>Personal</span>
                          </div>
                        )}
                      </div>

                      {/* Título */}
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {event.name}
                      </h3>

                      {/* Fecha */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar size={16} className="text-primary" />
                        <span>{formatDate(event.eventDate)}</span>
                      </div>

                      {/* Hora */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Clock size={16} className="text-primary" />
                        <span>
                          {formatTime(event.startTime)}
                          {event.endTime && ` - ${formatTime(event.endTime)}`}
                        </span>
                      </div>

                      {/* Ubicación */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin size={16} className="text-primary" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>

                      {/* Capacidad */}
                      {event.capacity && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={16} className="text-primary" />
                          <span>{event.capacity} personas</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
                  </div>
                )}
              </>
            )}

            {/* Tab: Mis Registros */}
            {activeTab === 'registered' && (
              <>
                {registrations.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎟️</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      No tienes registros aún
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Explora eventos y regístrate para participar
                    </p>
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
                    >
                      Explorar Eventos
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <div
                        key={registration.id}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link
                              to={`/events/${registration.eventId}`}
                              className="text-xl font-bold text-gray-900 hover:text-primary"
                            >
                              {registration.event?.name || 'Evento'}
                            </Link>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                              <Calendar size={16} className="text-primary" />
                              <span>{formatDate(registration.event?.eventDate)}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              registration.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : registration.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {registration.status === 'confirmed' ? '✓ Confirmado' :
                               registration.status === 'pending' ? 'Pendiente' : registration.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Tickets</p>
                            <p className="font-semibold text-sm">{registration.quantity || 1}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Total</p>
                            <p className="font-semibold text-sm">S/ {parseFloat(registration.totalAmount || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Pago</p>
                            <p className="font-semibold text-sm">
                              {registration.paymentStatus === 'paid' ? '✓ Pagado' :
                               registration.paymentStatus === 'pending' ? 'Pendiente' : registration.paymentStatus}
                            </p>
                          </div>
                          {registration.registrationCode && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Código</p>
                              <p className="font-mono font-semibold text-sm">{registration.registrationCode}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Link
                            to={`/events/${registration.eventId}`}
                            className="flex-1 text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition"
                          >
                            Ver Evento
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </UserAccountLayout>
  );
}

export default MyEventsPage;
