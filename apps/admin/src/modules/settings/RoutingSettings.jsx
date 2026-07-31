import { useState, useEffect } from 'react';
import { Map, Save, Eye, EyeOff } from 'lucide-react';
import { settingsService } from '../../services/settings.service';

function RoutingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const [orsApiKey, setOrsApiKey] = useState('');
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [keyMasked, setKeyMasked] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getRoutingSettings();
      setKeyConfigured(data.orsApiKeyConfigured);
      setKeyMasked(data.orsApiKeyMasked);
      setError(null);
    } catch (err) {
      console.error('Error fetching routing settings:', err);
      setError('Error al cargar la configuración de ruteo');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const data = await settingsService.updateRoutingSettings({
        orsApiKey: orsApiKey.trim() || undefined,
      });
      setKeyConfigured(data.orsApiKeyConfigured);
      setKeyMasked(data.orsApiKeyMasked);
      setOrsApiKey('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating routing settings:', err);
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
          <Map size={24} />
          Ruteo (OpenRouteService)
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Llave de OpenRouteService usada para buscar destinos y calcular rutas/alternas en la app móvil.
          Plan gratuito: 2500 solicitudes/día compartidas entre búsqueda y ruteo.
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API key de OpenRouteService
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={orsApiKey}
              onChange={(e) => setOrsApiKey(e.target.value)}
              placeholder={keyConfigured ? keyMasked : 'eyJvcmci...'}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {keyConfigured
              ? 'Ya hay una llave configurada. Deja este campo vacío para no cambiarla.'
              : 'Se obtiene gratis creando una cuenta en openrouteservice.org (Dashboard > Request a token). Nunca se expone al móvil - el backend la usa server-side para todas las llamadas.'}
          </p>
        </div>

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

export default RoutingSettings;
