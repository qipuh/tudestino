import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { useGeolocation } from '@hooks/useGeolocation';

/**
 * Componente de búsqueda principal estilo Airbnb
 * Con detección de ubicación automática y navegación a resultados
 */
function SearchHero() {
  const navigate = useNavigate();
  const { location: userLocation, loading: locationLoading } = useGeolocation();

  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0
  });

  const [showGuestPicker, setShowGuestPicker] = useState(false);

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

  const handleSearch = (e) => {
    e.preventDefault();

    // Construir query params para la URL
    const params = new URLSearchParams();

    if (searchParams.location) params.append('location', searchParams.location);
    if (searchParams.checkIn) params.append('checkIn', searchParams.checkIn);
    if (searchParams.checkOut) params.append('checkOut', searchParams.checkOut);
    if (searchParams.adults) params.append('adults', searchParams.adults);
    if (searchParams.children) params.append('children', searchParams.children);

    // Agregar coordenadas si están disponibles
    if (userLocation?.latitude && userLocation?.longitude) {
      params.append('lat', userLocation.latitude);
      params.append('lng', userLocation.longitude);
    }

    // Navegar a página de resultados
    navigate(`/search?${params.toString()}`);
  };

  const totalGuests = searchParams.adults + searchParams.children;

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative bg-gradient-to-br from-[#16BED8] via-[#344B89] to-[#16BED8] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Título principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Encuentra tu próximo destino
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Descubre alojamientos únicos en todo el mundo
          </p>
        </div>

        {/* Barra de búsqueda principal */}
        <form onSubmit={handleSearch} className="bg-white rounded-full shadow-2xl p-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {/* Ubicación */}
            <div className="relative md:col-span-1">
              <div className="flex items-center px-6 py-3 rounded-full hover:bg-gray-50 transition">
                <MapPin className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={searchParams.location}
                    onChange={handleInputChange}
                    placeholder={locationLoading ? "Detectando..." : "¿A dónde vas?"}
                    className="w-full text-sm text-gray-600 placeholder-gray-400 focus:outline-none bg-transparent"
                    disabled={locationLoading}
                  />
                </div>
                {locationLoading && (
                  <Loader2 className="text-gray-400 animate-spin ml-2" size={16} />
                )}
              </div>
            </div>

            {/* Check-in */}
            <div className="relative">
              <div className="flex items-center px-6 py-3 rounded-full hover:bg-gray-50 transition">
                <Calendar className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Llegada
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    value={searchParams.checkIn}
                    onChange={handleInputChange}
                    min={today}
                    className="w-full text-sm text-gray-600 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Check-out */}
            <div className="relative">
              <div className="flex items-center px-6 py-3 rounded-full hover:bg-gray-50 transition">
                <Calendar className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Salida
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    value={searchParams.checkOut}
                    onChange={handleInputChange}
                    min={searchParams.checkIn || today}
                    className="w-full text-sm text-gray-600 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Huéspedes + Botón de búsqueda */}
            <div className="relative">
              <div className="flex items-center justify-between gap-2">
                <div
                  className="flex-1 flex items-center px-6 py-3 rounded-full hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setShowGuestPicker(!showGuestPicker)}
                >
                  <Users className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Huéspedes
                    </label>
                    <div className="text-sm text-gray-600">
                      {totalGuests} {totalGuests === 1 ? 'huésped' : 'huéspedes'}
                    </div>
                  </div>
                </div>

                {/* Botón de búsqueda */}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#16BED8] to-[#344B89] text-white p-4 rounded-full hover:opacity-90 transition shadow-lg flex items-center justify-center"
                  aria-label="Buscar"
                >
                  <Search size={24} />
                </button>
              </div>

              {/* Picker de huéspedes */}
              {showGuestPicker && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowGuestPicker(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl p-6 z-20 w-80">
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
                            className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:hover:border-gray-300 transition"
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
          </div>
        </form>

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
