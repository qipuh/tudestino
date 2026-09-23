import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

/**
 * Buscador de ubicación con autocompletado vía Nominatim (OpenStreetMap,
 * gratuito, sin API key) - mismo patrón que SearchHero en el home, para
 * poder cambiar de ciudad/departamento/distrito directo desde los filtros
 * de resultados sin volver al home.
 */
function LocationAutocomplete({ value, onSelect, placeholder = 'Ciudad, departamento o distrito...' }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3 || query === value) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${query}, Perú`
          )}&limit=6&addressdetails=1&countrycodes=pe`
        );
        const data = await response.json();
        setSuggestions(
          data.map((item) => ({
            name: item.display_name,
            city: item.address?.city || item.address?.town || item.address?.village || item.address?.county,
            state: item.address?.state,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          }))
        );
      } catch (err) {
        console.error('Error searching locations:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (suggestion) => {
    const label = [suggestion.city, suggestion.state].filter(Boolean).join(', ') || suggestion.name;
    setQuery(label);
    setSuggestions([]);
    setOpen(false);
    onSelect({ label, lat: suggestion.lat, lon: suggestion.lon });
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onSelect({ label: '', lat: null, lon: null });
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {loading ? (
          <Loader2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
        ) : (
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-start gap-2 border-b last:border-0"
            >
              <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <span className="truncate">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationAutocomplete;
