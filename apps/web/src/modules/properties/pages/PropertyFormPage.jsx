import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Upload, X, MapPin } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import api from '../../../services/api';

const PROPERTY_TYPES = [
  { id: 'apartment', name: 'Apartamento', icon: '🏢' },
  { id: 'house', name: 'Casa', icon: '🏠' },
  { id: 'villa', name: 'Villa', icon: '🏡' },
  { id: 'cabin', name: 'Cabaña', icon: '🛖' },
  { id: 'room', name: 'Habitación', icon: '🚪' },
  { id: 'studio', name: 'Estudio', icon: '🏘️' },
];

const AMENITIES = [
  { id: 'wifi', name: 'WiFi', icon: '📶' },
  { id: 'kitchen', name: 'Cocina', icon: '🍳' },
  { id: 'parking', name: 'Estacionamiento', icon: '🅿️' },
  { id: 'pool', name: 'Piscina', icon: '🏊' },
  { id: 'gym', name: 'Gimnasio', icon: '💪' },
  { id: 'ac', name: 'Aire acondicionado', icon: '❄️' },
  { id: 'heating', name: 'Calefacción', icon: '🔥' },
  { id: 'tv', name: 'TV', icon: '📺' },
  { id: 'washer', name: 'Lavadora', icon: '🧺' },
  { id: 'workspace', name: 'Espacio de trabajo', icon: '💻' },
  { id: 'balcony', name: 'Balcón', icon: '🌅' },
  { id: 'pets', name: 'Mascotas permitidas', icon: '🐕' },
];

function PropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const isEdit = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // URLs de imágenes ya guardadas

  const [formData, setFormData] = useState({
    // Paso 1: Información básica
    title: '',
    description: '',
    type: '',

    // Paso 2: Ubicación
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: '',
    longitude: '',

    // Paso 3: Capacidad
    guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,

    // Paso 4: Amenidades
    amenities: [],

    // Paso 5: Precios y reglas
    basePrice: '',
    currency: 'USD',
    cleaningFee: '',
    serviceFee: '',
    checkIn: '15:00',
    checkOut: '11:00',
    minimumStay: 1,
    maximumStay: '',
    smokingAllowed: false,
    petsAllowed: false,
    eventsAllowed: false,
  });

  useEffect(() => {
    if (isEdit) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const result = await api.get(`/properties/${id}`);

      // Extraer data si viene en formato { success: true, data: {...} }
      const data = result.data || result;

      // Asegurar que todos los campos tengan valores por defecto para inputs controlados
      setFormData({
        title: data.title || '',
        description: data.description || '',
        type: data.type || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        zipCode: data.zipCode || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        guests: data.guests || 1,
        bedrooms: data.bedrooms || 1,
        beds: data.beds || 1,
        bathrooms: data.bathrooms || 1,
        amenities: data.amenities || [],
        basePrice: data.basePrice || '',
        currency: data.currency || 'USD',
        cleaningFee: data.cleaningFee || '',
        serviceFee: data.serviceFee || '',
        checkIn: data.checkIn || '15:00',
        checkOut: data.checkOut || '11:00',
        minimumStay: data.minimumStay || 1,
        maximumStay: data.maximumStay || '',
        smokingAllowed: data.smokingAllowed || false,
        petsAllowed: data.petsAllowed || false,
        eventsAllowed: data.eventsAllowed || false,
      });

      if (data.images && data.images.length > 0) {
        setExistingImages(data.images);
        setImagePreviews(data.images);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar propiedad');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenityId)
        ? formData.amenities.filter(id => id !== amenityId)
        : [...formData.amenities, amenityId],
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Crear previews de las nuevas imágenes
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('💾 Form submitted at step:', currentStep);
    setError('');
    setLoading(true);

    try {
      // Limpiar datos: convertir strings vacíos a null para campos numéricos opcionales
      const submitData = {
        ...formData,
        images: imagePreviews, // URLs de imágenes existentes
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        cleaningFee: formData.cleaningFee || null,
        serviceFee: formData.serviceFee || null,
        maximumStay: formData.maximumStay || null,
        zipCode: formData.zipCode || null,
        state: formData.state || null,
      };

      const result = isEdit
        ? await api.put(`/properties/${id}`, submitData)
        : await api.post('/properties', submitData);

      // TODO: Subir imágenes nuevas si hay imageFiles
      // if (imageFiles.length > 0) {
      //   await uploadImages(result.data.id);
      // }

      navigate('/host/properties');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar propiedad');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    console.log('📍 Next step clicked, current:', currentStep);
    setCurrentStep(Math.min(currentStep + 1, 6));
  };

  const prevStep = () => {
    console.log('📍 Prev step clicked, current:', currentStep);
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Información básica</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de propiedad
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      formData.type === type.id
                        ? 'border-primary bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-medium">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título de la propiedad *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Ej: Hermoso apartamento con vista al mar"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Describe tu propiedad..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Ubicación</h2>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Calle y número"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado/Provincia
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  País *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary-dark/10 border-2 border-primary/30 rounded-xl">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-primary-dark">Ubicación en el mapa</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Las coordenadas se obtendrán automáticamente basadas en la dirección
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Capacidad y espacios</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                  Huéspedes
                </label>
                <input
                  type="number"
                  id="guests"
                  name="guests"
                  min="1"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Habitaciones
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-2">
                  Camas
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  min="0"
                  value={formData.beds}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Baños
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Amenidades</h2>
            <p className="text-gray-600">Selecciona las comodidades que ofrece tu propiedad</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity.id)}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    formData.amenities.includes(amenity.id)
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">{amenity.icon}</div>
                  <div className="font-medium text-sm">{amenity.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Precios y reglas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por noche *
                </label>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  required
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="MXN">MXN</option>
                </select>
              </div>

              <div>
                <label htmlFor="cleaningFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa de limpieza
                </label>
                <input
                  type="number"
                  id="cleaningFee"
                  name="cleaningFee"
                  min="0"
                  step="0.01"
                  value={formData.cleaningFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="serviceFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa de servicio
                </label>
                <input
                  type="number"
                  id="serviceFee"
                  name="serviceFee"
                  min="0"
                  step="0.01"
                  value={formData.serviceFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Horarios y estancia</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <input
                    type="time"
                    id="checkIn"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <input
                    type="time"
                    id="checkOut"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="minimumStay" className="block text-sm font-medium text-gray-700 mb-1">
                    Estancia mínima (noches)
                  </label>
                  <input
                    type="number"
                    id="minimumStay"
                    name="minimumStay"
                    min="1"
                    value={formData.minimumStay}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="maximumStay" className="block text-sm font-medium text-gray-700 mb-1">
                    Estancia máxima (noches)
                  </label>
                  <input
                    type="number"
                    id="maximumStay"
                    name="maximumStay"
                    min="1"
                    value={formData.maximumStay}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Reglas de la casa</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="smokingAllowed"
                    checked={formData.smokingAllowed}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Permitir fumar</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="petsAllowed"
                    checked={formData.petsAllowed}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Permitir mascotas</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="eventsAllowed"
                    checked={formData.eventsAllowed}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Permitir eventos</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Fotos de la propiedad</h2>
            <p className="text-gray-600">Agrega fotos de alta calidad que muestren tu espacio</p>

            <div>
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition cursor-pointer">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Haz clic para subir fotos o arrastra y suelta
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG hasta 10MB</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded">
                        Foto principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/host/properties')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a mis propiedades
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar propiedad' : 'Nueva propiedad'}
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
                  step <= currentStep
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div className="flex gap-3">
                {currentStep === 6 && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Publicar'}
                  </button>
                )}

                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeft size={20} />
                    Anterior
                  </button>
                )}
              </div>

              {currentStep < 6 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Siguiente
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PropertyFormPage;
