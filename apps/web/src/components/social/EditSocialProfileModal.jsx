import { useState, useEffect, useCallback } from 'react';
import { X, Save, Check, Loader } from 'lucide-react';
import { updateSocialProfile, checkUsernameAvailability } from '../../services/socialService';

const TRAVEL_INTERESTS = [
  'Aventura', 'Playa', 'Montaña', 'Cultura', 'Gastronomía',
  'Historia', 'Naturaleza', 'Ciudades', 'Fotografía', 'Deportes',
  'Vida Nocturna', 'Relajación', 'Ecoturismo', 'Familia'
];

const TRAVEL_STYLES = [
  'Mochilero', 'Lujo', 'Familiar', 'Aventurero', 'Cultural',
  'Relajado', 'Económico', 'Todo incluido'
];

function EditSocialProfileModal({ isOpen, onClose, profile, onSave }) {
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    travelBio: '',
    travelInterests: [],
    travelStyle: '',
    isPublicProfile: true,
    allowMessages: true
  });
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [newDestination, setNewDestination] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
        travelBio: profile.travelBio || '',
        travelInterests: profile.travelInterests || [],
        travelStyle: profile.travelStyle || '',
        isPublicProfile: profile.isPublicProfile ?? true,
        allowMessages: profile.allowMessages ?? true
      });
      setDestinations(profile.visitedDestinations || []);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = {
        ...formData,
        visitedDestinations: destinations
      };

      await updateSocialProfile(updates);

      if (onSave) {
        onSave();
      }

      onClose();
    } catch (error) {
      alert('Error al actualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      travelInterests: prev.travelInterests.includes(interest)
        ? prev.travelInterests.filter(i => i !== interest)
        : [...prev.travelInterests, interest]
    }));
  };

  const addDestination = () => {
    if (newDestination.trim() && !destinations.some(d => d.name === newDestination.trim())) {
      setDestinations([...destinations, {
        name: newDestination.trim(),
        visitedAt: new Date().toISOString()
      }]);
      setNewDestination('');
    }
  };

  const removeDestination = (name) => {
    setDestinations(destinations.filter(d => d.name !== name));
  };

  // Debounced username check
  const checkUsername = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    // Don't check if it's the same as current username
    if (profile?.username && username === profile.username) {
      setUsernameAvailable(true);
      return;
    }

    setUsernameChecking(true);
    try {
      const response = await checkUsernameAvailability(username);
      // Handle multiple response formats
      let available = false;
      if (response) {
        available = response.data?.available ?? response.available ?? false;
      }
      setUsernameAvailable(available);
      if (!available) {
        setUsernameError('Este username ya está en uso');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  }, [profile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && formData.username.length >= 3 && !usernameError) {
        checkUsername(formData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, checkUsername, usernameError]);

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, username: value });
    setUsernameAvailable(null);

    if (value.length < 3 && value.length > 0) {
      setUsernameError('El username debe tener al menos 3 caracteres');
    } else if (value.length > 30) {
      setUsernameError('El username no puede exceder 30 caracteres');
    } else {
      setUsernameError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Editar Perfil de Viajero</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario (URL personalizada)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">{window.location.origin}/</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  placeholder="mi-empresa"
                  maxLength={30}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                    usernameError ? 'border-red-500 focus:ring-red-500' :
                    usernameAvailable ? 'border-green-500 focus:ring-green-500' :
                    'border-gray-300 focus:ring-primary'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameChecking ? (
                    <Loader size={16} className="text-gray-400 animate-spin" />
                  ) : usernameAvailable && !usernameError ? (
                    <Check size={16} className="text-green-500" />
                  ) : null}
                </div>
              </div>
            </div>
            {usernameError && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <X size={12} />
                {usernameError}
              </p>
            )}
            {formData.username && !usernameError && usernameAvailable && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Check size={12} />
                Tu perfil estará disponible en: {window.location.origin}/{formData.username}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Solo letras minúsculas, números y guiones. Mínimo 3 caracteres.
            </p>
          </div>

          {/* Bio General */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biografía
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={2}
              maxLength={200}
              placeholder="Describe brevemente quién eres..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
          </div>

          {/* Travel Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biografía de Viajero
            </label>
            <textarea
              value={formData.travelBio}
              onChange={(e) => setFormData({ ...formData, travelBio: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder="Cuéntanos sobre tu pasión por viajar..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.travelBio.length}/500</p>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estilo de Viaje
            </label>
            <select
              value={formData.travelStyle}
              onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona tu estilo</option>
              {TRAVEL_STYLES.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          {/* Travel Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intereses de Viaje
            </label>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    formData.travelInterests.includes(interest)
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Visited Destinations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinos Visitados
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())}
                placeholder="Agrega un destino..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addDestination}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {destinations.map((dest) => (
                <span
                  key={dest.name}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {dest.name}
                  <button
                    type="button"
                    onClick={() => removeDestination(dest.name)}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-gray-900">Configuración de Privacidad</h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublicProfile}
                onChange={(e) => setFormData({ ...formData, isPublicProfile: e.target.checked })}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <div>
                <div className="font-medium">Perfil Público</div>
                <div className="text-sm text-gray-600">Permite que cualquiera vea tu perfil</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowMessages}
                onChange={(e) => setFormData({ ...formData, allowMessages: e.target.checked })}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <div>
                <div className="font-medium">Permitir Mensajes</div>
                <div className="text-sm text-gray-600">Recibe mensajes de usuarios que no sigues</div>
              </div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditSocialProfileModal;
