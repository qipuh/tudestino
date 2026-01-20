import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Upload, Clock, Image as ImageIcon } from 'lucide-react';
import useBusiness from '../hooks/useBusiness';
import api, { getImageUrl } from '../../../services/api';

const MENU_CATEGORIES = {
  restaurant: [
    { value: 'appetizers', label: 'Entradas', icon: '🥗' },
    { value: 'main_courses', label: 'Platos Principales', icon: '🍽️' },
    { value: 'desserts', label: 'Postres', icon: '🍰' },
    { value: 'beverages', label: 'Bebidas', icon: '🥤' },
    { value: 'alcoholic', label: 'Bebidas Alcohólicas', icon: '🍷' },
    { value: 'breakfast', label: 'Desayunos', icon: '🍳' },
    { value: 'specials', label: 'Especialidades', icon: '⭐' },
  ],
  entertainment: [
    { value: 'drinks', label: 'Bebidas', icon: '🍹' },
    { value: 'cocktails', label: 'Cócteles', icon: '🍸' },
    { value: 'beer', label: 'Cervezas', icon: '🍺' },
    { value: 'wine', label: 'Vinos', icon: '🍷' },
    { value: 'spirits', label: 'Licores', icon: '🥃' },
    { value: 'snacks', label: 'Bocadillos', icon: '🍿' },
    { value: 'packages', label: 'Paquetes/Combos', icon: '🎉' },
    { value: 'specials', label: 'Especialidades', icon: '⭐' },
  ]
};

