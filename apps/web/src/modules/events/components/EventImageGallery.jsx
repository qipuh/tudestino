import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../../../services/api';

function EventImageGallery({ eventId, images = [], onImageUploaded, onImageDeleted, canEdit = false }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado');
      }

      // Validar todos los archivos primero
      const validFiles = [];
      for (const file of files) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} es demasiado grande (máx 5MB)`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        throw new Error('No hay archivos válidos para subir');
      }

      // Crear FormData con todos los archivos válidos
      const formData = new FormData();
      for (const file of validFiles) {
        formData.append('images', file); // IMPORTANTE: 'images' en plural
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${eventId}/images`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir imágenes');
      }

      const data = await response.json();

      // Notificar que se subieron las imágenes
      if (onImageUploaded) {
        onImageUploaded(data);
      }

      setUploadProgress(100);

      setUploadProgress(0);
    } catch (err) {
      setError(err.message || 'Error al subir imágenes');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl, imageId) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${eventId}/images/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar imagen');
      }

      if (onImageDeleted) {
        onImageDeleted(imageUrl, imageId);
      }
    } catch (err) {
      alert(err.message || 'Error al eliminar imagen');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canEdit && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition">
          <label className="cursor-pointer flex flex-col items-center gap-3">
            <Upload className="text-gray-400" size={48} />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Haz clic para subir imágenes
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF hasta 5MB
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {uploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center mt-2">
                Subiendo... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Gallery */}
      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.filter(img => img).map((image, index) => {
            const imageUrl = typeof image === 'string' ? image : image?.url;
            const imageId = typeof image === 'object' ? image?.id : null;

            if (!imageUrl) return null;

            return (
              <div
                key={imageId || index}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={getImageUrl(imageUrl, 'events')}
                  alt={image?.caption || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=Imagen+no+disponible';
                  }}
                />

                {canEdit && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteImage(image, imageId || index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        !canEdit && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ImageIcon className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No hay imágenes disponibles</p>
          </div>
        )
      )}
    </div>
  );
}

export default EventImageGallery;
