import { useState } from 'react';
import { Search, Download, MapPin, Phone, Globe, CheckSquare, Square, Image, AtSign, BadgeCheck } from 'lucide-react';
import { placesService } from '../../services/places.service';
import locationsService from '../../services/locationsService';
import LocationPicker from '../../components/LocationPicker';

const TYPE_LABELS = {
  hotel: 'Hoteles',
  restaurant: 'Restaurantes',
  travel_agency: 'Agencias de viaje',
  tour_guide: 'Guías de turismo',
};

// Geoapify/Foursquare solo cubren hotel y restaurant (búsqueda por radio).
// Agencias y guías solo existen en el directorio oficial MINCETUR.
const RADIUS_TYPES = new Set(['hotel', 'restaurant']);

const DESTINATION_LABEL = {
  hotel: 'Propiedades',
  restaurant: 'Restaurantes',
  travel_agency: 'Negocios',
  tour_guide: 'Negocios',
};

function PlacesImport() {
  const [type, setType] = useState('hotel');
  const [location, setLocation] = useState({});
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(new Set());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.districtId) {
      setError('Selecciona departamento, provincia y distrito');
      return;
    }
    setSearching(true);
    setError(null);
    setNotice(null);
    setResults([]);
    setSelected(new Set());

    try {
      const district = await locationsService.getDistrictById(location.districtId);
      const { latitude, longitude, code } = district.data;

      const data = await placesService.search({
        type,
        lat: RADIUS_TYPES.has(type) ? latitude : undefined,
        lon: RADIUS_TYPES.has(type) ? longitude : undefined,
        ubigeoCode: code,
      });
      setResults(data.results);
      setSelected(new Set(data.results.map((_, i) => i)));
      if (data.errors?.length) {
        setNotice(`Alguna fuente falló: ${data.errors.join(' | ')}`);
      }
    } catch (err) {
      console.error('Error searching places:', err);
      setError(err.response?.data?.message || err.message || 'Error al buscar lugares');
    } finally {
      setSearching(false);
    }
  };

  const toggleSelected = (index) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map((_, i) => i)));
  };

  const handleImport = async () => {
    const places = results.filter((_, i) => selected.has(i));
    if (places.length === 0) return;
    setImporting(true);
    setError(null);
    setNotice(null);

    try {
      const data = await placesService.importPlaces({ type, places });
      setNotice(
        `${data.createdCount} lugares importados y publicados. Complétalos en ${DESTINATION_LABEL[type]} (precios/habitaciones/menú según corresponda).` +
          (data.skipped?.length ? ` ${data.skipped.length} omitidos por error.` : '')
      );
      setResults((prev) => prev.filter((_, i) => !selected.has(i)));
      setSelected(new Set());
    } catch (err) {
      console.error('Error importing places:', err);
      setError(err.response?.data?.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Search size={24} />
          Importar negocios turísticos
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Busca en Geoapify + Foursquare (hoteles/restaurantes) y en el directorio oficial MINCETUR
          (hoteles/restaurantes/agencias/guías) y créalos publicados directo. Sin
          precios/habitaciones/menú aún no son reservables - complétalos después.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      {notice && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">{notice}</div>
      )}

      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-4 space-y-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {!RADIUS_TYPES.has(type) && (
            <p className="text-xs text-gray-500 mt-1">Solo disponible vía directorio oficial MINCETUR.</p>
          )}
        </div>

        <LocationPicker value={location} onChange={setLocation} label="Ubicación (ubigeo)" required />

        <button
          type="submit"
          disabled={searching || !location.districtId}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Search size={18} />
          {searching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
            >
              {selected.size === results.length ? <CheckSquare size={18} /> : <Square size={18} />}
              {selected.size} de {results.length} seleccionados
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || selected.size === 0}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              <Download size={18} />
              {importing ? 'Importando...' : `Importar ${selected.size} y publicar`}
            </button>
          </div>

          <ul className="divide-y">
            {results.map((place, i) => (
              <li key={i} className="p-4 flex items-start gap-3">
                <button type="button" onClick={() => toggleSelected(i)} className="mt-0.5 text-gray-500">
                  {selected.has(i) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                </button>
                <div className="flex-1">
                  {place.photoUrl ? (
                    <img
                      src={place.photoUrl}
                      alt={place.name}
                      className="w-14 h-14 rounded object-cover float-right ml-3"
                    />
                  ) : null}
                  <div className="font-medium text-gray-900 flex items-center gap-1.5">
                    {place.name}
                    {place.sources?.includes('mincetur') && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        <BadgeCheck size={11} /> Oficial MINCETUR
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                    <MapPin size={14} />
                    {[place.street, place.city, place.country].filter(Boolean).join(', ') || 'Sin dirección'}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                        place.photoUrl ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Image size={12} /> Foto
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                        place.website ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Globe size={12} /> Web
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                        place.social?.instagram || place.social?.facebook || place.social?.twitter
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <AtSign size={12} /> Redes
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                        place.phone ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Phone size={12} /> Teléfono
                    </span>
                  </div>

                  <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                    {place.phone && <span>{place.phone}</span>}
                    {place.website && <span>{place.website}</span>}
                    <span className="uppercase tracking-wide text-gray-400 ml-auto">
                      {place.sources?.join(' + ')}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PlacesImport;
