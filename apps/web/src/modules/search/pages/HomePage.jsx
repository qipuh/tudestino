import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, TrendingUp, Home, Building2, Castle, TreePine, Map, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchHero from '@components/SearchHero';
import ReelsSidebar from '../../../components/social/ReelsSidebar';
import api, { getImageUrl } from '../../../services/api';
import { useSidebar } from '../../../contexts/SidebarContext';

function HomePage() {
  const [businesses, setBusinesses] = useState([]);
  const [tours, setTours] = useState([]);
  const [tourBusinesses, setTourBusinesses] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attractionsCarouselIndex, setAttractionsCarouselIndex] = useState(0);
  const { sidebarOpen, toggleSidebar, setSidebarVisible } = useSidebar();
  const attractionsCarouselRef = useRef(null);

  // Enable sidebar when HomePage mounts, disable when unmounts
  useEffect(() => {
    setSidebarVisible(true);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  useEffect(() => {
    fetchBusinesses();
    fetchTours();
    fetchTourBusinesses();
    fetchAttractions();
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

  const fetchTours = async () => {
    try {
      const response = await api.get('/tours/search?limit=8');
      console.log('🗺️ Tours response:', response);

      // La respuesta tiene estructura: { success: true, data: { tours: [...], pagination: {...} } }
      const toursData = response.data?.tours || response.tours || [];
      console.log('🗺️ Tours data:', toursData);
      setTours(toursData);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([]);
    }
  };

  const fetchTourBusinesses = async () => {
    try {
      const response = await api.get('/businesses/search?businessType=tour&limit=8');
      console.log('🏢 Tour businesses response:', response);

      // La respuesta tiene estructura: { success: true, data: { businesses: [...], pagination: {...} } }
      const businessesData = response.data?.businesses || response.businesses || [];
      console.log('🏢 Tour businesses data:', businessesData);
      setTourBusinesses(businessesData);
    } catch (error) {
      console.error('Error fetching tour businesses:', error);
      setTourBusinesses([]);
    }
  };

  const fetchAttractions = async () => {
    try {
      const response = await api.get('/attractions?limit=50');
      console.log('🏞️ Attractions response:', response);

      const attractionsData = response.data?.attractions || response.attractions || response.data || [];
      console.log('🏞️ Attractions data:', attractionsData);
      setAttractions(attractionsData);
    } catch (error) {
      console.error('Error fetching attractions:', error);
      setAttractions([]);
    }
  };

  const handleAttractionsNext = () => {
    if (attractionsCarouselIndex < attractions.length - 4) {
      setAttractionsCarouselIndex(prev => prev + 1);
    }
  };

  const handleAttractionsPrev = () => {
    if (attractionsCarouselIndex > 0) {
      setAttractionsCarouselIndex(prev => prev - 1);
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
    { name: 'Alojamientos', icon: Building2, type: 'hotel', link: '/search?category=hotel', searchParam: 'category=hotel' },
    { name: 'Restaurantes', icon: Home, type: 'restaurant', link: '/search?category=restaurant', searchParam: 'category=restaurant' },
    { name: 'Eventos', icon: Castle, type: 'event', link: '/events', searchParam: 'category=event' },
    { name: 'Entretenimiento', icon: TreePine, type: 'entertainment', link: '/search?category=entertainment', searchParam: 'category=entertainment' },
    { name: 'Información Turística', icon: MapPin, type: 'attractions', link: '/search?businessType=tour', searchParam: 'businessType=tour' },
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
                } else if (item.type === 'property' || item.accommodationType || !item.type) {
                  // Para propiedades/hoteles
                  itemImage = getImageUrl(item.image || (item.rooms?.[0]?.images?.[0]), 'property');
                } else if (item.type === 'restaurant' || item.type === 'entertainment') {
                  // Para restaurantes y entretenimiento
                  itemImage = getImageUrl(item.image, 'business');
                } else {
                  // Fallback
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

        {/* Tours Destacados */}
        {tours.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Map className="text-primary" size={24} />
                <h2 className="text-xl sm:text-2xl font-bold text-primary-dark">Tours y Excursiones</h2>
                <span className="text-xs sm:text-sm text-gray-500">({tours.length})</span>
              </div>
              <Link
                to="/search?category=tour"
                className="text-primary hover:text-primary-dark font-medium text-xs sm:text-sm transition-colors"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {tours.map((tour) => (
                <Link
                  key={tour.id}
                  to={`/tours/${tour.id}`}
                  className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-teal-500 to-teal-700 relative overflow-hidden">
                    {tour.coverImage ? (
                      <img
                        src={getImageUrl(tour.coverImage, 'tours')}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-5xl">
                        🗺️
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
                      ${tour.basePricePerPerson}
                    </div>
                    {tour.category && (
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-primary">
                        {tour.category}
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
                      {tour.name}
                    </h3>

                    {/* Nombre del negocio */}
                    {tour.Business && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Building2 size={12} className="flex-shrink-0" />
                        <span className="truncate">{tour.Business.name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-2">
                      <MapPin size={12} className="text-primary flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                      <span className="truncate">{tour.mainDestination}</span>
                    </div>

                    {tour.durationDays && (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                        <Calendar size={12} className="text-primary flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                        <span>{tour.durationDays}D/{tour.durationNights || tour.durationDays - 1}N</span>
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <span className="text-base sm:text-lg font-bold text-primary-dark">
                        {tour.priceCurrency} {tour.basePricePerPerson}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600"> / persona</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empresas de Tours */}
        {tourBusinesses.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Building2 className="text-primary" size={24} />
                <h2 className="text-xl sm:text-2xl font-bold text-primary-dark">Agencias de Tours</h2>
                <span className="text-xs sm:text-sm text-gray-500">({tourBusinesses.length})</span>
              </div>
              <Link
                to="/search?businessType=tour"
                className="text-primary hover:text-primary-dark font-medium text-xs sm:text-sm transition-colors"
              >
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {tourBusinesses.map((business) => (
                <Link
                  key={business.id}
                  to={`/business/${business.id}`}
                  className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
                    {business.logo || business.coverImage ? (
                      <img
                        src={getImageUrl(business.logo || business.coverImage, 'business')}
                        alt={business.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Building2 size={48} />
                      </div>
                    )}
                    {business.verificationStatus === 'verified' && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={12} fill="white" />
                        Verificado
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                      {business.name}
                    </h3>
                    {business.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    {business.address && (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-2">
                        <MapPin size={12} className="text-primary flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                        <span className="truncate">{business.address}</span>
                      </div>
                    )}
                    {business.ratingAverage > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={12} className="fill-yellow-400 text-yellow-400 sm:w-3.5 sm:h-3.5" />
                        <span className="text-xs sm:text-sm font-medium">
                          {business.ratingAverage.toFixed(1)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">
                          ({business.reviewCount || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
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
                  } else if (type === 'property') {
                    // Para propiedades/hoteles
                    itemImage = getImageUrl(item.image || (item.rooms?.[0]?.images?.[0]), 'property');
                  } else if (type === 'restaurant' || type === 'entertainment') {
                    // Para restaurantes y entretenimiento
                    itemImage = getImageUrl(item.image, 'business');
                  } else {
                    // Fallback
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

        {/* Atractivos Turísticos */}
        {attractions.length > 0 && (
          <section id="atractivos" className="mb-16 scroll-mt-20">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <MapPin className="text-primary" size={24} />
                <h2 className="text-xl sm:text-2xl font-bold text-primary-dark">Atractivos Turísticos</h2>
                <span className="text-xs sm:text-sm text-gray-500">({attractions.length})</span>
              </div>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Navigation Buttons */}
              {attractions.length > 4 && (
                <>
                  <button
                    onClick={handleAttractionsPrev}
                    disabled={attractionsCarouselIndex === 0}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg transition-all ${
                      attractionsCarouselIndex === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 hover:scale-110'
                    }`}
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={24} className="text-primary" />
                  </button>
                  <button
                    onClick={handleAttractionsNext}
                    disabled={attractionsCarouselIndex >= attractions.length - 4}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg transition-all ${
                      attractionsCarouselIndex >= attractions.length - 4
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 hover:scale-110'
                    }`}
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={24} className="text-primary" />
                  </button>
                </>
              )}

              {/* Carousel Track */}
              <div className="overflow-hidden">
                <div
                  ref={attractionsCarouselRef}
                  className="flex transition-transform duration-500 ease-in-out gap-4 sm:gap-6"
                  style={{
                    transform: `translateX(-${attractionsCarouselIndex * (100 / 4)}%)`
                  }}
                >
                  {attractions.map((attraction) => (
                    <Link
                      key={attraction.id}
                      to={`/attractions/${attraction.id}`}
                      className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0"
                      style={{ width: 'calc(25% - 18px)' }}
                    >
                      <div className="h-48 sm:h-56 bg-gradient-to-br from-green-500 to-blue-600 relative overflow-hidden">
                        {attraction.coverImage ? (
                          <img
                            src={getImageUrl(attraction.coverImage, 'attractions')}
                            alt={attraction.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            <MapPin size={48} />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
                          {attraction.category === 'naturaleza' && '🌿 Naturaleza'}
                          {attraction.category === 'cultura' && '🏛️ Cultura'}
                          {attraction.category === 'aventura' && '⛰️ Aventura'}
                          {attraction.category === 'gastronomia' && '🍴 Gastronomía'}
                          {attraction.category === 'urbano' && '🏙️ Urbano'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {attraction.title}
                        </h3>
                        {attraction.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                            {attraction.description}
                          </p>
                        )}
                        {attraction.city && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-3">
                            <MapPin size={14} className="text-primary flex-shrink-0" />
                            <span className="truncate">
                              {attraction.city}{attraction.region ? `, ${attraction.region}` : ''}
                            </span>
                          </div>
                        )}
                        {attraction.views > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                            <span>👁️ {attraction.views} vistas</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Indicators */}
              {attractions.length > 4 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: Math.max(0, attractions.length - 3) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setAttractionsCarouselIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === attractionsCarouselIndex
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Ir a posición ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

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
