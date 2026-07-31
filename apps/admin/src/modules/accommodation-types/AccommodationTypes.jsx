import { useState, useEffect } from 'react';
import { Save, Home } from 'lucide-react';
import api from '../../services/api';

function AccommodationTypes() {
  const [types, setTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/accommodation-types');
      setTypes(response.data || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching accommodation types:', err);
      setError('Error al cargar los tipos de alojamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleLabelChange = (key, label) => {
    setTypes((prev) => ({ ...prev, [key]: { ...prev[key], label } }));
  };

  const handleToggle = (key) => {
    setTypes((prev) => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await api.put('/settings/accommodation-types', { types });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving accommodation types:', err);
      setError('Error al guardar los cambios');
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
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Home size={24} />
          Tipos de Alojamiento
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Edita la etiqueta visible de cada tipo y si aparece como opción al crear una propiedad.
          El conjunto de tipos es fijo a nivel de base de datos - esto controla cómo se muestran, no agrega tipos nuevos.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Cambios guardados correctamente.
        </div>
      )}

      <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
        {Object.entries(types).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4 px-6 py-4">
            <div className="w-32 text-xs font-mono text-gray-400">{key}</div>
            <input
              type="text"
              value={value.label || ''}
              onChange={(e) => handleLabelChange(key, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={!!value.enabled}
                onChange={() => handleToggle(key)}
                className="w-4 h-4"
              />
              Habilitado
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        <Save size={18} />
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}

export default AccommodationTypes;
