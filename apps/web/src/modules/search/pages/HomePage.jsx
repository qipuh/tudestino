import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, TrendingUp, Home, Building2, Castle, TreePine } from 'lucide-react';
import SearchHero from '@components/SearchHero';
import ReelsSidebar from '../../../components/social/ReelsSidebar';
import api from '../../../services/api';
import { useSidebar } from '../../../contexts/SidebarContext';

function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { sidebarOpen, toggleSidebar, setSidebarVisible } = useSidebar();

  // Enable sidebar when HomePage mounts, disable when unmounts
  useEffect(() => {
    setSidebarVisible(true);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const result = await api.get('/properties');

      let propertiesData = [];
      if (Array.isArray(result)) {
        propertiesData = result;
      } else if (result.data && Array.isArray(result.data)) {
        propertiesData = result.data;
      }

      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <SearchHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando propiedades...</p>
          </div>
        </div>
      </>
    );
  }

  // Obtener propiedades destacadas (mejor valoradas)
  const featuredProperties = properties
    .filter(p => p.ratingAverage >= 4.0)
    .sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0))
    .slice(0, 8);

  // Categorías de alojamiento
  const categories = [
    { name: 'Hoteles', icon: Building2, type: 'hotel' },
    { name: 'Departamentos', icon: Home, type: 'apartment' },
    { name: 'Casas', icon: Castle, type: 'house' },
    { name: 'Cabañas', icon: TreePine, type: 'cabin' },
    { name: 'Habitaciones', icon: Home, type: 'room' },
  ];

  // Agrupar propiedades por tipo de alojamiento
  const propertiesByType = {
    hotel: properties.filter(p => ['hotel', 'motel', 'hostel', 'resort', 'bed_and_breakfast'].includes(p.accommodationType)),
    apartment: properties.filter(p => p.accommodationType === 'apartment'),
    house: properties.filter(p => ['house', 'villa'].includes(p.accommodationType)),
    cabin: properties.filter(p => p.accommodationType === 'cabin'),
    room: properties.filter(p => p.accommodationType === 'room'),
  };

  // Función para obtener el nombre de la propiedad
  const getPropertyName = (property) => {
    // Prioridad: propertyName > hotelName > nombre genérico en español
    if (property.propertyName) return property.propertyName;
    if (property.hotelName) return property.hotelName;

    // Traducir tipo de alojamiento al español
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

  // Función para obtener el precio de la propiedad (de la primera habitación)
  const getPropertyPrice = (property) => {
    if (property.rooms && property.rooms.length > 0) {
      return property.rooms[0].pricePerNight;
    }
    return 0;
  };

  return (
    <>
      {/* Hero con buscador prominente */}
      <SearchHero />

      {/* Reels Sidebar */}
      <ReelsSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pr-4 lg:pr-8">
        {/* Categorías */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-primary-dark">Explora por tipo de alojamiento</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.type}
                to={`/search?propertyType=${category.type}`}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-lg transition group"
              >
                <category.icon className="text-gray-600 group-hover:text-primary mb-3" size={32} />
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Propiedades destacadas */}
        {featuredProperties.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-primary" size={28} />
              <h2 className="text-2xl font-bold mb-6 text-primary-dark">Alojamientos destacados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <Link
                  key={property.id}
                  to={`/properties/${property.id}`}
                  className="group border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300"
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
                        <span className="text-sm text-gray-600">({property.ratingCount})</span>
                      </div>
                    )}
                    <div className="mt-3">
                      <span className="text-lg font-bold text-primary-dark">${getPropertyPrice(property)}</span>
                      <span className="text-gray-600"> / noche</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Propiedades por tipo de alojamiento */}
        {Object.entries(propertiesByType).map(([type, typeProperties]) => {
          if (typeProperties.length === 0) return null;

          const categoryInfo = categories.find(c => c.type === type);
          if (!categoryInfo) return null;

          return (
            <section key={type} className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <categoryInfo.icon className="text-primary" size={28} />
                  <h2 className="text-2xl font-bold text-primary-dark">{categoryInfo.name}</h2>
                  <span className="text-sm text-gray-500">({typeProperties.length})</span>
                </div>
                <Link
                  to={`/search?propertyType=${type}`}
                  className="text-primary hover:text-primary-dark font-medium text-sm"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {typeProperties.slice(0, 4).map((property) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="group border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {property.rooms && property.rooms.length > 0 && property.rooms[0].images && property.rooms[0].images.length > 0 ? (
                        <img
                          src={property.rooms[0].images[0]}
                          alt={getPropertyName(property)}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Sin imagen
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
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {typeof property.ratingAverage === 'number'
                              ? property.ratingAverage.toFixed(1)
                              : parseFloat(property.ratingAverage).toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-600">({property.ratingCount})</span>
                        </div>
                      )}
                      <div className="mt-3">
                        <span className="text-lg font-bold text-primary-dark">${getPropertyPrice(property)}</span>
                        <span className="text-gray-600"> / noche</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Mensaje si no hay propiedades */}
        {properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay propiedades disponibles en este momento.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
