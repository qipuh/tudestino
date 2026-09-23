import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, SlidersHorizontal, Grid, List, Loader2, Map as MapIcon, Calendar, Locate, X } from 'lucide-react';
import api, { getImageUrl } from '@services/api';
import PropertiesMap from '@components/PropertiesMap';
import LocationAutocomplete from '@components/LocationAutocomplete';
import { useSidebar } from '../../../contexts/SidebarContext';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSidebarVisible } = useSidebar();

  // Esta página no tiene ReelsSidebar - si sidebarVisible/sidebarOpen
  // quedó true desde el home (u otra página), MainLayout reservaba un
  // marginRight de 22rem para un sidebar que aquí nunca se renderiza,
  // dejando una franja blanca vacía a la derecha.
  useEffect(() => {
    setSidebarVisible(false);
  }, [setSidebarVisible]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [showFilters, setShowFilters] = useState(true); // Mostrar filtros por defecto
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [showMap, setShowMap] = useState(true); // Mostrar mapa por defecto
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [locatingMe, setLocatingMe] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false); // bottom sheet móvil
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filtros adicionales
  const [filters, setFilters] = useState({
    category: 'all', // all, hotel, restaurant, event, entertainment, spa, tours
    businessType: '', // tour, etc.
    query: '', // búsqueda por texto/nombre
    minRating: '',
    minPrice: '',
    maxPrice: '',
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

  // Inicializar filtros desde URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || 'all';
    const businessTypeFromUrl = searchParams.get('businessType') || '';
    const queryFromUrl = searchParams.get('q') || '';

    setFilters(prev => ({
      ...prev,
      category: categoryFromUrl,
      businessType: businessTypeFromUrl,
      query: queryFromUrl
    }));
  }, [searchParams.get('category'), searchParams.get('businessType'), searchParams.get('q')]);

  // Debounce para búsqueda por texto
  useEffect(() => {
    // Reset cuando cambian los filtros
    setPage(1);
    setResults([]);
    setHasMore(true);

    const timeoutId = setTimeout(() => {
      fetchSearchResults(1, true);
    }, filters.query ? 500 : 0); // 500ms de debounce solo cuando hay query

    return () => clearTimeout(timeoutId);
  }, [searchParams, filters]);

  const fetchSearchResults = async (pageNum = 1, isNewSearch = false) => {
    if (isNewSearch) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Construir query params para la API
      const params = new URLSearchParams();

      if (location) params.append('location', location);
      if (latitude) params.append('latitude', latitude);
      if (longitude) params.append('longitude', longitude);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.businessType) params.append('businessType', filters.businessType);
      if (filters.query) params.append('q', filters.query);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      // Paginación
      params.append('page', pageNum);
      params.append('limit', '24'); // 24 resultados por página (3 columnas x 8 filas)

      const response = await api.get(`/search/all?${params.toString()}`);

      if (response.success && response.data) {
        const newResults = response.data.results || [];
        const total = response.data.total || newResults.length;
        const totalPages = Math.ceil(total / 24);

        // Debug: Log resultados de búsqueda
        console.log('🔍 Search Results Debug:', {
          page: pageNum,
          totalResults: newResults.length,
          total: total,
          hasMore: pageNum < totalPages
        });

        if (isNewSearch) {
          setResults(newResults);
        } else {
          setResults(prev => [...prev, ...newResults]);
        }

        setTotalResults(total);
        setHasMore(pageNum < totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      if (isNewSearch) {
        setResults([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll handler
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // Cargar más cuando esté cerca del final (200px antes)
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      if (!loadingMore && hasMore) {
        fetchSearchResults(page + 1, false);
      }
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Cambia de ciudad/departamento/distrito sin volver al home - actualiza
  // la URL (location/lat/lng) y el useEffect existente vuelve a buscar.
  const handleLocationSelect = ({ label, lat, lon }) => {
    const params = new URLSearchParams(searchParams);
    if (label) {
      params.set('location', label);
      params.set('lat', lat);
      params.set('lng', lon);
    } else {
      params.delete('location');
      params.delete('lat');
      params.delete('lng');
    }
    navigate(`/search?${params.toString()}`);
  };

  // "Cerca de mí" - geolocalización del navegador + reverse geocoding
  // (Nominatim, gratis) para mostrar un nombre de lugar legible. El radio
  // de 50km ya se aplica en el backend (searchAll filtra por distance).
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }
    setLocatingMe(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: uLat, longitude: uLon } = pos.coords;
        let label = 'Mi ubicación actual';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${uLat}&lon=${uLon}`
          );
          const data = await res.json();
          label =
            data.address?.city || data.address?.town || data.address?.village || data.address?.county || label;
        } catch (err) {
          console.error('Error reverse geocoding:', err);
        }
        const params = new URLSearchParams(searchParams);
        params.set('location', label);
        params.set('lat', uLat);
        params.set('lng', uLon);
        navigate(`/search?${params.toString()}`);
        setLocatingMe(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('No pudimos acceder a tu ubicación. Revisa los permisos del navegador.');
        setLocatingMe(false);
      }
    );
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      businessType: '',
      query: '',
      minRating: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = () => {
    return filters.category !== 'all' ||
           filters.businessType !== '' ||
           filters.query !== '' ||
           filters.minRating !== '' ||
           filters.minPrice !== '' ||
           filters.maxPrice !== '';
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'property': return '🏨';
      case 'restaurant': return '🍽️';
      case 'event': return '🎉';
      case 'entertainment': return '🎵';
      case 'spa': return '💆';
      case 'tours': return '🗺️';
      case 'travel_agency': return '🧳';
      case 'tour_guide': return '🧭';
      default: return '📍';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'property': return 'Alojamiento';
      case 'restaurant': return 'Restaurante';
      case 'event': return 'Evento';
      case 'entertainment': return 'Entretenimiento';
      case 'spa': return 'Spa y Bienestar';
      case 'tours': return 'Tours';
      case 'travel_agency': return 'Agencia de Viaje';
      case 'tour_guide': return 'Guía de Turismo';
      default: return '';
    }
  };

  // Card de resultado - mismo lenguaje visual que PropertyGridCard de la
  // app (apps/mobile/lib/modules/properties/property_grid_card.dart):
  // fondo blanco, radio 18px, borde `line` sin sombra, título 14 semibold
  // ink, ubicación mute 12, precio bold primary + "/noche" mute.
  const renderResultCard = (item, compact = false) => (
    <Link
      key={`${item.type}-${item.id}`}
      to={getBusinessUrl(item)}
      onMouseEnter={() => setHoveredItemId(`${item.type}-${item.id}`)}
      onMouseLeave={() => setHoveredItemId(null)}
      className={`group bg-white border rounded-[18px] overflow-hidden transition-all duration-200 ${
        hoveredItemId === `${item.type}-${item.id}`
          ? 'border-primary shadow-lg'
          : 'border-line hover:border-primary hover:shadow-md'
      }`}
    >
      <div className={`${compact ? 'h-28' : 'h-48'} bg-sand relative overflow-hidden`}>
        {item.image ? (
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-mute ${compact ? 'text-2xl' : 'text-4xl'}`}>
            {getTypeIcon(item.type)}
          </div>
        )}

        <div className={`absolute top-2 left-2 bg-black/35 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
          <span>{getTypeIcon(item.type)}</span>
          {!compact && <span>{getTypeLabel(item.type)}</span>}
        </div>

        {item.rating >= 4.5 && !compact && (
          <div className="absolute top-2 right-2 bg-primary rounded-full shadow-lg flex items-center gap-1.5 px-3 py-1.5">
            <Star size={14} className="fill-white text-white" />
            <span className="text-sm font-bold text-white">Destacado</span>
          </div>
        )}

        {item.distance != null && !compact && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-ink">
            A {item.distance} km
          </div>
        )}

        {item.type === 'event' && item.isFree && (
          <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
            GRATIS
          </div>
        )}
      </div>
      <div className={compact ? 'p-2.5' : 'p-4'}>
        <h3 className={`font-semibold truncate text-ink group-hover:text-primary transition ${compact ? 'text-sm' : 'text-lg'}`}>
          {item.name}
        </h3>
        <div className={`flex items-center gap-1 text-mute mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
          <MapPin size={compact ? 11 : 14} className="text-primary flex-shrink-0" />
          <span className="truncate">{item.location.city}, {item.location.country}</span>
        </div>

        {item.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={compact ? 11 : 14} className="fill-yellow-400 text-yellow-400" />
            <span className={`font-medium text-ink ${compact ? 'text-xs' : 'text-sm'}`}>
              {typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating}
            </span>
            {!compact && <span className="text-sm text-mute">({item.reviewCount || 0})</span>}
          </div>
        )}

        <div className={compact ? 'mt-2' : 'mt-3'}>
          {item.type === 'property' && item.price && (
            <>
              <span className={`font-bold text-primary ${compact ? 'text-sm' : 'text-lg'}`}>S/{item.price}</span>
              <span className={`text-mute ${compact ? 'text-[11px]' : ''}`}> / {item.priceLabel}</span>
            </>
          )}

          {!compact && item.type === 'restaurant' && item.cuisineTypes && item.cuisineTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.cuisineTypes.slice(0, 2).map((cuisine, idx) => (
                <span key={idx} className="text-xs bg-sand text-mute px-2 py-1 rounded-full">
                  {cuisine}
                </span>
              ))}
              {item.priceRange && (
                <span className="text-xs text-mute ml-1">{'$'.repeat(item.priceRange)}</span>
              )}
            </div>
          )}

          {!compact && item.type === 'event' && item.startDate && (
            <div className="flex items-center gap-2 text-sm text-mute">
              <Calendar size={14} className="text-primary" />
              <span>{new Date(item.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}

          {!compact && item.type === 'entertainment' && (
            <div className="flex items-center gap-2">
              {item.coverCharge && <span className="text-sm text-mute">Cover: S/{item.coverCharge}</span>}
              {item.priceRange && <span className="text-xs text-mute">{'$'.repeat(item.priceRange)}</span>}
            </div>
          )}

          {!compact && item.type === 'spa' && item.description && (
            <span className="text-sm text-mute line-clamp-2">{item.description}</span>
          )}

          {item.type === 'tours' && item.price && (
            <span className={`font-bold text-primary ${compact ? 'text-sm' : 'text-lg'}`}>S/{item.price}</span>
          )}
        </div>
      </div>
    </Link>
  );

  const mapProperties = results
    .filter((item) => item.location?.latitude && item.location?.longitude)
    .map((item) => ({
      ...item,
      id: `${item.type}-${item.id}`,
      addressLatitude: item.location.latitude,
      addressLongitude: item.location.longitude,
      addressCity: item.location.city,
      addressCountry: item.location.country,
      price: item.price || 0,
    }));

  if (loading) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary mb-4" size={48} />
          <p className="text-mute">Buscando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-dvh flex flex-col overflow-hidden">
      {/* Header fijo - Resumen + filtros horizontales. z-20 explícito:
          el mapa de Leaflet crea sus propios panes con z-index interno
          que si no se acota puede terminar por encima de este header. */}
      <div className="relative z-20 flex-shrink-0 bg-white border-b shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Izquierda: Resumen compacto */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold whitespace-nowrap">
                {totalResults > 0 ? totalResults : results.length} resultados
              </h1>
              {location && (
                <span className="flex items-center gap-1 bg-primary/10 text-primary text-sm font-medium px-2.5 py-1 rounded-full">
                  <MapPin size={13} />
                  {location.split(',')[0]}
                  <button
                    onClick={() => handleLocationSelect({ label: '', lat: null, lon: null })}
                    className="ml-0.5 hover:text-primary-dark"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              {totalGuests > 0 && (
                <span className="text-sm text-mute flex items-center gap-1">
                  👥 {totalGuests}
                </span>
              )}
            </div>

            {/* Derecha: Controles - versión escritorio */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-sand transition text-sm relative"
              >
                <SlidersHorizontal size={16} />
                Filtros
                {hasActiveFilters() && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {[
                      filters.category !== 'all',
                      filters.businessType !== '',
                      filters.minRating !== '',
                      filters.minPrice !== '',
                      filters.maxPrice !== ''
                    ].filter(Boolean).length}
                  </span>
                )}
              </button>

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

              {results.length > 0 && (
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-sand transition text-sm"
                >
                  <MapIcon size={16} />
                  {showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
                </button>
              )}

              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-mute hover:bg-sand'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-mute hover:bg-sand'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Derecha: Controles - versión móvil (botón circular, como los
                botones de acción flotantes de la app: blanco + sombra) */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md relative flex-shrink-0 text-ink"
            >
              <SlidersHorizontal size={17} />
              {hasActiveFilters() && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {[
                    filters.category !== 'all',
                    filters.businessType !== '',
                    filters.minRating !== '',
                    filters.minPrice !== '',
                    filters.maxPrice !== ''
                  ].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Barra de filtros horizontal - solo escritorio, togglable */}
          {showFilters && (
            <div className="hidden lg:flex flex-wrap items-end gap-3 pt-3 mt-3 border-t">
              <div className="w-64">
                <label className="block text-xs font-medium text-mute mb-1">Ubicación</label>
                <div className="flex gap-1.5">
                  <div className="flex-1">
                    <LocationAutocomplete value={location} onSelect={handleLocationSelect} placeholder="Ciudad o distrito..." />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locatingMe}
                    title="Buscar cerca de mí"
                    className="flex items-center justify-center w-9 h-9 border rounded-lg hover:bg-sand transition text-primary disabled:opacity-50 flex-shrink-0"
                  >
                    {locatingMe ? <Loader2 size={16} className="animate-spin" /> : <Locate size={16} />}
                  </button>
                </div>
              </div>

              <div className="w-40">
                <label className="block text-xs font-medium text-mute mb-1">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todos</option>
                  <option value="hotel">Alojamientos</option>
                  <option value="restaurant">Restaurantes</option>
                  <option value="tours">Tours y Excursiones</option>
                </select>
              </div>

              {filters.category === 'tours' && (
                <div className="w-44">
                  <label className="block text-xs font-medium text-mute mb-1">Tipo</label>
                  <select
                    value={filters.businessType}
                    onChange={(e) => handleFilterChange('businessType', e.target.value)}
                    className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Agencias y guías</option>
                    <option value="travel_agency">Agencias de Viaje</option>
                    <option value="tour_guide">Guías de Turismo</option>
                  </select>
                </div>
              )}

              <div className="w-36">
                <label className="block text-xs font-medium text-mute mb-1">Rating mínimo</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Cualquiera</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                  <option value="3.0">3.0+</option>
                </select>
              </div>

              <div className="w-28">
                <label className="block text-xs font-medium text-mute mb-1">Precio mín.</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="S/ Min"
                  min="0"
                  className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="w-28">
                <label className="block text-xs font-medium text-mute mb-1">Precio máx.</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="S/ Max"
                  min="0"
                  className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary-dark font-medium transition pb-2.5"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal - Resultados + Mapa */}
      <div className="flex-1 relative z-0 overflow-hidden">
        {results.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-6">
              <p className="text-mute text-lg mb-2">
                No encontramos resultados que coincidan con tu búsqueda
              </p>
              <p className="text-mute">Intenta ajustar los filtros o cambiar la ubicación</p>
            </div>
          </div>
        ) : (
          <>
            {/* MÓVIL: mapa de fondo full-screen + bottom sheet arrastrable, mismo patrón que la app.
                z-0 explícito: Leaflet crea panes internos con z-index propio (400-700) que sin
                acotar el contenedor pueden terminar por encima del header/filtros. */}
            <div className="lg:hidden absolute inset-0 z-0">
              <PropertiesMap
                properties={mapProperties}
                hoveredPropertyId={hoveredItemId}
                onMarkerHover={setHoveredItemId}
              />
            </div>
            <div
              className="lg:hidden absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl flex flex-col z-10 transition-[height] duration-300 ease-out"
              style={{ height: sheetExpanded ? '90vh' : '32vh', boxShadow: '0 -4px 16px rgba(0,0,0,0.15)' }}
            >
              <button type="button" onClick={() => setSheetExpanded((v) => !v)} className="flex-shrink-0 w-full pt-2.5 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
              </button>
              <div className="flex items-center justify-between px-4 pb-1.5 flex-shrink-0">
                <span className="text-sm font-semibold text-ink">
                  {loading
                    ? 'Buscando...'
                    : `${totalResults > 0 ? totalResults : results.length} ${
                        (totalResults > 0 ? totalResults : results.length) === 1
                          ? 'resultado encontrado'
                          : 'resultados encontrados'
                      }`}
                </span>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="appearance-none bg-transparent text-primary text-xs font-medium pr-4 focus:outline-none"
                  >
                    <option value="relevance">Ordenar</option>
                    <option value="price_asc">Precio ↑</option>
                    <option value="price_desc">Precio ↓</option>
                    <option value="rating">Mejor valorados</option>
                  </select>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={handleScroll}
              >
                <div className="grid grid-cols-2 gap-3">
                  {results.map((item) => renderResultCard(item, true))}
                </div>
                {loadingMore && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                )}
                {!hasMore && (
                  <div className="text-center py-4 text-mute text-xs">
                    ✓ Has visto todos los resultados ({totalResults})
                  </div>
                )}
              </div>
            </div>

            {/* ESCRITORIO: lista + mapa lado a lado 50/50 */}
            <div className="hidden lg:flex h-full">
              <div
                className={showMap ? 'w-1/2 overflow-y-scroll scrollbar-hide' : 'w-full overflow-y-scroll scrollbar-hide'}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={handleScroll}
              >
                <div className="max-w-screen-2xl mx-auto px-6 py-6">
                  <div
                    className={
                      viewMode === 'grid'
                        ? showMap
                          ? 'grid grid-cols-1 lg:grid-cols-2 gap-5 relative'
                          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative'
                        : 'space-y-4'
                    }
                  >
                    {results.map((item) => renderResultCard(item))}
                  </div>

                  {loadingMore && (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <span className="ml-3 text-mute">Cargando más resultados...</span>
                    </div>
                  )}

                  {!hasMore && results.length > 0 && (
                    <div className="text-center py-8 text-mute text-sm">
                      ✓ Has visto todos los resultados ({totalResults})
                    </div>
                  )}
                </div>
              </div>

              {showMap && (
                <div className="w-1/2 h-full relative">
                  <PropertiesMap
                    properties={mapProperties}
                    hoveredPropertyId={hoveredItemId}
                    onMarkerHover={setHoveredItemId}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Panel de filtros - móvil: lateral desde la derecha, 85% del
          ancho, mismo patrón que _showSidePanel en search_screen.dart */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="bg-white w-[85%] max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-ink">Filtros</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 text-ink">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 px-5 space-y-5">
              <div>
                <label className="block text-xs font-medium text-mute mb-1.5">Ubicación</label>
                <div className="flex gap-1.5">
                  <div className="flex-1">
                    <LocationAutocomplete value={location} onSelect={handleLocationSelect} placeholder="Ciudad o distrito..." />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locatingMe}
                    className="flex items-center justify-center w-10 h-10 bg-sand rounded-[14px] text-primary disabled:opacity-50 flex-shrink-0"
                  >
                    {locatingMe ? <Loader2 size={16} className="animate-spin" /> : <Locate size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-mute mb-1.5">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-sand border-none rounded-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todos</option>
                  <option value="hotel">Alojamientos</option>
                  <option value="restaurant">Restaurantes</option>
                  <option value="tours">Tours y Excursiones</option>
                </select>
              </div>

              {filters.category === 'tours' && (
                <div>
                  <label className="block text-xs font-medium text-mute mb-1.5">Tipo</label>
                  <select
                    value={filters.businessType}
                    onChange={(e) => handleFilterChange('businessType', e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-sand border-none rounded-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Agencias y guías</option>
                    <option value="travel_agency">Agencias de Viaje</option>
                    <option value="tour_guide">Guías de Turismo</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-mute mb-1.5">Rating mínimo</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-sand border-none rounded-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Cualquiera</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                  <option value="3.0">3.0+</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-mute mb-1.5">Precio mín.</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="S/ Min"
                    min="0"
                    className="w-full px-3 py-2.5 text-sm bg-sand border-none rounded-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mute mb-1.5">Precio máx.</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="S/ Max"
                    min="0"
                    className="w-full px-3 py-2.5 text-sm bg-sand border-none rounded-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 space-y-2.5 flex-shrink-0">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3.5 bg-primary text-white rounded-full text-sm font-medium"
              >
                Ver {totalResults > 0 ? totalResults : results.length} resultados
              </button>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="w-full py-3.5 border border-line rounded-full text-sm font-medium text-ink"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;
