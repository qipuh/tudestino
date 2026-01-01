import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, SlidersHorizontal, Grid, List, Loader2, Map as MapIcon, Calendar } from 'lucide-react';
import api, { getImageUrl } from '@services/api';
import PropertiesMap from '@components/PropertiesMap';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [showMap, setShowMap] = useState(true); // Mostrar mapa por defecto

  // Filtros adicionales
  const [filters, setFilters] = useState({
    category: 'all', // all, hotel, restaurant, event, entertainment
    minRating: '',
    sortBy: 'relevance'
  });

  // Extraer parámetros de búsqueda de la URL
  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = searchParams.get('adults') || '2';
  const children = searchParams.get('children') || '0';
  const latitude = searchParams.get('lat');
  const longitude = searchParams.get('lng');

  useEffect(() => {
    fetchSearchResults();
  }, [searchParams, filters]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      // Construir query params para la API
      const params = new URLSearchParams();

      if (location) params.append('location', location);
      if (latitude) params.append('latitude', latitude);
      if (longitude) params.append('longitude', longitude);
      if (filters.category) params.append('category', filters.category);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await api.get(`/search/all?${params.toString()}`);

      if (response.success && response.data) {
        const results = response.data.results || [];

        // Debug: Log resultados de búsqueda
        console.log('🔍 Search Results Debug:', {
          totalResults: results.length,
          firstResult: results[0],
          pricesInResults: results.map(r => ({
            id: r.id,
            name: r.name,
            type: r.type,
            price: r.price
          }))
        });

        setResults(results);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Función para obtener la URL del negocio (usando slug cuando sea posible)
  const getBusinessUrl = (business) => {
    // Si tiene slug, usar la URL amigable
    if (business.slug) {
      return `/${business.slug}`;
    }

    // Fallback a URL con ID según el tipo
    if (business.type === 'property' || business.accommodationType || !business.type) {
      return `/properties/${business.id}`;
    }

    // Para otros tipos, usar la URL con ID o fallback
    return business.url || `/properties/${business.id}`;
  };

  const totalGuests = parseInt(adults) + parseInt(children);
  const dateRange = checkIn && checkOut
    ? `${new Date(checkIn).toLocaleDateString()} - ${new Date(checkOut).toLocaleDateString()}`
    : '';

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary mb-4" size={48} />
          <p className="text-gray-600">Buscando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* Header fijo - Resumen y filtros COMPACTO */}
      <div className="flex-shrink-0 bg-white border-b shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Izquierda: Resumen compacto */}
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold whitespace-nowrap">
                {results.length} resultados
                {location && ` • ${location.split(',')[0]}`}
              </h1>
              {totalGuests > 0 && (
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  👥 {totalGuests}
                </span>
              )}
            </div>

            {/* Centro/Derecha: Controles */}
            <div className="flex items-center gap-3">
              {/* Botón Filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <SlidersHorizontal size={16} />
                Filtros
              </button>

              {/* Ordenar */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="relevance">Más relevante</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="rating">Mejor valorados</option>
              </select>

              {/* Botón Mostrar/Ocultar Mapa */}
              {results.length > 0 && (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  <MapIcon size={16} />
                  {showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
                </button>
              )}

              {/* Vista */}
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Panel de filtros - COMPACTO */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 mt-3 border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Categoría
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Todos</option>
                    <option value="hotel">Alojamientos</option>
                    <option value="restaurant">Restaurantes</option>
                    <option value="event">Eventos</option>
                    <option value="entertainment">Entretenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Rating mínimo
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Cualquiera</option>
                    <option value="4.5">4.5+</option>
                    <option value="4.0">4.0+</option>
                    <option value="3.5">3.5+</option>
                    <option value="3.0">3.0+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal - Resultados con Mapa */}
      <div className="flex-1 flex overflow-hidden">
        {results.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">
                No encontramos resultados que coincidan con tu búsqueda
              </p>
              <p className="text-gray-500">Intenta ajustar los filtros o cambiar la ubicación</p>
            </div>
          </div>
        ) : (
          <>
            {/* Lista de resultados - Scrolleable sin scrollbar visible */}
            <div
              className={showMap ? 'w-1/2 overflow-y-scroll scrollbar-hide' : 'w-full overflow-y-scroll scrollbar-hide'}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <div className="max-w-screen-2xl mx-auto px-6 py-6">
                <div
                  className={
                    viewMode === 'grid'
                      ? showMap
                        ? 'grid grid-cols-1 xl:grid-cols-2 gap-5'
                        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                      : 'space-y-4'
                  }
                >
              {results.map((item) => {
                // Función para obtener el icono según el tipo
                const getTypeIcon = () => {
                  switch (item.type) {
                    case 'property': return '🏨';
                    case 'restaurant': return '🍽️';
                    case 'event': return '🎉';
                    case 'entertainment': return '🎵';
                    default: return '📍';
                  }
                };

                // Función para obtener el label del tipo
                const getTypeLabel = () => {
                  switch (item.type) {
                    case 'property': return 'Alojamiento';
                    case 'restaurant': return 'Restaurante';
                    case 'event': return 'Evento';
                    case 'entertainment': return 'Entretenimiento';
                    default: return '';
                  }
                };

                return (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={getBusinessUrl(item)}
                  onMouseEnter={() => setHoveredItemId(`${item.type}-${item.id}`)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  className={`group border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300 ${
                    hoveredItemId === `${item.type}-${item.id}` ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        {getTypeIcon()}
                      </div>
                    )}

                    {/* Badge de tipo */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
                      <span>{getTypeIcon()}</span>
                      <span>{getTypeLabel()}</span>
                    </div>

                    {/* Badge destacado para ratings altos */}
                    {item.rating >= 4.5 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-primary-dark px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <Star size={14} className="fill-white text-white" />
                        <span className="text-sm font-bold text-white">Destacado</span>
                      </div>
                    )}

                    {/* Badge de distancia */}
                    {item.distance && (
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                        A {item.distance} km
                      </div>
                    )}

                    {/* Badge de evento gratis */}
                    {item.type === 'event' && item.isFree && (
                      <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        GRATIS
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin size={14} className="text-primary" />
                      <span className="truncate">{item.location.city}, {item.location.country}</span>
                    </div>

                    {/* Rating */}
                    {item.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating}
                        </span>
                        <span className="text-sm text-gray-600">({item.reviewCount || 0})</span>
                      </div>
                    )}

                    {/* Información adicional según tipo */}
                    <div className="mt-3">
                      {item.type === 'property' && item.price && (
                        <>
                          <span className="text-lg font-bold text-primary-dark">S/{item.price}</span>
                          <span className="text-gray-600"> / {item.priceLabel}</span>
                        </>
                      )}

                      {item.type === 'restaurant' && item.cuisineTypes && item.cuisineTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.cuisineTypes.slice(0, 2).map((cuisine, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {cuisine}
                            </span>
                          ))}
                          {item.priceRange && (
                            <span className="text-xs text-gray-600 ml-1">
                              {'$'.repeat(item.priceRange)}
                            </span>
                          )}
                        </div>
                      )}

                      {item.type === 'event' && item.startDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-primary" />
                          <span>{new Date(item.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      )}

                      {item.type === 'entertainment' && (
                        <div className="flex items-center gap-2">
                          {item.coverCharge && (
                            <span className="text-sm text-gray-600">Cover: S/{item.coverCharge}</span>
                          )}
                          {item.priceRange && (
                            <span className="text-xs text-gray-600">
                              {'$'.repeat(item.priceRange)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                );
              })}
                </div>
              </div>
            </div>

            {/* Mapa lateral sticky - 100% altura */}
            {showMap && (
              <div className="w-1/2 h-full relative">
                <PropertiesMap
                  properties={results.filter(item => item.location?.latitude && item.location?.longitude).map(item => ({
                    id: `${item.type}-${item.id}`, // ID único por tipo
                    addressLatitude: item.location.latitude,
                    addressLongitude: item.location.longitude,
                    addressCity: item.location.city,
                    addressCountry: item.location.country,
                    price: item.price || 0, // Asegurar que price esté presente
                    ...item
                  }))}
                  hoveredPropertyId={hoveredItemId}
                  onMarkerHover={setHoveredItemId}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchResultsPage;
