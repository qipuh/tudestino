import { useState } from 'react';
import UserAccountLayout from '../../../layouts/UserAccountLayout';
import { User, Camera, MapPin, Calendar, Mail, Phone, ExternalLink, Edit2, X, Loader2 } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import api from '../../../services/api';

function AccountProfile() {
  const { user, setUser } = useAuthStore();
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSaveUrl = async () => {
    if (!customUrl || customUrl.length < 3) {
      setError('La URL debe tener al menos 3 caracteres');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await api.patch('/users/me', {
        username: customUrl
      });

      console.log('✅ Response from API:', response.data);

      // La respuesta viene directamente en response.data (no en response.data.user)
      // porque el interceptor de axios ya extrae la propiedad 'data'
      const userData = response.data;

      console.log('📋 userData:', userData);
      console.log('🔍 userData.username:', userData.username);
      console.log('👤 Usuario actual antes del merge:', user);

      // Actualizar el usuario en el store - hacer merge completo
      if (userData?.id) {
        // Hacer merge del usuario actual con los nuevos datos
        const updatedUser = {
          ...user,
          ...userData
        };

        console.log('✨ Updated user después del merge:', updatedUser);
        console.log('🎯 updatedUser.username:', updatedUser.username);

        setUser(updatedUser);

        // Forzar actualización del estado local también
        setCustomUrl(userData.username);
      } else {
        console.error('❌ No hay datos de usuario en la respuesta!');
      }

      setShowUrlModal(false);

      // Mostrar mensaje de éxito
      alert('✓ URL personalizada guardada exitosamente!');
    } catch (err) {
      console.error('Error al guardar URL:', err);
      setError(err.response?.data?.message || 'Error al guardar la URL. Puede que ya esté en uso.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserAccountLayout activeMenu="profile">
      <div className="max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil de Viajero</h1>
              <p className="text-gray-600 mt-1">
                Gestiona tu información personal y preferencias de viaje
              </p>
            </div>
            <div className="flex gap-2">
              {user?.username ? (
                <a
                  href={`/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary-dark border border-primary rounded-lg hover:bg-blue-50 transition"
                >
                  <ExternalLink size={16} />
                  Ver perfil público
                </a>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 border border-gray-300 rounded-lg bg-gray-50">
                  <ExternalLink size={16} />
                  Configura tu URL primero
                </div>
              )}
              <button
                onClick={() => setShowUrlModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <Edit2 size={16} />
                {user?.username ? 'Cambiar URL' : 'Configurar URL'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Photo Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Foto de Perfil</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={40} />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition">
                <Camera size={16} className="text-gray-600" />
              </button>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Actualiza tu foto</h3>
              <p className="text-sm text-gray-600 mb-3">
                Una foto de perfil clara ayuda a los anfitriones a reconocerte
              </p>
              <button className="text-sm text-primary hover:text-primary-dark font-medium">
                Subir nueva foto
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value=""
                  placeholder="Tu apellido"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline mr-2" size={16} />
                Correo Electrónico
              </label>
              <input
                type="email"
                value={user?.email || ''}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline mr-2" size={16} />
                Teléfono
              </label>
              <input
                type="tel"
                value={user?.phone || ''}
                placeholder="+51 999 999 999"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={user?.dateOfBirth || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Ciudad
              </label>
              <input
                type="text"
                value={user?.location || ''}
                placeholder="Lima, Perú"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sobre ti
              </label>
              <textarea
                rows={4}
                value={user?.bio || ''}
                placeholder="Cuéntanos sobre tus intereses y preferencias de viaje..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* URL Personalizada Modal */}
        {showUrlModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Cambiar URL Personalizada</h3>
                <button
                  onClick={() => setShowUrlModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Personaliza la URL de tu perfil público. Solo puedes usar letras, números y guiones.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Personalizada
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">tudestino.pe/</span>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setError('');
                    }}
                    placeholder="tu-nombre"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tu URL será: <strong>tudestino.pe/{customUrl || 'tu-nombre'}</strong>
                </p>
                {error && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <X size={12} />
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUrlModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUrl}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={!customUrl || saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserAccountLayout>
  );
}

export default AccountProfile;
