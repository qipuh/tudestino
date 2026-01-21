import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Clock, Image as ImageIcon, Images } from 'lucide-react';
import useBusiness from '../hooks/useBusiness';
import api, { getImageUrl } from '../../../services/api';

const SPA_SERVICE_CATEGORIES = [
  { value: 'massages', label: 'Masajes', icon: '💆' },
  { value: 'facials', label: 'Tratamientos Faciales', icon: '✨' },
  { value: 'body_treatments', label: 'Tratamientos Corporales', icon: '🧖' },
  { value: 'gym', label: 'Gimnasio', icon: '💪' },
  { value: 'yoga', label: 'Yoga y Meditación', icon: '🧘' },
  { value: 'hair_salon', label: 'Peluquería', icon: '💇' },
  { value: 'nails', label: 'Manicura y Pedicura', icon: '💅' },
  { value: 'packages', label: 'Paquetes', icon: '🎁' },
  { value: 'other', label: 'Otros', icon: '⭐' },
];

function SpaServices() {
  const { id } = useParams();
  const { business, fetchBusiness } = useBusiness();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [currentService, setCurrentService] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'massages',
    duration: '',
    price: '',
    isAvailable: true,
    image: null
  });

  useEffect(() => {
    if (id) {
      loadBusiness();
      loadServices();
    }
  }, [id]);

  const loadBusiness = async () => {
    await fetchBusiness(id);
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/businesses/${id}/spa-services`);
      setServices(response.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenServiceModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        category: service.category,
        duration: service.duration || '',
        price: service.price,
        isAvailable: service.isAvailable !== false,
        image: null
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        category: 'massages',
        duration: '',
        price: '',
        isAvailable: true,
        image: null
      });
    }
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: 'massages',
      duration: '',
      price: '',
      isAvailable: true,
      image: null
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('duration', formData.duration || '');
      formDataToSend.append('price', formData.price);
      formDataToSend.append('isAvailable', formData.isAvailable ? '1' : '0');

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingService) {
        await api.put(`/businesses/${id}/spa-services/${editingService.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(`/businesses/${id}/spa-services`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await loadServices();
      handleCloseServiceModal();
      alert('¡Servicio guardado exitosamente!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error al guardar el servicio: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) {
      return;
    }

    try {
      await api.delete(`/businesses/${id}/spa-services/${serviceId}`);
      await loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error al eliminar el servicio');
    }
  };

  const handleOpenGallery = async (service) => {
    setCurrentService(service);
    setShowGalleryModal(true);
    await loadGalleryPhotos(service.id);
  };

  const loadGalleryPhotos = async (serviceId) => {
    try {
      const response = await api.get(`/businesses/${id}/spa-services/${serviceId}/photos`);
      setGalleryPhotos(response.data || []);
    } catch (error) {
      console.error('Error loading gallery photos:', error);
      setGalleryPhotos([]);
    }
  };

  const handleUploadGalleryPhoto = async (e, serviceId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (galleryPhotos.length >= 5) {
      alert('Este servicio ya tiene el máximo de 5 fotos');
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('photo', file);

      await api.post(`/businesses/${id}/spa-services/${serviceId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await loadGalleryPhotos(serviceId);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(error.response?.data?.message || 'Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeleteGalleryPhoto = async (serviceId, photoId) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) {
      return;
    }

    try {
      await api.delete(`/businesses/${id}/spa-services/${serviceId}/photos/${photoId}`);
      await loadGalleryPhotos(serviceId);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error al eliminar la foto');
    }
  };

  const groupedServices = SPA_SERVICE_CATEGORIES.reduce((acc, category) => {
    acc[category.value] = services.filter(service => service.category === category.value);
    return acc;
  }, {});

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to={`/business/${id}`} className="text-primary hover:text-primary-dark">
            ← Volver al negocio
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
              <p className="text-gray-600">Gestión de Servicios</p>
            </div>
            <button
              onClick={() => handleOpenServiceModal()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <Plus size={20} />
              Agregar Servicio
            </button>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-8">
          {SPA_SERVICE_CATEGORIES.map((category) => {
            const categoryServices = groupedServices[category.value] || [];

            if (categoryServices.length === 0) return null;

            return (
              <div key={category.value} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.label}</h2>
                    <p className="text-sm text-gray-500">{categoryServices.length} servicio(s)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                    >
                      {service.image ? (
                        <img
                          src={getImageUrl(service.image, 'spa-services')}
                          alt={service.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <ImageIcon size={48} className="text-gray-400" />
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{service.name}</h3>
                          {!service.isAvailable && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              No disponible
                            </span>
                          )}
                        </div>

                        {service.description && (
                          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {service.duration && (
                              <>
                                <Clock size={16} />
                                <span>{service.duration} min</span>
                              </>
                            )}
                          </div>
                          <div className="text-xl font-bold text-primary">
                            S/ {parseFloat(service.price).toFixed(2)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => handleOpenGallery(service)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          >
                            <Images size={16} />
                            Galería ({service.photoCount || 0}/5)
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenServiceModal(service)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                              <Edit2 size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {services.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💆</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay servicios registrados</h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando los servicios que ofrece tu negocio
            </p>
            <button
              onClick={() => handleOpenServiceModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <Plus size={20} />
              Agregar Primer Servicio
            </button>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingService ? 'Editar Servicio' : 'Agregar Servicio'}
              </h2>
            </div>

            <form onSubmit={handleSubmitService} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del servicio *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Ej: Masaje Relajante"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Describe el servicio..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  >
                    {SPA_SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (S/) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="50.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del servicio
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                {editingService?.image && !formData.image && (
                  <p className="text-sm text-gray-500 mt-1">Imagen actual: {editingService.image}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isAvailable"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                  Servicio disponible
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseServiceModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (editingService ? 'Actualizar' : 'Agregar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && currentService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Galería de {currentService.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{galleryPhotos.length}/5 fotos</p>
                </div>
                <button
                  onClick={() => setShowGalleryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Upload area */}
              {galleryPhotos.length < 5 && (
                <div className="mb-6">
                  <label className="block w-full">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary cursor-pointer transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadGalleryPhoto(e, currentService.id)}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                      {uploadingPhoto ? (
                        <div className="text-gray-600">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          Subiendo foto...
                        </div>
                      ) : (
                        <>
                          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-600 font-medium mb-2">Haz clic para subir una foto</p>
                          <p className="text-sm text-gray-500">Máximo 5 fotos por servicio</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )}

              {/* Photos grid */}
              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={getImageUrl(photo.url, 'spa-services')}
                        alt={photo.caption || currentService.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeleteGalleryPhoto(currentService.id, photo.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
                  <p>No hay fotos en la galería</p>
                  <p className="text-sm mt-2">Sube hasta 5 fotos para mostrar este servicio</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowGalleryModal(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpaServices;
