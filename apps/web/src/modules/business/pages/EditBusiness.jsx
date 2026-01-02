import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useBusiness from '../hooks/useBusiness';
import ImageUpload from '../../../components/ImageUpload';
import BusinessLayout from '../components/BusinessLayout';

const businessTypes = [
  { value: 'hotel', label: 'Hotel / Alojamiento', icon: '🏨' },
  { value: 'restaurant', label: 'Restaurante', icon: '🍽️' },
  { value: 'entertainment', label: 'Entretenimiento', icon: '🎭' },
  { value: 'events', label: 'Eventos', icon: '🎉' },
  { value: 'tours', label: 'Tours y Excursiones', icon: '🗺️' },
  { value: 'transport', label: 'Transporte', icon: '🚗' },
  { value: 'spa', label: 'Spa y Bienestar', icon: '💆' },
  { value: 'other', label: 'Otro', icon: '🏢' },
];

function EditBusiness() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { business, updateBusiness, loading, error, fetchBusiness } = useBusiness(id);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    businessType: 'hotel',
    logo: '',
    coverImage: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Perú',
      zipCode: '',
      latitude: null,
      longitude: null,
    },
    contactPhone: '',
    contactEmail: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
    operatingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true },
    },
    // Configuración específica para hoteles
    hotelSettings: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      hasWifi: true,
      hasParking: false,
      hasSwimmingPool: false,
      hasRestaurant: false,
      petsAllowed: false,
      breakfastIncluded: false,
      childrenAllowed: true,
    },
  });
  const [logoImages, setLogoImages] = useState([]);
  const [coverImages, setCoverImages] = useState([]);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (id) {
      loadBusiness();
    }
  }, [id]);

  const loadBusiness = async () => {
    await fetchBusiness(id);
  };

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        slug: business.slug || '',
        description: business.description || '',
        businessType: business.businessType || 'hotel',
        logo: business.logo || '',
        coverImage: business.coverImage || '',
        address: business.address || {
          street: '',
          city: '',
          state: '',
          country: 'Perú',
          zipCode: '',
          latitude: null,
          longitude: null,
        },
        contactPhone: business.contactPhone || '',
        contactEmail: business.contactEmail || '',
        website: business.website || '',
        socialMedia: business.socialMedia || {
          facebook: '',
          instagram: '',
          twitter: '',
        },
        operatingHours: business.operatingHours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: true },
        },
        hotelSettings: business.hotelSettings || {
          checkInTime: '14:00',
          checkOutTime: '12:00',
          hasWifi: true,
          hasParking: false,
          hasSwimmingPool: false,
          hasRestaurant: false,
          petsAllowed: false,
          breakfastIncluded: false,
          childrenAllowed: true,
        },
      });

      // Cargar imágenes actuales
      if (business.logo) {
        setLogoImages([business.logo]);
      }
      if (business.coverImage) {
        setCoverImages([business.coverImage]);
      }
    }
  }, [business]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const actualValue = type === 'checkbox' ? checked : value;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: actualValue,
        },
      });
    } else if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData({
        ...formData,
        socialMedia: {
          ...formData.socialMedia,
          [socialField]: actualValue,
        },
      });
    } else if (name.startsWith('hotelSettings.')) {
      const hotelField = name.split('.')[1];
      setFormData({
        ...formData,
        hotelSettings: {
          ...formData.hotelSettings,
          [hotelField]: actualValue,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLogoChange = (images) => {
    setLogoImages(images);
    setFormData({
      ...formData,
      logo: images[0] || ''
    });
  };

  const handleCoverChange = (images) => {
    setCoverImages(images);
    setFormData({
      ...formData,
      coverImage: images[0] || ''
    });
  };

  const handleHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      operatingHours: {
        ...formData.operatingHours,
        [day]: {
          ...formData.operatingHours[day],
          [field]: value
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validaciones
    if (!formData.name.trim()) {
      setSubmitError('El nombre del negocio es requerido');
      return;
    }

    if (!formData.address.city.trim()) {
      setSubmitError('La ciudad es requerida');
      return;
    }

    const payload = { ...formData };
    if (!payload.website || payload.website.trim() === '') delete payload.website;
    if (!payload.contactEmail || payload.contactEmail.trim() === '') delete payload.contactEmail;

    const result = await updateBusiness(id, payload);

    if (result.success) {
      alert('Negocio actualizado exitosamente');
      navigate(`/business/${id}`);
    } else {
      const msg = result.error || result.raw?.message || 'Error al actualizar el negocio';
      setSubmitError(msg);
    }
  };

  if (loading && !business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <BusinessLayout activeMenu="edit">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Negocio</h1>
          <p className="text-gray-600 mt-2">
            Actualiza la información de tu negocio
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información Básica</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del negocio *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL amigable) *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El slug no se puede cambiar después de crear el negocio
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de negocio *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {businessTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                          formData.businessType === type.value
                            ? 'border-primary bg-primary bg-opacity-5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="businessType"
                          value={type.value}
                          checked={formData.businessType === type.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </section>

            {/* Imágenes */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Imágenes</h2>
              <div className="space-y-6">
                <ImageUpload
                  label="Logo del negocio"
                  multiple={false}
                  currentImages={logoImages}
                  onImagesChange={handleLogoChange}
                  uploadType="business"
                />

                <ImageUpload
                  label="Imagen de portada"
                  multiple={false}
                  currentImages={coverImages}
                  onImagesChange={handleCoverChange}
                  uploadType="business"
                />
              </div>
            </section>

            {/* Ubicación */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ubicación</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Región/Estado
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contacto</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio web
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Redes Sociales
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📘</span>
                      <input
                        type="text"
                        name="socialMedia.facebook"
                        value={formData.socialMedia.facebook}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="facebook.com/minegocio"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📷</span>
                      <input
                        type="text"
                        name="socialMedia.instagram"
                        value={formData.socialMedia.instagram}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="instagram.com/minegocio"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐦</span>
                      <input
                        type="text"
                        name="socialMedia.twitter"
                        value={formData.socialMedia.twitter}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="twitter.com/minegocio"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Horarios de Atención */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">⏰ Horarios de Atención</h2>
              <div className="space-y-3">
                {[
                  { key: 'monday', label: 'Lunes' },
                  { key: 'tuesday', label: 'Martes' },
                  { key: 'wednesday', label: 'Miércoles' },
                  { key: 'thursday', label: 'Jueves' },
                  { key: 'friday', label: 'Viernes' },
                  { key: 'saturday', label: 'Sábado' },
                  { key: 'sunday', label: 'Domingo' },
                ].map(day => (
                  <div key={day.key} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-28">
                      <span className="font-medium text-gray-900">{day.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!formData.operatingHours[day.key].closed}
                        onChange={(e) => handleHoursChange(day.key, 'closed', !e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600">Abierto</span>
                    </div>

                    {!formData.operatingHours[day.key].closed && (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">De:</label>
                          <input
                            type="time"
                            value={formData.operatingHours[day.key].open}
                            onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Hasta:</label>
                          <input
                            type="time"
                            value={formData.operatingHours[day.key].close}
                            onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                    )}

                    {formData.operatingHours[day.key].closed && (
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 italic">Cerrado</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 Configura los horarios de atención de tu negocio para que tus clientes sepan cuándo pueden visitarte.
              </p>
            </section>

            {/* Configuración del Hotel - Solo para hoteles */}
            {formData.businessType === 'hotel' && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">🏨 Configuración del Hotel</h2>

                {/* Check-in / Check-out */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Check-in
                      </label>
                      <input
                        type="time"
                        name="hotelSettings.checkInTime"
                        value={formData.hotelSettings?.checkInTime || '14:00'}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Check-out
                      </label>
                      <input
                        type="time"
                        name="hotelSettings.checkOutTime"
                        value={formData.hotelSettings?.checkOutTime || '12:00'}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Servicios del Hotel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Servicios del hotel
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="hotelSettings.hasWifi"
                          checked={formData.hotelSettings?.hasWifi || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span>📶 WiFi</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="hotelSettings.hasParking"
                          checked={formData.hotelSettings?.hasParking || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span>🅿️ Estacionamiento</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="hotelSettings.hasSwimmingPool"
                          checked={formData.hotelSettings?.hasSwimmingPool || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span>🏊 Piscina</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="hotelSettings.hasRestaurant"
                          checked={formData.hotelSettings?.hasRestaurant || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span>🍽️ Restaurante</span>
                      </label>
                    </div>
                  </div>

                  {/* Políticas */}
                  <div className="border-t pt-4 space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="hotelSettings.petsAllowed"
                        checked={formData.hotelSettings?.petsAllowed || false}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="font-medium">🐕 ¿Se permiten mascotas?</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="hotelSettings.breakfastIncluded"
                        checked={formData.hotelSettings?.breakfastIncluded || false}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="font-medium">☕ ¿Desayuno incluido?</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="hotelSettings.childrenAllowed"
                        checked={formData.hotelSettings?.childrenAllowed !== false}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="font-medium">👶 ¿Se permiten niños?</span>
                    </label>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  💡 Esta configuración se aplicará a todas las habitaciones del hotel.
                </p>
              </section>
            )}

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(`/business/${id}`)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </BusinessLayout>
  );
}

export default EditBusiness;
