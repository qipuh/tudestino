import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { attractionsService } from '../../services/attractions.service';
import GalleryManager from './components/GalleryManager';
import PlaceTagging from './components/PlaceTagging';
import MapSelector from './components/MapSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CATEGORIES = [
  { value: 'naturaleza', label: 'Naturaleza' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'aventura', label: 'Aventura' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'urbano', label: 'Urbano' }
];

function AttractionForm({ attraction, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    category: 'naturaleza',
    latitude: '',
    longitude: '',
    address: '',
    city: '',
    region: '',
    country: '',
    hasDistanceMarkers: false,
    startPoint: '',
    endPoint: '',
    whatToDo: '',
    recommendations: '',
    isPublished: false,
  });

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [taggedPlaces, setTaggedPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (attraction) {
      setFormData({
        title: attraction.title || '',
        description: attraction.description || '',
        videoUrl: attraction.videoUrl || '',
        category: attraction.category || 'naturaleza',
        latitude: attraction.latitude || '',
        longitude: attraction.longitude || '',
        address: attraction.address || '',
        city: attraction.city || '',
        region: attraction.region || '',
        country: attraction.country || '',
        hasDistanceMarkers: attraction.hasDistanceMarkers || false,
        startPoint: attraction.startPoint ? JSON.stringify(attraction.startPoint) : '',
        endPoint: attraction.endPoint ? JSON.stringify(attraction.endPoint) : '',
        whatToDo: attraction.whatToDo || '',
        recommendations: attraction.recommendations || '',
        isPublished: attraction.isPublished || false,
      });

      if (attraction.coverImage) {
        const imageUrl = attraction.coverImage.startsWith('http')
          ? attraction.coverImage
          : `${API_URL.replace('/api', '')}/uploads/attractions/${attraction.coverImage}`;
        setCoverImagePreview(imageUrl);
      }

      // Load gallery images
      if (attraction.images && attraction.images.length > 0) {
        const images = attraction.images.map(img => ({
          url: img.url,
          isNew: false,
        }));
        setGalleryImages(images);
      }

      // Load tagged places
      if (attraction.tags && attraction.tags.length > 0) {
        setTaggedPlaces(attraction.tags);
      }
    }
  }, [attraction]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, coverImage: 'Solo se permiten archivos de imagen' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, coverImage: 'La imagen no debe superar 10MB' }));
      return;
    }

    setCoverImageFile(file);
    setErrors(prev => ({ ...prev, coverImage: null }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };

  const handleMapChange = (data) => {
    setFormData(prev => ({
      ...prev,
      latitude: data.location.latitude || '',
      longitude: data.location.longitude || '',
      hasDistanceMarkers: data.distanceMarkers.enabled || false,
      startPoint: data.distanceMarkers.enabled && data.distanceMarkers.startPoint
        ? JSON.stringify(data.distanceMarkers.startPoint)
        : '',
      endPoint: data.distanceMarkers.enabled && data.distanceMarkers.endPoint
        ? JSON.stringify(data.distanceMarkers.endPoint)
        : '',
    }));
  };

  const handleGalleryChange = (images) => {
    setGalleryImages(images);
  };

  const handleTagsChange = (tags) => {
    setTaggedPlaces(tags);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('videoUrl', formData.videoUrl);
      submitFormData.append('category', formData.category);

      if (formData.latitude) submitFormData.append('latitude', formData.latitude);
      if (formData.longitude) submitFormData.append('longitude', formData.longitude);
      if (formData.address) submitFormData.append('address', formData.address);
      if (formData.city) submitFormData.append('city', formData.city);
      if (formData.region) submitFormData.append('region', formData.region);
      if (formData.country) submitFormData.append('country', formData.country);

      submitFormData.append('hasDistanceMarkers', formData.hasDistanceMarkers);
      if (formData.startPoint) submitFormData.append('startPoint', formData.startPoint);
      if (formData.endPoint) submitFormData.append('endPoint', formData.endPoint);

      if (formData.whatToDo) submitFormData.append('whatToDo', formData.whatToDo);
      if (formData.recommendations) submitFormData.append('recommendations', formData.recommendations);

      submitFormData.append('isPublished', formData.isPublished);

      if (coverImageFile) {
        submitFormData.append('coverImage', coverImageFile);
      }

      // Add tagged places
      if (taggedPlaces.length > 0) {
        submitFormData.append('taggedPlaces', JSON.stringify(taggedPlaces));
      }

      let attractionId;
      if (attraction) {
        await attractionsService.update(attraction.id, submitFormData);
        attractionId = attraction.id;
      } else {
        const response = await attractionsService.create(submitFormData);
        attractionId = response.data.id;
      }

      // Upload gallery images separately if there are new ones
      const newGalleryImages = galleryImages.filter(img => img.isNew && img.file);
      if (newGalleryImages.length > 0) {
        const galleryFormData = new FormData();
        newGalleryImages.forEach((img) => {
          galleryFormData.append('images', img.file);
        });
        await attractionsService.uploadGallery(attractionId, galleryFormData);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving attraction:', err);
      setErrors({
        submit: err.response?.data?.message || 'Error al guardar el atractivo'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {attraction ? 'Editar Atractivo Turístico' : 'Crear Atractivo Turístico'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {attraction ? 'Modifica los datos del atractivo' : 'Completa el formulario para crear un nuevo atractivo'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-6">
          {/* General Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del atractivo turístico"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el atractivo turístico..."
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen de Portada
                </label>

                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="cover-image-upload"
                    />
                    <label
                      htmlFor="cover-image-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Seleccionar imagen
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, WebP (MAX. 10MB)
                    </p>
                  </div>
                )}
                {errors.coverImage && (
                  <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Video (opcional)
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>

          {/* Ubicación y Mapa */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Ubicación y Mapa</h2>
            <MapSelector
              location={{
                latitude: formData.latitude,
                longitude: formData.longitude,
              }}
              distanceMarkers={{
                enabled: formData.hasDistanceMarkers,
                startPoint: formData.startPoint && formData.startPoint !== ''
                  ? JSON.parse(formData.startPoint)
                  : { lat: '', lng: '', name: '' },
                endPoint: formData.endPoint && formData.endPoint !== ''
                  ? JSON.parse(formData.endPoint)
                  : { lat: '', lng: '', name: '' },
              }}
              onChange={handleMapChange}
            />

            {/* Additional Location Info */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dirección completa"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ciudad"
                  />
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                    Región/Estado
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Región"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="País"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Galería de Imágenes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Galería de Imágenes</h2>
            <GalleryManager images={galleryImages} onChange={handleGalleryChange} />
          </div>

          {/* Lugares Etiquetados */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Lugares Etiquetados</h2>
            <PlaceTagging tags={taggedPlaces} onChange={handleTagsChange} />
          </div>

          {/* Contenido Adicional */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenido Adicional (Opcional)</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="whatToDo" className="block text-sm font-medium text-gray-700 mb-2">
                  Qué Hacer
                </label>
                <textarea
                  id="whatToDo"
                  name="whatToDo"
                  value={formData.whatToDo}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Actividades y cosas que hacer en este lugar..."
                />
              </div>

              <div>
                <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-2">
                  Recomendaciones
                </label>
                <textarea
                  id="recommendations"
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Recomendaciones para los visitantes..."
                />
              </div>
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                Publicar atractivo (visible en la web)
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (attraction ? 'Actualizar' : 'Crear Atractivo')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AttractionForm;
