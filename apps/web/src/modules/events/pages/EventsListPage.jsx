import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventCard from '../components/EventCard';
import EventFilters from '../components/EventFilters';
import { Loader2, Calendar } from 'lucide-react';

function EventsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: [],
    locationType: null,
    startDate: null,
    endDate: null,
    isFree: false
  });

  useEffect(() => {
    fetchEvents();
  }, [filters, pagination.page]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20'
      });

      if (filters.city) queryParams.set('city', filters.city);
      if (filters.category?.length > 0) {
        queryParams.set('category', filters.category.join(','));
      }
      if (filters.locationType) queryParams.set('locationType', filters.locationType);
      if (filters.startDate) queryParams.set('startDate', filters.startDate);
      if (filters.endDate) queryParams.set('endDate', filters.endDate);
      if (filters.isFree) queryParams.set('isFree', 'true');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/search?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar eventos');
      }

      const data = await response.json();
      setEvents(data.events || []);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));

    // Actualizar URL con filtros
    const params = new URLSearchParams();
    if (newFilters.city) params.set('city', newFilters.city);
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calendar size={40} className="text-primary" />
            Eventos
          </h1>
          <p className="text-gray-600">
            Descubre los mejores eventos, ferias, conciertos, conferencias y más
          </p>
        </div>

        {/* Filtros */}
        <EventFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {/* Resultados count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {pagination.total === 0 ? (
                  'No se encontraron eventos'
                ) : (
                  <>
                    Mostrando {events.length} de {pagination.total} eventos
                  </>
                )}
              </p>
            </div>

            {/* Lista de eventos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 2 && page <= pagination.page + 2)
                      );
                    })
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                      return (
                        <div key={page} className="flex gap-2">
                          {showEllipsis && (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg ${
                              pagination.page === page
                                ? 'bg-primary text-white'
                                : 'border hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No se encontraron eventos
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros o buscar en otra ciudad
            </p>
            <button
              onClick={() => handleFiltersChange({
                city: '',
                category: [],
                locationType: null,
                startDate: null,
                endDate: null,
                isFree: false
              })}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsListPage;
