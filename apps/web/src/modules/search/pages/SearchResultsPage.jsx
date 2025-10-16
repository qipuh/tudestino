import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, SlidersHorizontal, Grid, List, Loader2, Map as MapIcon } from 'lucide-react';
import api from '@services/api';
import PropertiesMap from '@components/PropertiesMap';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Filtros adicionales
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    propertyType: '',
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
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      if (adults) params.append('adults', adults);
      if (children) params.append('children', children);
      if (latitude) params.append('latitude', latitude);
      if (longitude) params.append('longitude', longitude);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.propertyType) params.append('propertyType', filters.propertyType);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await api.get(`/search/properties?${params.toString()}`);

      if (response.success) {
        // Por ahora, como el backend retorna placeholder, usamos propiedades mock
        // setProperties(response.data.properties);

        // Temporalmente, traemos todas las propiedades y filtramos localmente
        const allProps = await api.get('/properties');
        const propertiesData = Array.isArray(allProps) ? allProps : allProps.data || [];

        // Filtrar según parámetros
        let filtered = propertiesData.filter(prop => {
          if (location && !`${prop.city} ${prop.country}`.toLowerCase().includes(location.toLowerCase())) {
            return false;
          }
          if (filters.minPrice && prop.basePrice < parseFloat(filters.minPrice)) return false;
          if (filters.maxPrice && prop.basePrice > parseFloat(filters.maxPrice)) return false;
          if (filters.propertyType && prop.type !== filters.propertyType) return false;
          if (filters.minRating && prop.averageRating < parseFloat(filters.minRating)) return false;

          const totalGuests = parseInt(adults) + parseInt(children);
          if (prop.guests && prop.guests < totalGuests) return false;

          return true;
        });

        // Ordenar
        if (filters.sortBy === 'price_asc') {
          filtered.sort((a, b) => a.basePrice - b.basePrice);
        } else if (filters.sortBy === 'price_desc') {
          filtered.sort((a, b) => b.basePrice - a.basePrice);
        } else if (filters.sortBy === 'rating') {
          filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        }

        setProperties(filtered);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const totalGuests = parseInt(adults) + parseInt(children);
  const dateRange = checkIn && checkOut
    ? `${new Date(checkIn).toLocaleDateString()} - ${new Date(checkOut).toLocaleDateString()}`
    : '';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary mb-4" size={48} />
          <p className="text-gray-600">Buscando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Resumen de búsqueda */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {properties.length} alojamientos
          {location && ` en ${location}`}
        </h1>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          {dateRange && <span>📅 {dateRange}</span>}
          {totalGuests > 0 && (
            <span>
              👥 {totalGuests} {totalGuests === 1 ? 'huésped' : 'huéspedes'}
            </span>
          )}
        </div>
      </div>

      {/* Barra de filtros y vista */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
        >
          <SlidersHorizontal size={18} />
          Filtros
        </button>

        <div className="flex items-center gap-4">
          {/* Ordenar */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="relevance">Más relevante</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="rating">Mejor valorados</option>
          </select>

          {/* Vista */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
          <h3 className="font-semibold mb-4">Filtros avanzados</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio mínimo
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="$0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio máximo
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="$1000"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de alojamiento
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos</option>
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="villa">Villa</option>
                <option value="cabin">Cabaña</option>
                <option value="room">Habitación</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valoración mínima
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Cualquiera</option>
                <option value="4.5">4.5+</option>
                <option value="4.0">4.0+</option>
                <option value="3.5">3.5+</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-2">
            No encontramos alojamientos que coincidan con tu búsqueda
          </p>
          <p className="text-gray-500">Intenta ajustar los filtros o cambiar la ubicación</p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {properties.map((property) => (
            <Link
              key={property.id}
              to={`/properties/${property.id}`}
              className={`border rounded-lg overflow-hidden hover:shadow-lg transition ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              <div className={viewMode === 'list' ? 'w-64 flex-shrink-0' : 'h-48'}>
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin size={14} />
                  <span>{property.city}, {property.country}</span>
                </div>
                {property.averageRating > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{property.averageRating}</span>
                    <span className="text-sm text-gray-600">({property.ratingCount})</span>
                  </div>
                )}
                <div className="mt-2">
                  <span className="text-lg font-bold">${property.basePrice}</span>
                  <span className="text-gray-600"> / noche</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;
