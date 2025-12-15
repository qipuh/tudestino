import { useState } from 'react';
import PropTypes from 'prop-types';

function ImageUpload({
  label = 'Subir imagen',
  multiple = false,
  maxFiles = 10,
  currentImages = [],
  onImagesChange,
  uploadType = 'business'
}) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(currentImages);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (!multiple && files.length > 1) {
      alert('Solo puedes subir una imagen');
      return;
    }

    if (files.length > maxFiles) {
      alert(`Solo puedes subir un máximo de ${maxFiles} imágenes`);
      return;
    }

    // Crear previews locales
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(previews);

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      if (multiple) {
        files.forEach(file => {
          formData.append('images', file);
        });

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/upload/${uploadType}/multiple`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al subir imágenes');
        }

        // Guardar solo el filename, no la URL completa
        const uploadedImages = data.data.map(img => img.filename);
        const newImages = [...images, ...uploadedImages];
        setImages(newImages);

        if (onImagesChange) {
          onImagesChange(newImages);
        }

      } else {
        formData.append('image', files[0]);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/upload/${uploadType}/single`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al subir imagen');
        }

        // Guardar solo el filename, no la URL completa
        const newImages = [data.data.filename];
        setImages(newImages);

        if (onImagesChange) {
          onImagesChange(newImages);
        }
      }

      // Limpiar previews
      setPreviewUrls([]);

    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error: ' + error.message);
      setPreviewUrls([]);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveImage = async (index) => {
    const imageToRemove = images[index];

    try {
      // imageToRemove ya es el filename directamente
      const filename = imageToRemove;
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/upload/${uploadType}/${filename}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar imagen');
      }

      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);

      if (onImagesChange) {
        onImagesChange(newImages);
      }

    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </span>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-primary">
            <span>📁 Seleccionar {multiple ? 'imágenes' : 'imagen'}</span>
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleFileChange}
              disabled={uploading}
              className="sr-only"
            />
          </label>
          {uploading && (
            <span className="text-sm text-gray-500">Subiendo...</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {multiple ? `Máximo ${maxFiles} imágenes.` : ''} Formatos: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB.
        </p>
      </label>

      {/* Previews de imágenes siendo subidas */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary animate-pulse">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                  Subiendo...
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Imágenes subidas */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              <img
                src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${uploadType}/${img}`}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ImageUpload.propTypes = {
  label: PropTypes.string,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
  currentImages: PropTypes.array,
  onImagesChange: PropTypes.func,
  uploadType: PropTypes.string
};

export default ImageUpload;
