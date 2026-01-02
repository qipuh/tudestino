import { useState } from 'react';
import UserAccountLayout from '../../../layouts/UserAccountLayout';
import { User, Camera, MapPin, Calendar, Mail, Phone, ExternalLink, Edit2, X } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

function AccountProfile() {
  const { user } = useAuthStore();
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(user?.username || '');

  const handleSaveUrl = () => {
    // TODO: Implementar guardado de URL personalizada
    console.log('Saving custom URL:', customUrl);
    setShowUrlModal(false);
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
              <a
                href={`https://tudestino.pe/${user?.username || 'rocio'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary-dark border border-primary rounded-lg hover:bg-blue-50 transition"
              >
                <ExternalLink size={16} />
                Ver perfil público
              </a>
              <button
                onClick={() => setShowUrlModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <Edit2 size={16} />
                Cambiar URL
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
                  placeholder="Tu nombre"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  placeholder="Tu apellido"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline mr-2" size={16} />
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+51 999 999 999"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Ciudad
              </label>
              <input
                type="text"
                placeholder="Lima, Perú"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sobre ti
              </label>
              <textarea
                rows={4}
                placeholder="Cuéntanos sobre tus intereses y preferencias de viaje..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="tu-nombre"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tu URL será: <strong>tudestino.pe/{customUrl || 'tu-nombre'}</strong>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUrlModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUrl}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                  disabled={!customUrl}
                >
                  Guardar
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
