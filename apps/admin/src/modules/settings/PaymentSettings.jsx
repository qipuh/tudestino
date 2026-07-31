import { useState, useEffect } from 'react';
import { CreditCard, Save, Eye, EyeOff } from 'lucide-react';
import { settingsService } from '../../services/settings.service';

function PaymentSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [culqiPublicKey, setCulqiPublicKey] = useState('');
  const [culqiSecretKey, setCulqiSecretKey] = useState('');
  const [secretConfigured, setSecretConfigured] = useState(false);
  const [secretMasked, setSecretMasked] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getPaymentSettings();
      setCulqiPublicKey(data.culqiPublicKey || '');
      setSecretConfigured(data.culqiSecretKeyConfigured);
      setSecretMasked(data.culqiSecretKeyMasked);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      setError('Error al cargar la configuración de pagos');
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
      const data = await settingsService.updatePaymentSettings({
        culqiPublicKey,
        // Solo se manda si el admin escribió algo nuevo - así no hace
        // falta repegar el secreto cada vez que solo se cambia la pública.
        culqiSecretKey: culqiSecretKey.trim() || undefined,
      });
      setSecretConfigured(data.culqiSecretKeyConfigured);
      setSecretMasked(data.culqiSecretKeyMasked);
      setCulqiSecretKey('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating payment settings:', err);
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
          <CreditCard size={24} />
          Pasarela de pago
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Configura las llaves de Culqi para procesar cobros de reservas en web y la app móvil.
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
            Llave pública (public key)
          </label>
          <input
            type="text"
            value={culqiPublicKey}
            onChange={(e) => setCulqiPublicKey(e.target.value)}
            placeholder="pk_test_..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se usa en el navegador y la app - no es secreta.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Llave secreta (secret key)
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={culqiSecretKey}
              onChange={(e) => setCulqiSecretKey(e.target.value)}
              placeholder={secretConfigured ? secretMasked : 'sk_test_...'}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {secretConfigured
              ? 'Ya hay una llave secreta configurada. Deja este campo vacío para no cambiarla.'
              : 'Nunca se muestra en texto plano una vez guardada - solo se usa server-side para cobrar.'}
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

export default PaymentSettings;
