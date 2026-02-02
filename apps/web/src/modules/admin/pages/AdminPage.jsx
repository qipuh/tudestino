import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Key, Save, Loader, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';
import api from '../../../services/api';
import useAuthStore from '../../../store/authStore';

/**
 * Página de administración para configurar APIs externas
 */
function AdminPage() {
  const { user } = useAuthStore();
  const [whatsappToken, setWhatsappToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@tudestino.com';

  useEffect(() => {
    if (isAdmin) {
      loadConfig();
    }
  }, [isAdmin]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/config/whatsapp');
      setWhatsappToken(response.token || '');
    } catch (error) {
      console.error('Error loading config:', error);
      // Si no existe configuración, es normal
      setWhatsappToken('');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!whatsappToken.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa el token de WhatsApp API' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/admin/config/whatsapp', {
        token: whatsappToken.trim()
      });

      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar la configuración'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página. Esta área es solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Configura las integraciones y APIs del sistema</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Link
            to="/admin/verifications"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Verificaciones de Identidad</h3>
                <p className="text-sm text-gray-600">Revisar solicitudes pendientes</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Aprueba o rechaza las solicitudes de verificación de identidad de los usuarios
            </p>
          </Link>
        </div>

        {/* WhatsApp API Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Key size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">WhatsApp API (Factiliza)</h2>
              <p className="text-sm text-gray-600">Configura el token de autenticación para el servicio de mensajería</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="whatsappToken" className="block text-sm font-medium text-gray-700 mb-2">
                Token de API
              </label>
              <textarea
                id="whatsappToken"
                value={whatsappToken}
                onChange={(e) => setWhatsappToken(e.target.value)}
                placeholder="Ingresa el token JWT de Factiliza..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none font-mono text-sm"
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">
                Este token se utiliza para autenticar las solicitudes a la API de WhatsApp de Factiliza
              </p>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`flex items-center gap-2 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || !whatsappToken.trim()}
              className={`
                w-full py-3 px-6 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2
                ${saving || !whatsappToken.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg'
                }
              `}
            >
              {saving ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar Configuración
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• El token se almacena de forma segura en la base de datos</li>
            <li>• Los cambios se aplican inmediatamente en todo el sistema</li>
            <li>• Asegúrate de usar un token válido de Factiliza</li>
            <li>• El token debe tener permisos de consultor o superior</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
