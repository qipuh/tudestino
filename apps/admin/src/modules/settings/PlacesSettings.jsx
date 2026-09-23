import { useState, useEffect } from 'react';
import { MapPin, Save, Eye, EyeOff } from 'lucide-react';
import { settingsService } from '../../services/settings.service';

const FIELDS = [
  {
    key: 'geoapifyApiKey',
    label: 'Geoapify - API Key',
    placeholder: 'd1438097...',
    help: 'geoapify.com > My Projects > API keys. Usada para geocoding y búsqueda de lugares (hoteles, restaurantes).',
  },
  {
    key: 'foursquareServiceApiKey',
    label: 'Foursquare - Service API Key',
    placeholder: 'UB4BVGE...',
    help: 'foursquare.com/developer > Settings > Service API Keys. Autentica llamadas a Places API.',
  },
  {
    key: 'foursquareClientId',
    label: 'Foursquare - Client ID',
    placeholder: 'BIV3HJZ...',
    help: 'Usado junto al Client Secret para OAuth (Legacy API).',
  },
  {
    key: 'foursquareClientSecret',
    label: 'Foursquare - Client Secret',
    placeholder: '3XOI5PU...',
    help: 'Nunca se expone al cliente.',
  },
  {
    key: 'foursquareApiKey',
    label: 'Foursquare - API Key (Legacy)',
    placeholder: 'fsq3...',
    help: 'Legacy API Key, usada por el Map SDK y la Legacy Places API.',
  },
];

function PlacesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [visibleFields, setVisibleFields] = useState({});

  const [values, setValues] = useState({});
  const [status, setStatus] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getPlacesSettings();
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching places settings:', err);
      setError('Error al cargar la configuración de lugares');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisible = (key) => {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const payload = {};
      FIELDS.forEach(({ key }) => {
        const v = values[key];
        if (v && v.trim()) payload[key] = v.trim();
      });
      const data = await settingsService.updatePlacesSettings(payload);
      setStatus(data);
      setValues({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating places settings:', err);
      setError(err.response?.data?.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin size={24} />
          Lugares (Geoapify + Foursquare)
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Credenciales usadas server-side para buscar hoteles y restaurantes reales. Nunca se exponen a web/mobile.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Configuración guardada correctamente.
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-5">
        {FIELDS.map(({ key, label, placeholder, help }) => {
          const configured = status[`${key}Configured`];
          const masked = status[`${key}Masked`];
          const visible = !!visibleFields[key];
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <input
                  type={visible ? 'text' : 'password'}
                  value={values[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={configured ? masked : placeholder}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => toggleVisible(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {configured ? 'Ya hay un valor configurado. Deja el campo vacío para no cambiarlo. ' : ''}
                {help}
              </p>
            </div>
          );
        })}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

export default PlacesSettings;