function RestaurantMenu() {
  const { id } = useParams();
  const { business, fetchBusiness } = useBusiness();
  const businessType = business?.businessType || 'restaurant';
  const categories = MENU_CATEGORIES[businessType] || MENU_CATEGORIES.restaurant;
  const [activeTab, setActiveTab] = useState('menu'); // menu, photos, schedule
  const [menuItems, setMenuItems] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const getDefaultCategory = () => {
    return businessType === 'entertainment' ? 'drinks' : 'main_courses';
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: getDefaultCategory(),
    price: '',
    isAvailable: true,
    isSpecial: false,
    image: null
  });

  useEffect(() => {
    if (id) {
      loadBusiness();
      loadMenuItems();
      loadPhotos();
    }
  }, [id]);

  const loadBusiness = async () => {
    await fetchBusiness(id);
  };

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/businesses/${id}/menu`);
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const response = await api.get(`/businesses/${id}/photos`);
      setPhotos(response.data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleOpenItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category,
        price: item.price,
        isAvailable: item.isAvailable !== false,
        isSpecial: item.isSpecial || false,
        image: null
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: getDefaultCategory(),
        price: '',
        isAvailable: true,
        isSpecial: false,
        image: null
      });
    }
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'main_courses',
      price: '',
      isAvailable: true,
      isSpecial: false,
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

  const handleSubmitItem = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('isAvailable', formData.isAvailable ? '1' : '0');
      formDataToSend.append('isSpecial', formData.isSpecial ? '1' : '0');

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (editingItem) {
        await api.put(`/businesses/${id}/menu/${editingItem.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(`/businesses/${id}/menu`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await loadMenuItems();
      handleCloseItemModal();
      alert('¡Plato guardado exitosamente!');
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error al guardar el plato: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('¿Estás seguro de eliminar este plato?')) {
      return;
    }

    try {
      await api.delete(`/businesses/${id}/menu/${itemId}`);
      await loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error al eliminar el plato');
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('photo', file);

      await api.post(`/businesses/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await loadPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto');
    }
  };

  const uploadPhotoFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);

      await api.post(`/businesses/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await loadPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);

    // Filtrar solo imágenes
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    // Subir todas las imágenes
    for (const file of imageFiles) {
      await uploadPhotoFile(file);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('¿Estás seguro de eliminar esta foto?')) {
      return;
    }

    try {
      await api.delete(`/businesses/${id}/photos/${photoId}`);
      await loadPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error al eliminar la foto');
    }
  };

  const groupedMenuItems = categories.reduce((acc, category) => {
    acc[category.value] = menuItems.filter(item => item.category === category.value);
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
          <Link to="/business/dashboard" className="text-primary hover:text-primary-dark">
            Dashboard
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/business/${id}`} className="text-primary hover:text-primary-dark">
            {business.name}
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Menú y Contenido</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {businessType === 'entertainment' ? 'Carta' : 'Menú'} de {business.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona {businessType === 'entertainment' ? 'tu carta de bebidas y productos' : 'tu menú'}, fotos y horarios
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'menu'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {businessType === 'entertainment' ? '🍹 Carta' : '🍽️ Menú'}
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'photos'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📷 Galería
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'schedule'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🕐 Horarios
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Platos y Bebidas</h2>
                  <button
                    onClick={() => handleOpenItemModal()}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Agregar Plato
                  </button>
                </div>

                {menuItems.length === 0 && !loading && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-bold mb-2">No hay platos en el menú</h3>
                    <p className="text-gray-600 mb-6">Comienza agregando tus primeros platos</p>
                    <button
                      onClick={() => handleOpenItemModal()}
                      className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark"
                    >
                      Agregar Primer Plato
                    </button>
                  </div>
                )}

                {/* Menu by Categories */}
                {categories.map(category => {
                  const items = groupedMenuItems[category.value] || [];
                  if (items.length === 0) return null;

                  return (
                    <div key={category.value} className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        {category.label} ({items.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map(item => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                            {/* Item Image */}
                            <div className="relative h-40 bg-gray-100">
                              {item.image ? (
                                <img
                                  src={getImageUrl(item.image, 'menu')}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl">
                                  {category.icon}
                                </div>
                              )}
                              {item.isSpecial && (
                                <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                                  ⭐ Especial
                                </div>
                              )}
                              {!item.isAvailable && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  No disponible
                                </div>
                              )}
                            </div>

                            {/* Item Info */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                <span className="text-primary font-bold whitespace-nowrap ml-2">
                                  S/. {parseFloat(item.price).toFixed(2)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleOpenItemModal(item)}
                                  className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm flex items-center justify-center gap-1"
                                >
                                  <Edit2 size={14} />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Galería de Fotos</h2>
                  <label className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2 cursor-pointer">
                    <Upload size={20} />
                    Subir Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPhoto}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragging
                      ? 'border-primary bg-blue-50 scale-105'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Upload size={48} className={`mb-4 ${isDragging ? 'text-primary animate-bounce' : 'text-gray-400'}`} />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {isDragging ? '¡Suelta las imágenes aquí!' : 'Arrastra y suelta tus fotos'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      o haz clic en el botón "Subir Foto" arriba
                    </p>
                    <p className="text-xs text-gray-500">
                      Formatos soportados: JPG, PNG, WEBP (máx. 5MB)
                    </p>
                  </div>
                </div>

                {photos.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="text-6xl mb-4">📷</div>
                    <h3 className="text-xl font-bold mb-2">No hay fotos en la galería</h3>
                    <p className="text-gray-600">Arrastra fotos aquí o usa el botón para subirlas</p>
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={getImageUrl(photo.url, 'business')}
                          alt="Foto del restaurante"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Horarios de Atención</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Clock size={48} className="mx-auto text-blue-600 mb-4" />
                  <p className="text-blue-800">
                    La gestión de horarios se encuentra en la configuración del negocio
                  </p>
                  <Link
                    to={`/business/${id}/edit`}
                    className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
                  >
                    Ir a Configuración
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Menu Item */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingItem ? 'Editar Plato' : 'Nuevo Plato'}
                </h2>
                <button
                  onClick={handleCloseItemModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitItem}>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Plato *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Ej: Ceviche de Pescado"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio (S/.) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Describe los ingredientes y preparación..."
                    />
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto del Plato
                    </label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">Disponible</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isSpecial"
                        checked={formData.isSpecial}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">⭐ Plato Especial</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseItemModal}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Agregar Plato'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantMenu;
