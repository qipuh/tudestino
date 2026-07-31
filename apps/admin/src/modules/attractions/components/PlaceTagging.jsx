import { useState, useEffect } from 'react';
import { Search, X, MapPin, Building2, Home } from 'lucide-react';
import api from '@services/api';

function PlaceTagging({ tags = [], onChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTags, setSelectedTags] = useState(tags);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchPlaces = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        // Search in both businesses and properties
        const [businessesRes, propertiesRes] = await Promise.all([
          api.get(`/businesses/search?q=${encodeURIComponent(searchTerm)}&limit=5`),
          api.get(`/properties?search=${encodeURIComponent(searchTerm)}&limit=5`),
        ]);

        const businesses = (businessesRes.data?.businesses || []).map((b) => ({
          id: b.id,
          name: b.name,
          type: 'business',
          icon: Building2,
          location: b.address?.city || b.address || '',
        }));

        // /properties devuelve el array directo en `data`, no `data.properties`
        const properties = (propertiesRes.data || []).map((p) => ({
          id: p.id,
          name: p.hotelName || p.propertyName,
          type: 'property',
          icon: Home,
          location: p.addressCity || '',
        }));

        setSearchResults([...businesses, ...properties]);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching places:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleAddTag = (place) => {
    // Check if already tagged
    if (selectedTags.some((tag) => tag.id === place.id && tag.type === place.type)) {
      return;
    }

    const newTags = [...selectedTags, place];
    setSelectedTags(newTags);
    onChange(newTags);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = selectedTags.filter(
      (tag) => !(tag.id === tagToRemove.id && tag.type === tagToRemove.type)
    );
    setSelectedTags(newTags);
    onChange(newTags);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
            placeholder="Buscar negocios o propiedades..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((result, index) => {
              const Icon = result.icon;
              const isAlreadyTagged = selectedTags.some(
                (tag) => tag.id === result.id && tag.type === result.type
              );

              return (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleAddTag(result)}
                  disabled={isAlreadyTagged}
                  className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0 ${
                    isAlreadyTagged ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Icon size={20} className="text-gray-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{result.name}</p>
                    {result.location && (
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <MapPin size={14} />
                        {result.location}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      result.type === 'business'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {result.type === 'business' ? 'Negocio' : 'Propiedad'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {showResults && searchResults.length === 0 && searchTerm.length >= 2 && !isSearching && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
            No se encontraron resultados
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Lugares etiquetados ({selectedTags.length})
          </p>
          <div className="space-y-2">
            {selectedTags.map((tag, index) => {
              const Icon = tag.icon;
              return (
                <div
                  key={`${tag.type}-${tag.id}-${index}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <Icon size={20} className="text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{tag.name}</p>
                    {tag.location && (
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <MapPin size={12} />
                        {tag.location}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      tag.type === 'business'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {tag.type === 'business' ? 'Negocio' : 'Propiedad'}
                  </span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Eliminar etiqueta"
                  >
                    <X size={18} className="text-red-600" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTags.length === 0 && (
        <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MapPin size={40} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">
            No hay lugares etiquetados. Usa el buscador para agregar negocios o propiedades.
          </p>
        </div>
      )}
    </div>
  );
}

export default PlaceTagging;
