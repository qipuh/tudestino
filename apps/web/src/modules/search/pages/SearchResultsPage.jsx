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
  const [showMap, setShowMap] = useState(true); // Mostrar mapa por defecto

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

      if (response.success && response.data) {
        setProperties(response.data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setProperties([]);
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
                {properties.length} alojamientos
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
              {properties.length > 0 && (
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Precio mín.
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="$0"
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Precio máx.
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="$1000"
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tipo
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Todos</option>
                    <option value="apartment">Apartamento</option>
                    <option value="house">Casa</option>
                    <option value="villa">Villa</option>
                    <option value="cabin">Cabaña</option>
                    <option value="room">Habitación</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Rating
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
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal - Resultados con Mapa */}
      <div className="flex-1 flex overflow-hidden">
        {properties.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2">
                No encontramos alojamientos que coincidan con tu búsqueda
              </p>
              <p className="text-gray-500">Intenta ajustar los filtros o cambiar la ubicación</p>
            </div>
          </div>
        ) : (
          <>
            {/* Lista de propiedades - Scrolleable sin scrollbar visible */}
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
              {properties.map((property) => {
                // Helper functions from HomePage
                const getPropertyName = (property) => {
                  if (property.propertyName) return property.propertyName;
                  if (property.hotelName) return property.hotelName;
                  const typeTranslations = {
                    'apartment': 'Departamento',
                    'house': 'Casa',
                    'villa': 'Villa',
                    'cabin': 'Cabaña',
                    'room': 'Habitación',
                    'hotel': 'Hotel',
                    'motel': 'Motel',
                    'hostel': 'Hostal',
                    'resort': 'Resort',
                    'bed_and_breakfast': 'Bed & Breakfast',
                    'guesthouse': 'Casa de huéspedes',
                  };
                  const typeName = typeTranslations[property.accommodationType] || property.accommodationType;
                  return `${typeName} en ${property.addressCity}`;
                };

                const getPropertyPrice = (property) => {
                  if (property.rooms && property.rooms.length > 0) {
                    return property.rooms[0].pricePerNight;
                  }
                  return property.basePrice || 0;
                };

                return (
                <Link
                  key={property.id}
                  to={`/properties/${property.id}`}
                  onMouseEnter={() => setHoveredPropertyId(property.id)}
                  onMouseLeave={() => setHoveredPropertyId(null)}
                  className={`group border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300 ${
                    hoveredPropertyId === property.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {property.rooms && property.rooms.length > 0 && property.rooms[0].images && property.rooms[0].images.length > 0 ? (
                      <img
                        src={property.rooms[0].images[0]}
                        alt={getPropertyName(property)}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                      </div>
                    )}
                    {property.ratingAverage >= 4.5 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-primary-dark px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <Star size={14} className="fill-white text-white" />
                        <span className="text-sm font-bold text-white">Destacado</span>
                      </div>
                    )}
                    {property.distance && (
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                        A {property.distance.toFixed(1)} km
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition">
                      {getPropertyName(property)}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin size={14} className="text-primary" />
                      <span className="truncate">{property.addressCity}, {property.addressCountry}</span>
                    </div>
                    {property.ratingAverage > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {typeof property.ratingAverage === 'number'
                            ? property.ratingAverage.toFixed(1)
                            : property.ratingAverage}
                        </span>
                        <span className="text-sm text-gray-600">({property.ratingCount || 0})</span>
                      </div>
                    )}
                    <div className="mt-3">
                      <span className="text-lg font-bold text-primary-dark">${getPropertyPrice(property)}</span>
                      <span className="text-gray-600"> / noche</span>
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
                  properties={properties}
                  hoveredPropertyId={hoveredPropertyId}
                  onMarkerHover={setHoveredPropertyId}
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
