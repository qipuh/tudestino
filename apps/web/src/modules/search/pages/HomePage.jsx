import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, TrendingUp, Home, Building2, Castle, TreePine } from 'lucide-react';
import SearchHero from '@components/SearchHero';
import ReelsSidebar from '../../../components/social/ReelsSidebar';
import api, { getImageUrl } from '../../../services/api';
import { useSidebar } from '../../../contexts/SidebarContext';

function HomePage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { sidebarOpen, toggleSidebar, setSidebarVisible } = useSidebar();

  // Enable sidebar when HomePage mounts, disable when unmounts
  useEffect(() => {
    setSidebarVisible(true);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      // Obtener todas las propiedades usando el endpoint de search/all
      // Este endpoint devuelve propiedades, restaurantes, eventos y entretenimiento
      const searchResult = await api.get('/search/all?limit=100&category=all');
      let businessesData = [];

      console.log('📊 Search result:', searchResult);

      // Adaptar respuesta según estructura del endpoint
      if (searchResult.success && searchResult.data && searchResult.data.results) {
        businessesData = searchResult.data.results;
      } else if (searchResult.data && Array.isArray(searchResult.data)) {
        businessesData = searchResult.data;
      } else if (Array.isArray(searchResult)) {
        businessesData = searchResult;
      }

      console.log('📊 Businesses data:', businessesData);
      setBusinesses(businessesData);

    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <SearchHero />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">Cargando experiencias...</p>
          </div>
        </div>
      </>
    );
  }

  // Obtener items destacados (mejor valorados)
  const featuredItems = businesses
    .filter(p => (p.ratingAverage >= 4.0 || p.rating >= 4.0))
    .sort((a, b) => {
      const ratingA = a.rating || a.ratingAverage || 0;
      const ratingB = b.rating || b.ratingAverage || 0;
      return ratingB - ratingA;
    })
    .slice(0, 8);

  // Categorías de búsqueda
  const categories = [
    { name: 'Alojamientos', icon: Building2, type: 'hotel', link: '/search?category=hotel' },
    { name: 'Restaurantes', icon: Home, type: 'restaurant', link: '/search?category=restaurant' },
    { name: 'Eventos', icon: Castle, type: 'event', link: '/events' }, // Fixed: apunta a la página de eventos
    { name: 'Entretenimiento', icon: TreePine, type: 'entertainment', link: '/search?category=entertainment' },
    { name: 'Todo', icon: Home, type: 'all', link: '/search?category=all' },
  ];

  // Agrupar por tipo
  const itemsByType = {
    property: businesses.filter(p => !p.type || p.type === 'property' || p.type === 'hotel' || p.accommodationType),
    restaurant: businesses.filter(p => p.type === 'restaurant'),
    event: businesses.filter(p => p.type === 'event'),
    entertainment: businesses.filter(p => p.type === 'entertainment'),
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

    // Para otros tipos, usar la URL con ID
    return business.url || `/properties/${business.id}`;
  };

  // Función para obtener el nombre del negocio
  const getBusinessName = (business) => {
    // Prioridad: name > propertyName > hotelName > nombre genérico en español
    if (business.name) return business.name;
    if (business.propertyName) return business.propertyName;
    if (business.hotelName) return business.hotelName;

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

    const typeName = typeTranslations[business.accommodationType] || business.accommodationType || 'Negocio';
    return `${typeName} en ${business.addressCity || business.location?.city || ''}`;
  };

  // Función para obtener el precio del negocio
  const getBusinessPrice = (business) => {
    if (business.rooms && business.rooms.length > 0) {
      return business.rooms[0].pricePerNight;
    }
    return business.price || 0;
  };

  return (
    <>
      {/* Hero con buscador prominente */}
      <SearchHero />

      {/* Reels Sidebar */}
      <ReelsSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 pr-3 sm:pr-4 lg:pr-8">
        {/* Categorías */}
        <section className="mb-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary-dark">Explora por tipo de alojamiento</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((category) => (
              <Link
                key={category.type}
                to={category.link}
                className="flex flex-col items-center p-4 sm:p-6 rounded-xl bg-white border border-gray-100 hover:border-primary shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <category.icon className="text-gray-600 group-hover:text-primary mb-2 sm:mb-3 transition-colors" size={28} />
                <span className="text-xs sm:text-sm font-medium text-gray-900 text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Items destacados */}
        {featuredItems.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <TrendingUp className="text-primary" size={24} />
              <h2 className="text-xl sm:text-2xl font-bold text-primary-dark">Destacados</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredItems.map((item) => {
                // Obtener datos según el tipo
                const isProperty = !item.type || item.type === 'property' || item.accommodationType;
                const itemName = getBusinessName(item);

                // Obtener imagen según tipo
                let itemImage;
                if (item.type === 'event') {
                  // Para eventos: usar eventImages o images
                  const eventImages = item.eventImages || item.images || [];
                  const firstImage = Array.isArray(eventImages) ? eventImages[0] : null;
                  itemImage = getImageUrl(typeof firstImage === 'string' ? firstImage : firstImage?.url, 'events');
                } else {
                  // Para propiedades y otros
                  itemImage = getImageUrl(item.image || (item.rooms?.[0]?.images?.[0]));
                }

                const itemRating = item.rating || item.ratingAverage || 0;
                const itemReviewCount = item.reviewCount || item.ratingCount || 0;
                const itemCity = item.location?.city || item.addressCity;
                const itemCountry = item.location?.country || item.addressCountry;
                const itemUrl = getBusinessUrl(item);

                return (
                  <Link
                    key={`${item.type || 'property'}-${item.id}`}
                    to={itemUrl}
                    className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="h-40 sm:h-48 bg-gray-200 relative overflow-hidden">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Sin imagen
                        </div>
                      )}
                      {itemRating >= 4.5 && (
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-primary to-primary-dark px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1 sm:gap-1.5">
                          <Star size={12} className="fill-white text-white sm:w-3.5 sm:h-3.5" />
                          <span className="text-xs sm:text-sm font-bold text-white">Destacado</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                        {itemName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                        <MapPin size={12} className="text-primary flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                        <span className="truncate">{itemCity}, {itemCountry}</span>
                      </div>
                      {itemRating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star size={12} className="fill-yellow-400 text-yellow-400 sm:w-3.5 sm:h-3.5" />
                          <span className="text-xs sm:text-sm font-medium">
                            {typeof itemRating === 'number' ? itemRating.toFixed(1) : itemRating}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600">({itemReviewCount})</span>
                        </div>
                      )}
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        {isProperty && item.price && (
                          <>
                            <span className="text-base sm:text-lg font-bold text-primary-dark">S/ {item.price}</span>
                            <span className="text-xs sm:text-sm text-gray-600"> / noche</span>
                          </>
                        )}
                        {!isProperty && item.priceRange && (
                          <span className="text-sm text-gray-600">{'S/'.repeat(item.priceRange)}</span>
                        )}
                        {isProperty && !item.price && (
                          <>
                            <span className="text-base sm:text-lg font-bold text-primary-dark">S/ {getBusinessPrice(item)}</span>
                            <span className="text-xs sm:text-sm text-gray-600"> / noche</span>
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
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <categoryInfo.icon className="text-primary" size={24} />
                  <h2 className="text-xl sm:text-2xl font-bold text-primary-dark">{categoryInfo.name}</h2>
                  <span className="text-xs sm:text-sm text-gray-500">({typeItems.length})</span>
                </div>
                <Link
                  to={`/search?${categoryInfo.searchParam}`}
                  className="text-primary hover:text-primary-dark font-medium text-xs sm:text-sm transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {typeItems.slice(0, 4).map((item) => {
                  const isProperty = type === 'property';
                  const itemName = getBusinessName(item);

                  // Obtener imagen según tipo
                  let itemImage;
                  if (item.type === 'event') {
                    // Para eventos: usar eventImages o images
                    const eventImages = item.eventImages || item.images || [];
                    const firstImage = Array.isArray(eventImages) ? eventImages[0] : null;
                    itemImage = getImageUrl(typeof firstImage === 'string' ? firstImage : firstImage?.url, 'events');
                  } else {
                    // Para propiedades y otros
                    itemImage = getImageUrl(item.image || (item.rooms?.[0]?.images?.[0]));
                  }

                  const itemRating = item.rating || item.ratingAverage || 0;
                  const itemReviewCount = item.reviewCount || item.ratingCount || 0;
                  const itemCity = item.location?.city || item.addressCity;
                  const itemCountry = item.location?.country || item.addressCountry;
                  const itemUrl = getBusinessUrl(item);

                  return (
                    <Link
                      key={`${type}-${item.id}`}
                      to={itemUrl}
                      className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="h-40 sm:h-48 bg-gray-200 relative overflow-hidden">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={itemName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                          {itemName}
                        </h3>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                          <MapPin size={12} className="text-primary flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                          <span className="truncate">{itemCity}, {itemCountry}</span>
                        </div>
                        {itemRating > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star size={12} className="fill-yellow-400 text-yellow-400 sm:w-3.5 sm:h-3.5" />
                            <span className="text-xs sm:text-sm font-medium">
                              {typeof itemRating === 'number' ? itemRating.toFixed(1) : itemRating}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-600">({itemReviewCount})</span>
                          </div>
                        )}
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          {isProperty ? (
                            <>
                              <span className="text-base sm:text-lg font-bold text-primary-dark">S/ {item.price || getBusinessPrice(item)}</span>
                              <span className="text-xs sm:text-sm text-gray-600"> / noche</span>
                            </>
                          ) : item.priceRange ? (
                            <span className="text-xs sm:text-sm text-gray-600">{'S/'.repeat(item.priceRange)}</span>
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

        {/* Mensaje si no hay negocios */}
        {businesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-gray-600">No hay contenido disponible en este momento.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
