import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import UserAccountLayout from '../../../layouts/UserAccountLayout';
import { User, Camera, MapPin, Calendar, Mail, Phone, ExternalLink, Edit2, X, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import api from '../../../services/api';
import { useSidebar } from '../../../contexts/SidebarContext';
import useVerification from '../../../hooks/useVerification';

function AccountProfile() {
  const { user, setUser } = useAuthStore();
  const { setSidebarVisible } = useSidebar();
  const { isVerified, status, loading: verificationLoading } = useVerification();
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(user?.username || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Disable sidebar on this page
  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Actualizar usuario con nuevo avatar
      const avatarUrl = response.data?.avatar;
      if (avatarUrl) {
        const updatedUser = {
          ...user,
          avatar: avatarUrl,
        };
        setUser(updatedUser);
        alert('✓ Foto de perfil actualizada exitosamente!');
      }
    } catch (err) {
      console.error('Error al subir avatar:', err);
      alert('Error al subir la foto. Por favor intenta de nuevo.');
    } finally {
      setUploadingAvatar(false);
      // Limpiar el input para permitir subir la misma imagen de nuevo
      if (event.target) {
        event.target.value = '';
      }
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

        {/* Verification Status */}
        {!verificationLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de Verificación</h2>
            {isVerified && status === 'verified' ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">Identidad Verificada</p>
                  <p className="text-sm text-green-700">
                    Tu identidad ha sido verificada. Tienes acceso completo a la plataforma.
                  </p>
                </div>
              </div>
            ) : status === 'pending' ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <Clock className="text-blue-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">Verificación en Proceso</p>
                  <p className="text-sm text-blue-700">
                    Estamos revisando tu documentación. Te notificaremos cuando sea aprobada.
                  </p>
                </div>
              </div>
            ) : status === 'rejected' ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <XCircle className="text-red-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Verificación Rechazada</p>
                  <p className="text-sm text-red-700 mb-3">
                    Tu solicitud de verificación fue rechazada. Puedes volver a intentarlo.
                  </p>
                  <Link
                    to="/verify-identity"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    Reintentar Verificación
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <Clock className="text-yellow-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900">Identidad No Verificada</p>
                  <p className="text-sm text-yellow-700 mb-3">
                    Verifica tu identidad para acceder a todas las funcionalidades como reservas y mensajes.
                  </p>
                  <Link
                    to="/verify-identity"
                    className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                  >
                    Verificar mi Identidad
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Photo Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Foto de Perfil</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_SERVER_URL}${user.avatar}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={40} />
                </div>
              )}
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingAvatar ? (
                  <Loader2 size={16} className="text-gray-600 animate-spin" />
                ) : (
                  <Camera size={16} className="text-gray-600" />
                )}
              </button>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Actualiza tu foto</h3>
              <p className="text-sm text-gray-600 mb-3">
                Una foto de perfil clara ayuda a los anfitriones a reconocerte
              </p>
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="text-sm text-primary hover:text-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingAvatar ? 'Subiendo...' : 'Subir nueva foto'}
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
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
