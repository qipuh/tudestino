import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantFilters from '../components/RestaurantFilters';
import { Loader2 } from 'lucide-react';

function RestaurantsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    cuisineTypes: [],
    dietaryOptions: [],
    priceRange: null,
    minRating: null,
    hasDelivery: false,
    hasTakeout: false,
    acceptsReservations: false
  });

  useEffect(() => {
    fetchRestaurants();
  }, [filters, pagination.page]);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20'
      });

      if (filters.city) queryParams.set('city', filters.city);
      if (filters.cuisineTypes?.length > 0) {
        queryParams.set('cuisineTypes', JSON.stringify(filters.cuisineTypes));
      }
      if (filters.dietaryOptions?.length > 0) {
        queryParams.set('dietaryOptions', JSON.stringify(filters.dietaryOptions));
      }
      if (filters.priceRange) queryParams.set('priceRange', filters.priceRange.toString());
      if (filters.minRating) queryParams.set('minRating', filters.minRating.toString());
      if (filters.hasDelivery) queryParams.set('hasDelivery', 'true');
      if (filters.hasTakeout) queryParams.set('hasTakeout', 'true');
      if (filters.acceptsReservations) queryParams.set('acceptsReservations', 'true');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/restaurants/search?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar restaurantes');
      }

      const data = await response.json();
      setRestaurants(data.restaurants || []);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));

    // Actualizar URL con filtros
    const params = new URLSearchParams();
    if (newFilters.city) params.set('city', newFilters.city);
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Descubre Restaurantes
          </h1>
          <p className="text-gray-600">
            Encuentra los mejores lugares para comer cerca de ti
          </p>
        </div>

        {/* Filtros */}
        <RestaurantFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {/* Resultados count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {pagination.total === 0 ? (
                  'No se encontraron restaurantes'
                ) : (
                  <>
                    Mostrando {restaurants.length} de {pagination.total} restaurantes
                  </>
                )}
              </p>
            </div>

            {/* Lista de restaurantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {restaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Mostrar solo algunas páginas alrededor de la actual
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 2 && page <= pagination.page + 2)
                      );
                    })
                    .map((page, index, array) => {
                      // Agregar "..." si hay saltos
                      const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                      return (
                        <div key={page} className="flex gap-2">
                          {showEllipsis && (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg ${
                              pagination.page === page
                                ? 'bg-primary text-white'
                                : 'border hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No se encontraron restaurantes
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros o buscar en otra ciudad
            </p>
            <button
              onClick={() => handleFiltersChange({
                city: '',
                cuisineTypes: [],
                dietaryOptions: [],
                priceRange: null,
                minRating: null,
                hasDelivery: false,
                hasTakeout: false,
                acceptsReservations: false
              })}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantsListPage;
