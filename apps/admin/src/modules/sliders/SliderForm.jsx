import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { slidersService } from '../../services/sliders.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function SliderForm({ slider, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    linkUrl: '',
    isActive: true,
    displayOrder: 0,
    startDate: '',
    endDate: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (slider) {
      setFormData({
        title: slider.title || '',
        linkUrl: slider.linkUrl || '',
        isActive: slider.isActive ?? true,
        displayOrder: slider.displayOrder || 0,
        startDate: slider.startDate ? slider.startDate.split('T')[0] : '',
        endDate: slider.endDate ? slider.endDate.split('T')[0] : '',
      });

      if (slider.imageUrl) {
        const imageUrl = slider.imageUrl.startsWith('http')
          ? slider.imageUrl
          : `${API_URL.replace('/api', '')}/uploads/sliders/${slider.imageUrl}`;
        setImagePreview(imageUrl);
      }
    }
  }, [slider]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Solo se permiten archivos de imagen' }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'La imagen no debe superar 5MB' }));
      return;
    }

    setImageFile(file);
    setErrors(prev => ({ ...prev, image: null }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!slider && !imageFile) {
      newErrors.image = 'La imagen es requerida';
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
      submitFormData.append('linkUrl', formData.linkUrl);
      submitFormData.append('isActive', formData.isActive);
      submitFormData.append('displayOrder', formData.displayOrder);

      if (formData.startDate) {
        submitFormData.append('startDate', formData.startDate);
      }
      if (formData.endDate) {
        submitFormData.append('endDate', formData.endDate);
      }

      if (imageFile) {
        submitFormData.append('image', imageFile);
      }

      if (slider) {
        await slidersService.update(slider.id, submitFormData);
      } else {
        await slidersService.create(submitFormData);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving slider:', err);
      setErrors({
        submit: err.response?.data?.message || 'Error al guardar el slider'
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
            {slider ? 'Editar Slider' : 'Crear Slider'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {slider ? 'Modifica los datos del slider' : 'Completa el formulario para crear un nuevo slider'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* General Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

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
              placeholder="Nombre del slider (solo para referencia)"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen {!slider && <span className="text-red-500">*</span>}
            </label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
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
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Seleccionar imagen
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  PNG, JPG, WebP (MAX. 5MB)
                </p>
              </div>
            )}
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {/* Link URL */}
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Enlace (URL)
            </label>
            <input
              type="url"
              id="linkUrl"
              name="linkUrl"
              value={formData.linkUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              URL de destino al hacer clic en el slider (opcional)
            </p>
          </div>

          {/* Display Order */}
          <div>
            <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-2">
              Orden de visualización
            </label>
            <input
              type="number"
              id="displayOrder"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <p className="mt-1 text-sm text-gray-500">
              Menor número = aparece primero
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de inicio
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de fin
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Slider activo (visible en la web)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (slider ? 'Actualizar' : 'Crear Slider')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SliderForm;
