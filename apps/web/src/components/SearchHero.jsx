import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Loader2, Hotel, Utensils, PartyPopper, Music, Compass, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useGeolocation } from '@hooks/useGeolocation';
import api from '@services/api';

/**
 * Componente de búsqueda principal estilo Airbnb
 * Con detección de ubicación automática y navegación a resultados
 */
function SearchHero() {
  const navigate = useNavigate();
  const { location: userLocation, loading: locationLoading } = useGeolocation();
  const locationInputRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('hotel'); // hotel, tour, restaurant, event, entertainment
  const [searchParams, setSearchParams] = useState({
    query: '', // búsqueda por texto
    location: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0
  });

  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingField, setSelectingField] = useState(null); // 'checkIn' | 'checkOut'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Categorías de búsqueda
  const categories = [
    { id: 'hotel', name: 'Alojamientos', icon: Hotel },
    { id: 'tour', name: 'Tours', icon: Compass },
    { id: 'restaurant', name: 'Restaurantes', icon: Utensils },
    { id: 'event', name: 'Eventos', icon: PartyPopper },
    { id: 'entertainment', name: 'Entretenimiento', icon: Music },
  ];

  // Auto-rellenar ubicación cuando se detecta
  useEffect(() => {
    if (userLocation && !searchParams.location) {
      const locationString = [userLocation.city, userLocation.country]
        .filter(Boolean)
        .join(', ');
      setSearchParams(prev => ({ ...prev, location: locationString }));
    }
  }, [userLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestChange = (type, operation) => {
    setSearchParams(prev => ({
      ...prev,
      [type]: operation === 'increment'
        ? prev[type] + 1
        : Math.max(0, prev[type] - 1)
    }));
  };

  // Buscar ubicaciones usando Nominatim (OpenStreetMap)
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setLoadingLocations(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();

      const suggestions = data.map(item => ({
        name: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        country: item.address?.country,
        lat: item.lat,
        lon: item.lon,
      }));

      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Debounce para búsqueda de ubicaciones
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchParams.location);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchParams.location]);

  const handleSelectLocation = (suggestion) => {
    setSearchParams(prev => ({ ...prev, location: suggestion.name }));
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  // Funciones del calendario
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    return days;
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateInRange = (date) => {
    if (!searchParams.checkIn || !searchParams.checkOut) return false;
    const start = new Date(searchParams.checkIn);
    const end = new Date(searchParams.checkOut);
    return date >= start && date <= end;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];

    if (selectingField === 'checkIn') {
      setSearchParams(prev => ({ ...prev, checkIn: formattedDate, checkOut: '' }));
      setSelectingField('checkOut');
    } else if (selectingField === 'checkOut') {
      if (new Date(formattedDate) > new Date(searchParams.checkIn)) {
        setSearchParams(prev => ({ ...prev, checkOut: formattedDate }));
        setShowDatePicker(false);
        setSelectingField(null);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Construir query params para la URL
    const params = new URLSearchParams();

    // Agregar categoría/businessType
    if (activeCategory === 'tour') {
      params.append('businessType', 'tour');
    } else if (activeCategory !== 'hotel') {
      params.append('category', activeCategory);
    } else {
      params.append('category', 'hotel');
    }

    // Agregar búsqueda por texto
    if (searchParams.query) params.append('q', searchParams.query);

    if (searchParams.location) params.append('location', searchParams.location);

    // Solo agregar fechas y huéspedes para alojamientos y tours
    if (activeCategory === 'hotel' || activeCategory === 'tour') {
      if (searchParams.checkIn) params.append('checkIn', searchParams.checkIn);
      if (searchParams.checkOut) params.append('checkOut', searchParams.checkOut);
      if (searchParams.adults) params.append('adults', searchParams.adults);
      if (searchParams.children) params.append('children', searchParams.children);
    }

    // Agregar coordenadas si están disponibles
    if (userLocation?.latitude && userLocation?.longitude) {
      params.append('lat', userLocation.latitude);
      params.append('lng', userLocation.longitude);
    }

    // Navegar a página de resultados
    navigate(`/search?${params.toString()}`);
  };

  const totalGuests = searchParams.adults + searchParams.children;

  return (
    <div className="relative bg-primary px-4 flex items-center" style={{ height: '55vh', minHeight: '450px' }}>
      <div className="max-w-5xl mx-auto w-full">
        {/* Título principal */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 px-4">
            Encuentra tu próximo destino
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-white/90 px-4">
            Descubre alojamientos, tours, restaurantes y más
          </p>
        </div>

        {/* Tabs de categorías */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-white text-primary shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <category.icon size={18} />
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Barra de búsqueda principal */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-2">
          <div className="flex flex-col md:grid gap-2" style={{
            gridTemplateColumns: activeCategory === 'hotel' || activeCategory === 'tour'
              ? '1.5fr 1fr 1fr 0.8fr'
              : '1.5fr 1fr 0.8fr'
          }}>
            {/* Búsqueda por texto/nombre */}
            <div className="relative">
              <div className="flex items-center px-4 md:px-6 py-3 rounded-2xl hover:bg-gray-50 transition">
                <Search className="text-gray-400 mr-2 md:mr-3 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    {activeCategory === 'hotel' ? '¿Qué buscas?' : activeCategory === 'tour' ? 'Buscar tours' : activeCategory === 'restaurant' ? 'Buscar restaurantes' : activeCategory === 'event' ? 'Buscar eventos' : 'Buscar entretenimiento'}
                  </label>
                  <input
                    type="text"
                    name="query"
                    value={searchParams.query}
                    onChange={handleInputChange}
                    placeholder={activeCategory === 'hotel' ? "Hotel, apartamento..." : activeCategory === 'tour' ? "City tour, aventura..." : "Nombre del lugar..."}
                    className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación con autocompletado */}
            <div className="relative">
              <div className="flex items-center px-4 md:px-6 py-3 rounded-2xl hover:bg-gray-50 transition">
                <MapPin className="text-gray-400 mr-2 md:mr-3 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Ubicación
                  </label>
                  <input
                    ref={locationInputRef}
                    type="text"
                    name="location"
                    value={searchParams.location}
                    onChange={handleInputChange}
                    onFocus={() => searchParams.location.length >= 3 && setShowLocationSuggestions(true)}
                    placeholder={locationLoading ? "Detectando..." : "Ciudad, país..."}
                    className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none bg-transparent"
                    disabled={locationLoading}
                  />
                </div>
                {loadingLocations ? (
                  <Loader2 className="text-gray-400 animate-spin ml-2" size={16} />
                ) : locationLoading && (
                  <Loader2 className="text-gray-400 animate-spin ml-2" size={16} />
                )}
              </div>

              {/* Dropdown de sugerencias de ubicación */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLocationSuggestions(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl w-full z-20 max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectLocation(suggestion)}
                        className="w-full p-3 text-left hover:bg-gray-100 transition flex items-start gap-2 border-b last:border-b-0"
                      >
                        <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {suggestion.city || suggestion.name.split(',')[0]}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Fechas (Check-in y Check-out) - Solo para hotel y tour */}
            {(activeCategory === 'hotel' || activeCategory === 'tour') && (
              <div className="relative">
                <div className="border rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-2">
                    <div
                      className="p-3 border-r cursor-pointer hover:bg-gray-50 transition flex items-center gap-2"
                      onClick={() => {
                        setSelectingField('checkIn');
                        setShowDatePicker(true);
                      }}
                    >
                      <Calendar className="text-gray-400 flex-shrink-0" size={16} />
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-700 mb-0.5">Llegada</label>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {searchParams.checkIn ? formatDate(searchParams.checkIn) : 'Fecha'}
                        </div>
                      </div>
                    </div>
                    <div
                      className="p-3 cursor-pointer hover:bg-gray-50 transition flex items-center gap-2"
                      onClick={() => {
                        if (searchParams.checkIn) {
                          setSelectingField('checkOut');
                          setShowDatePicker(true);
                        }
                      }}
                    >
                      <Calendar className="text-gray-400 flex-shrink-0" size={16} />
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-700 mb-0.5">Salida</label>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {searchParams.checkOut ? formatDate(searchParams.checkOut) : 'Fecha'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Huéspedes - Solo para hotel y tour */}
            {(activeCategory === 'hotel' || activeCategory === 'tour') && (
              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="flex-1 flex items-center px-4 md:px-6 py-3 rounded-2xl hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setShowGuestPicker(!showGuestPicker)}
                  >
                    <Users className="text-gray-400 mr-2 md:mr-3 flex-shrink-0" size={20} />
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-semibold text-gray-900 mb-1">
                        Personas
                      </label>
                      <div className="text-sm text-gray-600">
                        {totalGuests}
                      </div>
                    </div>
                  </div>

                  {/* Botón de búsqueda */}
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-secondary to-primary text-white p-3 md:p-4 rounded-full hover:opacity-90 transition shadow-lg flex items-center justify-center flex-shrink-0"
                    aria-label="Buscar"
                  >
                    <Search size={20} className="md:hidden" />
                    <Search size={24} className="hidden md:block" />
                  </button>
                </div>

                {/* Picker de huéspedes */}
                {showGuestPicker && (
                  <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowGuestPicker(false)}
                  />
                  <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 bg-white rounded-2xl shadow-xl p-6 z-20 w-full md:w-80">
                    <div className="space-y-4">
                      {/* Adultos */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">Adultos</div>
                          <div className="text-sm text-gray-500">13 años o más</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleGuestChange('adults', 'decrement')}
                            disabled={searchParams.adults <= 1}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:hover:border-gray-300 transition"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {searchParams.adults}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleGuestChange('adults', 'increment')}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-900 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Niños */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">Niños</div>
                          <div className="text-sm text-gray-500">0-12 años</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleGuestChange('children', 'decrement')}
                            disabled={searchParams.children <= 0}
                            className="w-8 h-8 mr-4 rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:hover:border-gray-300 transition"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {searchParams.children}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleGuestChange('children', 'increment')}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-900 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowGuestPicker(false)}
                      className="mt-4 w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                      Aplicar
                    </button>
                  </div>
                  </>
                )}
              </div>
            )}

            {/* Botón de búsqueda - Solo para categorías sin huéspedes */}
            {activeCategory !== 'hotel' && activeCategory !== 'tour' && (
              <div className="relative flex items-center justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-secondary to-primary text-white px-8 py-4 rounded-2xl hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2 font-semibold"
                  aria-label="Buscar"
                >
                  <Search size={20} />
                  <span>Buscar</span>
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Calendario Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectingField === 'checkIn' ? 'Fecha de entrada' : 'Fecha de salida'}
                </h3>
                <button
                  onClick={() => {
                    setShowDatePicker(false);
                    setSelectingField(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navegación del mes */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="font-semibold">
                  {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </div>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const disabled = isDateDisabled(day.date);
                  const inRange = isDateInRange(day.date);
                  const isCheckInDate = searchParams.checkIn && day.date.toISOString().split('T')[0] === searchParams.checkIn;
                  const isCheckOutDate = searchParams.checkOut && day.date.toISOString().split('T')[0] === searchParams.checkOut;

                  return (
                    <button
                      key={index}
                      onClick={() => !disabled && day.isCurrentMonth && handleDateSelect(day.date)}
                      disabled={disabled || !day.isCurrentMonth}
                      className={`
                        aspect-square p-2 text-sm rounded-full transition-colors
                        ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                        ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                        ${inRange && !isCheckInDate && !isCheckOutDate ? 'bg-primary bg-opacity-10' : ''}
                        ${isCheckInDate || isCheckOutDate ? 'bg-primary text-white hover:bg-primary-dark' : ''}
                      `}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Resumen de noches */}
              {searchParams.checkIn && searchParams.checkOut && (
                <div className="mt-4 text-center text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg py-2">
                  {Math.ceil((new Date(searchParams.checkOut) - new Date(searchParams.checkIn)) / (1000 * 60 * 60 * 24))} noche{Math.ceil((new Date(searchParams.checkOut) - new Date(searchParams.checkIn)) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mensaje de ubicación detectada */}
        {userLocation && (
          <div className="text-center mt-4 text-white/80 text-sm">
            📍 Ubicación detectada: {userLocation.city}, {userLocation.country}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchHero;
