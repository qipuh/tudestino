import { useState, useEffect, useCallback } from 'react';
import { X, Save, Check, Loader, User, MapPin, Heart, Globe, Lock, Mail, Search } from 'lucide-react';
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
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

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

  // Buscar ubicaciones usando Nominatim (OpenStreetMap)
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    setLoadingLocations(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();

      const suggestions = data.map(item => ({
        name: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        country: item.address?.country,
      }));

      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleSelectLocation = (locationName) => {
    if (!destinations.some(d => d.name === locationName)) {
      setDestinations([...destinations, {
        name: locationName,
        visitedAt: new Date().toISOString()
      }]);
    }
    setNewDestination('');
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  // Debounce para buscar ubicaciones
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(newDestination);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [newDestination]);

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
      // response is {success, available, message}
      const available = response?.available ?? false;

      setUsernameAvailable(available);

      if (!available) {
        setUsernameError('Este username ya está en uso');
      } else {
        setUsernameError(''); // Clear error if available
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
      setUsernameError('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Editar Perfil de Viajero</h2>
              <p className="text-sm text-gray-500">Personaliza tu información de viajero</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Username Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={18} className="text-primary" />
              <label className="text-sm font-semibold text-gray-900">
                URL Personalizada
              </label>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-500 text-sm font-medium">{window.location.origin}/</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  placeholder="tu-nombre"
                  maxLength={30}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    usernameError ? 'border-red-300 bg-red-50 focus:ring-red-200' :
                    usernameAvailable && formData.username ? 'border-green-300 bg-green-50 focus:ring-green-200' :
                    'border-gray-300 bg-white focus:ring-primary/20'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameChecking ? (
                    <Loader size={18} className="text-primary animate-spin" />
                  ) : usernameAvailable && formData.username && !usernameError ? (
                    <div className="bg-green-100 rounded-full p-1">
                      <Check size={14} className="text-green-600" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {usernameError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
                <p className="text-xs text-red-700 flex items-center gap-2">
                  <X size={14} />
                  {usernameError}
                </p>
              </div>
            )}
            {formData.username && !usernameError && usernameAvailable && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-2">
                <p className="text-xs text-green-700 flex items-center gap-2">
                  <Check size={14} />
                  <span className="font-medium">Disponible:</span>
                  <span className="font-mono">{window.location.origin}/{formData.username}</span>
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Mail size={12} />
              Solo letras minúsculas, números y guiones (mínimo 3 caracteres)
            </p>
          </div>

          {/* About You Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <User size={18} className="text-primary" />
              <h3 className="font-semibold text-gray-900">Acerca de ti</h3>
            </div>

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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">Una breve descripción personal</p>
                <p className={`text-xs font-medium ${formData.bio.length > 180 ? 'text-orange-500' : 'text-gray-500'}`}>
                  {formData.bio.length}/200
                </p>
              </div>
            </div>
          </div>

          {/* Travel Preferences Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Globe size={18} className="text-primary" />
              <h3 className="font-semibold text-gray-900">Preferencias de Viaje</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estilo de Viaje
              </label>
              <select
                value={formData.travelStyle}
                onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              >
                <option value="">Selecciona tu estilo preferido</option>
                {TRAVEL_STYLES.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-primary" />
                  <span>Intereses de Viaje</span>
                </div>
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.travelInterests.includes(interest)
                        ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Selecciona tus intereses favoritos</p>
            </div>
          </div>

          {/* Destinations Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <MapPin size={18} className="text-primary" />
              <h3 className="font-semibold text-gray-900">Destinos Visitados</h3>
            </div>

            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())}
                    onFocus={() => newDestination.length >= 3 && setShowLocationSuggestions(true)}
                    placeholder="Ej: París, Machu Picchu, Tokio..."
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  {loadingLocations && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader size={18} className="text-primary animate-spin" />
                    </div>
                  )}
                  {!loadingLocations && newDestination && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Search size={18} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={addDestination}
                  disabled={!newDestination.trim()}
                  className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                  Agregar
                </button>
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectLocation(suggestion.name)}
                      className="w-full px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                    >
                      <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.city || suggestion.name.split(',')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin size={12} />
              Escribe al menos 3 caracteres para buscar destinos
            </p>

            {destinations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {destinations.map((dest) => (
                  <span
                    key={dest.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <MapPin size={14} />
                    {dest.name}
                    <button
                      type="button"
                      onClick={() => removeDestination(dest.name)}
                      className="hover:text-blue-900 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <MapPin size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Aún no has agregado destinos</p>
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Lock size={18} className="text-primary" />
              <h3 className="font-semibold text-gray-900">Configuración de Privacidad</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 border-gray-200 hover:border-primary/50 transition-all bg-white">
                <input
                  type="checkbox"
                  checked={formData.isPublicProfile}
                  onChange={(e) => setFormData({ ...formData, isPublicProfile: e.target.checked })}
                  className="w-5 h-5 text-primary rounded focus:ring-primary mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <Globe size={16} className="text-primary" />
                    Perfil Público
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Permite que cualquier usuario pueda ver tu perfil y publicaciones
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border-2 border-gray-200 hover:border-primary/50 transition-all bg-white">
                <input
                  type="checkbox"
                  checked={formData.allowMessages}
                  onChange={(e) => setFormData({ ...formData, allowMessages: e.target.checked })}
                  className="w-5 h-5 text-primary rounded focus:ring-primary mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    Permitir Mensajes
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Recibe mensajes directos de usuarios que no sigues
                  </div>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            Los cambios se guardarán en tu perfil público
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 transition-all font-medium text-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || usernameChecking}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditSocialProfileModal;
