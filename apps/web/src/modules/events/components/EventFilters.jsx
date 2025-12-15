import { Search, Filter, X, Calendar } from 'lucide-react';
import { useState } from 'react';

const EVENT_CATEGORIES = {
  concert: 'Concierto',
  festival: 'Festival',
  conference: 'Conferencia',
  congress: 'Congreso',
  fair: 'Feria',
  exhibition: 'Exposición',
  workshop: 'Taller',
  seminar: 'Seminario',
  religious: 'Religioso',
  patronal_feast: 'Fiesta Patronal',
  carnival: 'Carnaval',
  sports: 'Deportivo',
  cultural: 'Cultural',
  gastronomic: 'Gastronómico',
  theater: 'Teatro',
  dance: 'Danza',
  art: 'Arte',
  business: 'Empresarial',
  networking: 'Networking',
  charity: 'Benéfico',
  educational: 'Educativo',
  family: 'Familiar',
  nightlife: 'Vida Nocturna'
};

function EventFilters({ filters, onFiltersChange }) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e) => {
    onFiltersChange({ ...filters, city: e.target.value });
  };

  const handleCategoryToggle = (category) => {
    const categories = filters.category || [];
    const updated = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category];
    onFiltersChange({ ...filters, category: updated });
  };

  const handleLocationTypeToggle = (type) => {
    onFiltersChange({
      ...filters,
      locationType: filters.locationType === type ? null : type
    });
  };

  const handleDateChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleFreeToggle = () => {
    onFiltersChange({ ...filters, isFree: !filters.isFree });
  };

  const clearFilters = () => {
    onFiltersChange({
      city: '',
      category: [],
      locationType: null,
      startDate: null,
      endDate: null,
      isFree: false
    });
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.city) count++;
    if (filters.category?.length > 0) count += filters.category.length;
    if (filters.locationType) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.isFree) count++;
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
            placeholder="Buscar eventos por ciudad..."
            value={filters.city || ''}
            onChange={handleSearchChange}
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
          {/* Fechas */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={20} />
              Fechas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Desde</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Hasta</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Categorías</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Object.entries(EVENT_CATEGORIES).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryToggle(key)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm transition-colors ${
                    filters.category?.includes(key)
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de ubicación */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Tipo de Evento</h4>
            <div className="flex gap-3">
              <button
                onClick={() => handleLocationTypeToggle('physical')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                  filters.locationType === 'physical'
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">Presencial</div>
                  <div className="text-sm opacity-80">En persona</div>
                </div>
              </button>

              <button
                onClick={() => handleLocationTypeToggle('virtual')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                  filters.locationType === 'virtual'
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">Virtual</div>
                  <div className="text-sm opacity-80">Online</div>
                </div>
              </button>

              <button
                onClick={() => handleLocationTypeToggle('hybrid')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                  filters.locationType === 'hybrid'
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 hover:border-primary'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">Híbrido</div>
                  <div className="text-sm opacity-80">Ambos</div>
                </div>
              </button>
            </div>
          </div>

          {/* Precio */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Precio</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.isFree || false}
                onChange={handleFreeToggle}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <span className="text-gray-700">Solo eventos gratuitos</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventFilters;
