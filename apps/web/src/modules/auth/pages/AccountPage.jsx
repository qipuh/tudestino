import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X,
  Lock, Bell, CreditCard, History, Settings, Home
} from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import api from '../../../services/api';

function AccountPage() {
  const { user, updateProfile, loading } = useAuthStore();
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

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'security', name: 'Seguridad', icon: Lock },
    { id: 'bookings', name: 'Reservas', icon: History },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'settings', name: 'Configuración', icon: Settings },
  ];

  if (!user) {
    return null;
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark h-32"></div>

          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-primary">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'host' ? 'Anfitrión' : user.role === 'admin' ? 'Administrador' : 'Huésped'}
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Información personal</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <X size={16} />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                      >
                        <Save size={16} />
                        Guardar
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ubicación
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="Ciudad, País"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Biografía
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Cuéntanos sobre ti..."
                      />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail size={20} className="text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500">Email</div>
                          <div>{user.email}</div>
                        </div>
                      </div>

                      {user.phone && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone size={20} className="text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500">Teléfono</div>
                            <div>{user.phone}</div>
                          </div>
                        </div>
                      )}

                      {user.location && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapPin size={20} className="text-gray-400" />
                          <div>
                            <div className="text-xs text-gray-500">Ubicación</div>
                            <div>{user.location}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar size={20} className="text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500">Miembro desde</div>
                          <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    {user.bio && (
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="font-medium text-gray-900 mb-2">Sobre mí</h3>
                        <p className="text-gray-600">{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Seguridad de la cuenta</h2>

                <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva contraseña
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition"
                  >
                    Cambiar contraseña
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t">
                  <h3 className="font-medium mb-4">Verificación de identidad</h3>
                  <p className="text-gray-600 mb-4">
                    {user.isVerified ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ Tu identidad está verificada
                      </span>
                    ) : (
                      <span className="text-gray-500">Tu identidad no ha sido verificada</span>
                    )}
                  </p>
                  {!user.isVerified && (
                    <button className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition">
                      Verificar identidad
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-bold mb-6">
                  {user.role === 'host' ? 'Reservas recibidas' : 'Mis reservas'}
                </h2>

                {bookings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <History size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No tienes reservas todavía</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-4">
                            {booking.property?.images?.[0] && (
                              <img
                                src={booking.property.images[0]}
                                alt={booking.property.title}
                                className="w-24 h-24 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold">{booking.property?.title}</h3>
                              <p className="text-sm text-gray-600">
                                {booking.property?.city}, {booking.property?.country}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                {booking.guests} huésped{booking.guests > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                              {booking.status === 'pending' && 'Pendiente'}
                              {booking.status === 'confirmed' && 'Confirmada'}
                              {booking.status === 'cancelled' && 'Cancelada'}
                              {booking.status === 'completed' && 'Completada'}
                            </span>
                            <p className="text-lg font-bold text-gray-900 mt-2">
                              ${Number(booking.totalPrice).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Preferencias de notificaciones</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">Notificaciones por email</h3>
                      <p className="text-sm text-gray-600">Recibe actualizaciones por correo electrónico</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">Notificaciones de reservas</h3>
                      <p className="text-sm text-gray-600">Recibe notificaciones de nuevas reservas</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">Mensajes de chat</h3>
                      <p className="text-sm text-gray-600">Recibe notificaciones de nuevos mensajes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <h3 className="font-medium">Promociones y ofertas</h3>
                      <p className="text-sm text-gray-600">Recibe ofertas especiales y promociones</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Configuración de la cuenta</h2>

                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h3 className="font-medium mb-3">Idioma y región</h3>
                    <div className="max-w-md">
                      <label className="block text-sm text-gray-700 mb-1">Idioma preferido</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary">
                        <option>Español</option>
                        <option>English</option>
                        <option>Français</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <h3 className="font-medium mb-3">Moneda</h3>
                    <div className="max-w-md">
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary">
                        <option>USD - Dólar estadounidense</option>
                        <option>EUR - Euro</option>
                        <option>MXN - Peso mexicano</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <h3 className="font-medium mb-3 text-red-600">Zona peligrosa</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, está seguro.
                    </p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                      Eliminar mi cuenta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
