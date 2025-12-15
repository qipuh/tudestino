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
      // Obtener todas las propiedades
      const propertiesResult = await api.get('/properties');
      let propertiesData = [];
      if (Array.isArray(propertiesResult)) {
        propertiesData = propertiesResult;
      } else if (propertiesResult.data && Array.isArray(propertiesResult.data)) {
        propertiesData = propertiesResult.data;
      }

      // Obtener búsqueda unificada para mostrar diversidad de contenido
      try {
        const searchResult = await api.get('/search/all?limit=50');
        if (searchResult.success && searchResult.data?.results) {
          // Combinar propiedades con otros tipos de negocios
          const allResults = [...propertiesData, ...searchResult.data.results.filter(r => r.type !== 'property')];
          setProperties(allResults);
        } else {
          setProperties(propertiesData);
        }
      } catch (error) {
        console.error('Error fetching all businesses:', error);
        setProperties(propertiesData);
      }
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

  // Obtener items destacados (mejor valorados)
  const featuredItems = properties
    .filter(p => (p.ratingAverage >= 4.0 || p.rating >= 4.0))
    .sort((a, b) => {
      const ratingA = a.rating || a.ratingAverage || 0;
      const ratingB = b.rating || b.ratingAverage || 0;
      return ratingB - ratingA;
    })
    .slice(0, 8);

  // Categorías de búsqueda
  const categories = [
    { name: 'Alojamientos', icon: Building2, type: 'hotel', searchParam: 'category=hotel' },
    { name: 'Restaurantes', icon: Home, type: 'restaurant', searchParam: 'category=restaurant' },
    { name: 'Eventos', icon: Castle, type: 'event', searchParam: 'category=event' },
    { name: 'Entretenimiento', icon: TreePine, type: 'entertainment', searchParam: 'category=entertainment' },
    { name: 'Todo', icon: Home, type: 'all', searchParam: 'category=all' },
  ];

  // Agrupar por tipo
  const itemsByType = {
    property: properties.filter(p => !p.type || p.type === 'property' || p.accommodationType),
    restaurant: properties.filter(p => p.type === 'restaurant'),
    event: properties.filter(p => p.type === 'event'),
    entertainment: properties.filter(p => p.type === 'entertainment'),
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
                to={`/search?${category.searchParam}`}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-lg transition group"
              >
                <category.icon className="text-gray-600 group-hover:text-primary mb-3" size={32} />
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Items destacados */}
        {featuredItems.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-primary" size={28} />
              <h2 className="text-2xl font-bold mb-6 text-primary-dark">Destacados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => {
                // Obtener datos según el tipo
                const isProperty = !item.type || item.type === 'property' || item.accommodationType;
                const itemName = item.name || getPropertyName(item);
                const itemImage = item.image || (item.rooms?.[0]?.images?.[0]);
                const itemRating = item.rating || item.ratingAverage || 0;
                const itemReviewCount = item.reviewCount || item.ratingCount || 0;
                const itemCity = item.location?.city || item.addressCity;
                const itemCountry = item.location?.country || item.addressCountry;
                const itemUrl = item.url || `/properties/${item.id}`;

                return (
                <Link
                  key={`${item.type || 'property'}-${item.id}`}
                  to={itemUrl}
                  className="group border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300"
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                      </div>
                    )}
                    {itemRating >= 4.5 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-primary-dark px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <Star size={14} className="fill-white text-white" />
                        <span className="text-sm font-bold text-white">Destacado</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition">
                      {itemName}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin size={14} className="text-primary" />
                      <span className="truncate">{itemCity}, {itemCountry}</span>
                    </div>
                    {itemRating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {typeof itemRating === 'number' ? itemRating.toFixed(1) : itemRating}
                        </span>
                        <span className="text-sm text-gray-600">({itemReviewCount})</span>
                      </div>
                    )}
                    <div className="mt-3">
                      {isProperty && item.price && (
                        <>
                          <span className="text-lg font-bold text-primary-dark">${item.price}</span>
                          <span className="text-gray-600"> / noche</span>
                        </>
                      )}
                      {!isProperty && item.priceRange && (
                        <span className="text-gray-600">{'$'.repeat(item.priceRange)}</span>
                      )}
                      {isProperty && !item.price && (
                        <>
                          <span className="text-lg font-bold text-primary-dark">${getPropertyPrice(item)}</span>
                          <span className="text-gray-600"> / noche</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Items por categoría */}
        {Object.entries(itemsByType).map(([type, typeItems]) => {
          if (typeItems.length === 0) return null;

          // Mapear tipo de item a categoría
          const typeToCategory = {
            property: 'hotel',
            restaurant: 'restaurant',
            event: 'event',
            entertainment: 'entertainment'
          };
          const categoryType = typeToCategory[type];
          const categoryInfo = categories.find(c => c.type === categoryType);
          if (!categoryInfo) return null;

          return (
            <section key={type} className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <categoryInfo.icon className="text-primary" size={28} />
                  <h2 className="text-2xl font-bold text-primary-dark">{categoryInfo.name}</h2>
                  <span className="text-sm text-gray-500">({typeItems.length})</span>
                </div>
                <Link
                  to={`/search?${categoryInfo.searchParam}`}
                  className="text-primary hover:text-primary-dark font-medium text-sm"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {typeItems.slice(0, 4).map((item) => {
                  const isProperty = type === 'property';
                  const itemName = item.name || getPropertyName(item);
                  const itemImage = item.image || (item.rooms?.[0]?.images?.[0]);
                  const itemRating = item.rating || item.ratingAverage || 0;
                  const itemReviewCount = item.reviewCount || item.ratingCount || 0;
                  const itemCity = item.location?.city || item.addressCity;
                  const itemCountry = item.location?.country || item.addressCountry;
                  const itemUrl = item.url || `/properties/${item.id}`;

                  return (
                  <Link
                    key={`${type}-${item.id}`}
                    to={itemUrl}
                    className="group border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-300"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={itemName}
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
                        {itemName}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin size={14} className="text-primary" />
                        <span className="truncate">{itemCity}, {itemCountry}</span>
                      </div>
                      {itemRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {typeof itemRating === 'number' ? itemRating.toFixed(1) : itemRating}
                          </span>
                          <span className="text-sm text-gray-600">({itemReviewCount})</span>
                        </div>
                      )}
                      <div className="mt-3">
                        {isProperty ? (
                          <>
                            <span className="text-lg font-bold text-primary-dark">${item.price || getPropertyPrice(item)}</span>
                            <span className="text-gray-600"> / noche</span>
                          </>
                        ) : item.priceRange ? (
                          <span className="text-gray-600">{'$'.repeat(item.priceRange)}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Mensaje si no hay propiedades */}
        {properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay contenido disponible en este momento.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
