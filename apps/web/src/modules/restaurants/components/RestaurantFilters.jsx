import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

const CUISINE_TYPES = [
  'Pizza',
  'Pasta',
  'Mariscos',
  'Pescados',
  'Carnes',
  'Pollos',
  'Comida China',
  'Comida Japonesa',
  'Comida Italiana',
  'Comida Peruana',
  'Comida Mexicana',
  'Hamburguesas',
  'Vegetariana',
  'Vegana',
  'Postres',
  'Café'
];

const DIETARY_OPTIONS = [
  'Vegetariano',
  'Vegano',
  'Sin Gluten',
  'Sin Lácteos',
  'Kosher',
  'Halal'
];

function RestaurantFilters({ filters, onFiltersChange }) {
  const [showFilters, setShowFilters] = useState(false);

  const handleCityChange = (e) => {
    onFiltersChange({ ...filters, city: e.target.value });
  };

  const handleCuisineToggle = (cuisine) => {
    const cuisineTypes = filters.cuisineTypes || [];
    const updated = cuisineTypes.includes(cuisine)
      ? cuisineTypes.filter(c => c !== cuisine)
      : [...cuisineTypes, cuisine];
    onFiltersChange({ ...filters, cuisineTypes: updated });
  };

  const handleDietaryToggle = (option) => {
    const dietaryOptions = filters.dietaryOptions || [];
    const updated = dietaryOptions.includes(option)
      ? dietaryOptions.filter(o => o !== option)
      : [...dietaryOptions, option];
    onFiltersChange({ ...filters, dietaryOptions: updated });
  };

  const handlePriceRangeChange = (range) => {
    onFiltersChange({
      ...filters,
      priceRange: filters.priceRange === range ? null : range
    });
  };

  const handleMinRatingChange = (rating) => {
    onFiltersChange({
      ...filters,
      minRating: filters.minRating === rating ? null : rating
    });
  };

  const handleServiceToggle = (service) => {
    onFiltersChange({ ...filters, [service]: !filters[service] });
  };

  const clearFilters = () => {
    onFiltersChange({
      city: '',
      cuisineTypes: [],
      dietaryOptions: [],
      priceRange: null,
      minRating: null,
      hasDelivery: false,
      hasTakeout: false,
      acceptsReservations: false
    });
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.city) count++;
    if (filters.cuisineTypes?.length > 0) count += filters.cuisineTypes.length;
    if (filters.dietaryOptions?.length > 0) count += filters.dietaryOptions.length;
    if (filters.priceRange) count++;
    if (filters.minRating) count++;
    if (filters.hasDelivery || filters.hasTakeout || filters.acceptsReservations) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Búsqueda principal */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por ciudad..."
            value={filters.city || ''}
            onChange={handleCityChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center gap-2 ${
            showFilters
              ? 'border-primary bg-primary text-white'
              : 'border-gray-300 hover:border-primary'
          }`}
        >
          <Filter size={20} />
          <span>Filtros</span>
          {activeFiltersCount() > 0 && (
            <span className="bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
              {activeFiltersCount()}
            </span>
          )}
        </button>

        {activeFiltersCount() > 0 && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors flex items-center gap-2"
          >
            <X size={20} />
            Limpiar
          </button>
        )}
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-6">
          {/* Tipo de cocina */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Tipo de Cocina</h4>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineToggle(cuisine)}
                  className={`px-3 py-1.5 rounded-full border-2 text-sm transition-colors ${
                    filters.cuisineTypes?.includes(cuisine)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Opciones dietéticas */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Opciones Dietéticas</h4>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(option => (
                <button
                  key={option}
                  onClick={() => handleDietaryToggle(option)}
                  className={`px-3 py-1.5 rounded-full border-2 text-sm transition-colors ${
                    filters.dietaryOptions?.includes(option)
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rango de precio */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Rango de Precio</h4>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(range => (
                  <button
                    key={range}
                    onClick={() => handlePriceRangeChange(range)}
                    className={`w-full px-4 py-2 rounded-lg border-2 text-left transition-colors ${
                      filters.priceRange === range
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <span className="font-semibold">{'$'.repeat(range)}</span>
                    <span className="ml-2 text-sm">
                      {range === 1 && 'Económico'}
                      {range === 2 && 'Moderado'}
                      {range === 3 && 'Caro'}
                      {range === 4 && 'Muy Caro'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calificación mínima */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Calificación Mínima</h4>
              <div className="space-y-2">
                {[4.5, 4.0, 3.5, 3.0].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleMinRatingChange(rating)}
                    className={`w-full px-4 py-2 rounded-lg border-2 text-left transition-colors ${
                      filters.minRating === rating
                        ? 'border-yellow-500 bg-yellow-500 text-white'
                        : 'border-gray-300 hover:border-yellow-500'
                    }`}
                  >
                    ⭐ {rating}+ estrellas
                  </button>
                ))}
              </div>
            </div>

            {/* Servicios */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Servicios</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.acceptsReservations || false}
                    onChange={() => handleServiceToggle('acceptsReservations')}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span>Acepta Reservas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasDelivery || false}
                    onChange={() => handleServiceToggle('hasDelivery')}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span>Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasTakeout || false}
                    onChange={() => handleServiceToggle('hasTakeout')}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span>Para Llevar</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantFilters;
