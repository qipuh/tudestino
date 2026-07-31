import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import UserAccountLayout from '../../../layouts/UserAccountLayout';
import { User, Camera, MapPin, Calendar, Mail, Phone, ExternalLink, Edit2, X, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import api from '../../../services/api';
import { useSidebar } from '../../../contexts/SidebarContext';
import useVerification from '../../../hooks/useVerification';

const emptyForm = { name: '', phone: '', location: '', dateOfBirth: '', bio: '' };

function toDateInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function formFromUser(user) {
  return {
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    dateOfBirth: toDateInputValue(user?.dateOfBirth),
    bio: user?.bio || '',
  };
}

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

  const [form, setForm] = useState(() => formFromUser(user));
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Disable sidebar on this page
  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  // Re-sincroniza el form si el usuario cambia (login, refresh de store, etc)
  useEffect(() => {
    setForm(formFromUser(user));
  }, [user?.id]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(formFromUser(user));

  const handleFieldChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setProfileSaved(false);
  };

  const handleCancelEdit = () => {
    setForm(formFromUser(user));
    setProfileError('');
    setProfileSaved(false);
  };

  const handleSaveProfile = async () => {
    if (!form.name.trim()) {
      setProfileError('El nombre no puede estar vacío');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError('');

      const response = await api.patch('/users/me', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        dateOfBirth: form.dateOfBirth || null,
        bio: form.bio.trim(),
      });

      const userData = response.data || response.user;
      if (userData?.id) {
        setUser({ ...user, ...userData });
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.error('Error al guardar perfil:', err);
      setProfileError(err.response?.data?.message || 'Error al guardar los cambios. Intenta de nuevo.');
    } finally {
      setSavingProfile(false);
    }
  };

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

      const userData = response.data || response.user;

      if (userData?.id) {
        setUser({ ...user, ...userData });
        setCustomUrl(userData.username);
      }

      setShowUrlModal(false);
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

    if (!file.type.startsWith('image/')) {
      setProfileError('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('La imagen no debe superar los 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setProfileError('');

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const avatarUrl = response.data?.avatar;
      if (avatarUrl) {
        setUser({ ...user, avatar: avatarUrl });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error al subir avatar:', err);
      setProfileError('Error al subir la foto. Por favor intenta de nuevo.');
    } finally {
      setUploadingAvatar(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <UserAccountLayout activeMenu="profile">
      <div className="max-w-4xl">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink">Mi Perfil de Viajero</h1>
              <p className="text-mute mt-1">
                Gestiona tu información personal y preferencias de viaje
              </p>
            </div>
            <div className="flex gap-2">
              {user?.username ? (
                <a
                  href={`/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary-dark border border-primary rounded-full hover:bg-sand transition"
                >
                  <ExternalLink size={16} />
                  Ver perfil público
                </a>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-mute border border-line rounded-full bg-sand">
                  <ExternalLink size={16} />
                  Configura tu URL primero
                </div>
              )}
              <button
                onClick={() => setShowUrlModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition"
              >
                <Edit2 size={16} />
                {user?.username ? 'Cambiar URL' : 'Configurar URL'}
              </button>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        {!verificationLoading && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-line">
            <h2 className="text-xl font-semibold text-ink mb-4">Estado de Verificación</h2>
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
              <div className="flex items-center gap-3 p-4 bg-secondary/10 border-l-4 border-secondary rounded-lg">
                <Clock className="text-secondary flex-shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-ink">Verificación en Proceso</p>
                  <p className="text-sm text-mute">
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
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition text-sm font-medium"
                  >
                    Reintentar Verificación
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gold/10 border-l-4 border-gold rounded-lg">
                <Clock className="text-gold flex-shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-ink">Identidad No Verificada</p>
                  <p className="text-sm text-mute mb-3">
                    Verifica tu identidad para acceder a todas las funcionalidades como reservas y mensajes.
                  </p>
                  <Link
                    to="/verify-identity"
                    className="inline-block px-4 py-2 bg-gold text-ink rounded-full hover:brightness-95 transition text-sm font-medium"
                  >
                    Verificar mi Identidad
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Photo Section */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-line">
          <h2 className="text-xl font-semibold text-ink mb-4">Foto de Perfil</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_SERVER_URL}${user.avatar}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-line"
                />
              ) : (
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                  <User className="text-white" size={40} />
                </div>
              )}
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-line hover:bg-sand transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingAvatar ? (
                  <Loader2 size={16} className="text-mute animate-spin" />
                ) : (
                  <Camera size={16} className="text-mute" />
                )}
              </button>
            </div>
            <div>
              <h3 className="font-medium text-ink mb-1">Actualiza tu foto</h3>
              <p className="text-sm text-mute mb-3">
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
        <div className="bg-white rounded-2xl shadow-card p-6 border border-line">
          <h2 className="text-xl font-semibold text-ink mb-6">Información Personal</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleFieldChange('name')}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-2 border border-line rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                <Mail className="inline mr-2" size={16} />
                Correo Electrónico
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-2 border border-line rounded-xl bg-sand text-mute cursor-not-allowed"
                readOnly
                title="El correo no se puede editar desde aquí"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                <Phone className="inline mr-2" size={16} />
                Teléfono
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={handleFieldChange('phone')}
                placeholder="+51 999 999 999"
                className="w-full px-4 py-2 border border-line rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                <Calendar className="inline mr-2" size={16} />
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={handleFieldChange('dateOfBirth')}
                className="w-full px-4 py-2 border border-line rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                <MapPin className="inline mr-2" size={16} />
                Ciudad
              </label>
              <input
                type="text"
                value={form.location}
                onChange={handleFieldChange('location')}
                placeholder="Lima, Perú"
                className="w-full px-4 py-2 border border-line rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Sobre ti
              </label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={handleFieldChange('bio')}
                placeholder="Cuéntanos sobre tus intereses y preferencias de viaje..."
                className="w-full px-4 py-2 border border-line rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
              />
            </div>
          </div>

          {profileError && (
            <div className="flex items-center gap-2 mt-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              {profileError}
            </div>
          )}

          {profileSaved && (
            <div className="flex items-center gap-2 mt-6 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <CheckCircle size={16} className="flex-shrink-0" />
              Cambios guardados exitosamente
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-line">
            <button
              onClick={handleCancelEdit}
              disabled={!isDirty || savingProfile}
              className="px-6 py-2 border border-line rounded-full text-ink hover:bg-sand transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={!isDirty || savingProfile}
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingProfile ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </div>

        {/* URL Personalizada Modal */}
        {showUrlModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-ink">Cambiar URL Personalizada</h3>
                <button
                  onClick={() => setShowUrlModal(false)}
                  className="text-mute hover:text-ink transition"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-sm text-mute mb-4">
                Personaliza la URL de tu perfil público. Solo puedes usar letras, números y guiones.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-ink mb-2">
                  URL Personalizada
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-mute">tudestino.pe/</span>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setError('');
                    }}
                    placeholder="tu-nombre"
                    className="flex-1 px-4 py-2 border border-line rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={saving}
                  />
                </div>
                <p className="text-xs text-mute mt-2">
                  Tu URL será: <strong className="text-ink">tudestino.pe/{customUrl || 'tu-nombre'}</strong>
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
                  className="flex-1 px-4 py-2 border border-line rounded-full text-ink hover:bg-sand transition"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUrl}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
