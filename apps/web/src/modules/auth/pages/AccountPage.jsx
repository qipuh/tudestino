import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X,
  Lock, Bell, History, Settings, Shield, Globe, CreditCard,
  Camera, LogOut, Trash2, CheckCircle, AlertCircle
} from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import api, { getImageUrl } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

function AccountPage() {
  const { user, updateProfile, loading, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      const result = await api.get('/bookings/my-bookings');
      if (result.success) {
        setBookings(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = await updateProfile(formData);

    if (result.success) {
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } else {
      setError(result.error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const result = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        setSuccess('Contraseña actualizada correctamente');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(result.message || 'Error al actualizar contraseña');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar contraseña');
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError('');

      const formData = new FormData();
      formData.append('avatar', file);

      const result = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (result.success) {
        setSuccess('Foto de perfil actualizada correctamente');
        // Actualizar el usuario en el store
        useAuthStore.setState({
          user: { ...user, avatar: result.data.avatar },
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User, color: 'from-blue-500 to-blue-600' },
    { id: 'security', name: 'Seguridad', icon: Lock, color: 'from-purple-500 to-purple-600' },
    { id: 'bookings', name: 'Reservas', icon: History, color: 'from-green-500 to-green-600' },
    { id: 'notifications', name: 'Notificaciones', icon: Bell, color: 'from-yellow-500 to-yellow-600' },
    { id: 'settings', name: 'Configuración', icon: Settings, color: 'from-gray-500 to-gray-600' },
  ];

  if (!user) {
    return null;
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completada' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Simple Header */}
          <div className="relative px-8 pt-8 pb-4 border-b border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-8 pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-primary">{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-2 border-gray-200">
                  <Camera size={18} className="text-primary" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
                <p className="text-base text-gray-600 mb-3">
                  {user.role === 'host' ? '🏠 Anfitrión' : user.role === 'admin' ? '⭐ Administrador' : user.role === 'business_owner' ? '💼 Empresario' : '✈️ Viajero'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {user.emailVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle size={14} />
                      Email verificado
                    </span>
                  )}
                  {!user.emailVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      <AlertCircle size={14} />
                      Email sin verificar
                    </span>
                  )}
                  {user.createdAt && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      <Calendar size={14} />
                      Desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-sm text-gray-600 mt-1">Publicaciones</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{bookings.length}</div>
                <div className="text-sm text-gray-600 mt-1">Reservas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-sm text-gray-600 mt-1">Reseñas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg hover:shadow-xl transform hover:scale-105`
                    : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm hover:shadow-md'
                }`}
              >
                <Icon size={20} />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg shadow-sm flex items-center gap-3">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === 'profile' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Información personal</h2>
                  <p className="text-gray-600 mt-1">Administra tu información de perfil</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <Edit2 size={18} />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      <X size={18} />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Ciudad, País"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Biografía
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Mail size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</div>
                        <div className="font-medium text-gray-900">{user.email}</div>
                      </div>
                    </div>

                    {user.phone && (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <Phone size={24} className="text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Teléfono</div>
                          <div className="font-medium text-gray-900">{user.phone}</div>
                        </div>
                      </div>
                    )}

                    {user.location && (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <MapPin size={24} className="text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Ubicación</div>
                          <div className="font-medium text-gray-900">{user.location}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <Calendar size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Miembro desde</div>
                        <div className="font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="mt-8 pt-8 border-t-2 border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Sobre mí</h3>
                      <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Seguridad de la cuenta</h2>
                <p className="text-gray-600 mt-1">Protege tu cuenta y mantén tu información segura</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-primary" />
                    Cambiar contraseña
                  </h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contraseña actual
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirmar nueva contraseña
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                      Actualizar contraseña
                    </button>
                  </form>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-primary" />
                    Verificación de identidad
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    {user.emailVerified ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle size={32} className="text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">¡Cuenta verificada!</h4>
                        <p className="text-gray-600">Tu identidad ha sido verificada exitosamente</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle size={32} className="text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Verifica tu cuenta</h4>
                        <p className="text-gray-600 mb-4">Aumenta la seguridad verificando tu identidad</p>
                        <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                          Verificar ahora
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.role === 'host' ? 'Reservas recibidas' : 'Mis reservas'}
                </h2>
                <p className="text-gray-600 mt-1">Administra tus reservas y estadías</p>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History size={48} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes reservas</h3>
                  <p className="text-gray-600 mb-6">Comienza a explorar y reserva tu próxima aventura</p>
                  <button className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Explorar destinos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bookings.map((booking) => {
                    const badge = getStatusBadge(booking.status);
                    return (
                      <div key={booking.id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{booking.property?.title}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin size={14} />
                              {booking.property?.city}, {booking.property?.country}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p className="flex items-center gap-2">
                            <Calendar size={16} />
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                          <p className="flex items-center gap-2">
                            <User size={16} />
                            {booking.guests} huésped{booking.guests > 1 ? 's' : ''}
                          </p>
                        </div>

                        <div className="pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-500 uppercase">Total</span>
                          <span className="text-2xl font-bold text-primary">${Number(booking.totalPrice).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Preferencias de notificaciones</h2>
                <p className="text-gray-600 mt-1">Controla cómo y cuándo te contactamos</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Notificaciones por email', desc: 'Recibe actualizaciones por correo electrónico', checked: true },
                  { title: 'Notificaciones de reservas', desc: 'Recibe notificaciones de nuevas reservas', checked: true },
                  { title: 'Mensajes de chat', desc: 'Recibe notificaciones de nuevos mensajes', checked: true },
                  { title: 'Promociones y ofertas', desc: 'Recibe ofertas especiales y promociones', checked: false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-primary-dark shadow-lg"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Configuración de la cuenta</h2>
                <p className="text-gray-600 mt-1">Personaliza tu experiencia</p>
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-primary" />
                    Idioma y región
                  </h3>
                  <div className="max-w-md">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Idioma preferido</label>
                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
                      <option>Español</option>
                      <option>English</option>
                      <option>Français</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" />
                    Moneda
                  </h3>
                  <div className="max-w-md">
                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white">
                      <option>USD - Dólar estadounidense</option>
                      <option>EUR - Euro</option>
                      <option>MXN - Peso mexicano</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
                  <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                    <Trash2 size={20} />
                    Zona peligrosa
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, está seguro.
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
