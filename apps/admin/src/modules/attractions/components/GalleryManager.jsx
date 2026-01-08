import { useState } from 'react';
import { Upload, X, ChevronUp, ChevronDown, Image as ImageIcon } from 'lucide-react';

function GalleryManager({ images = [], onChange }) {
  const [previews, setPreviews] = useState(images);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      // Create previews for new files
      const newPreviews = await Promise.all(
        files.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                file,
                preview: reader.result,
                isNew: true,
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const updatedPreviews = [...previews, ...newPreviews];
      setPreviews(updatedPreviews);
      onChange(updatedPreviews);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    onChange(updatedPreviews);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedPreviews = [...previews];
    [updatedPreviews[index - 1], updatedPreviews[index]] = [
      updatedPreviews[index],
      updatedPreviews[index - 1],
    ];
    setPreviews(updatedPreviews);
    onChange(updatedPreviews);
  };

  const handleMoveDown = (index) => {
    if (index === previews.length - 1) return;
    const updatedPreviews = [...previews];
    [updatedPreviews[index], updatedPreviews[index + 1]] = [
      updatedPreviews[index + 1],
      updatedPreviews[index],
    ];
    setPreviews(updatedPreviews);
    onChange(updatedPreviews);
  };

  const getImageUrl = (image) => {
    if (image.preview) return image.preview;
    if (image.url) {
      return image.url.startsWith('http')
        ? image.url
        : `http://localhost:3000/uploads/attractions/${image.url}`;
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
          <Upload size={20} />
          <span>{uploading ? 'Cargando...' : 'Agregar Imágenes'}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
        <p className="text-sm text-gray-500">
          {previews.length} {previews.length === 1 ? 'imagen' : 'imágenes'}
        </p>
      </div>

      {/* Gallery Grid */}
      {previews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {previews.map((image, index) => (
            <div
              key={index}
              className="relative group bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200"
            >
              {/* Image */}
              <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                <img
                  src={getImageUrl(image)}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Order Badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                #{index + 1}
              </div>

              {/* Controls Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {/* Move Up */}
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Mover arriba"
                >
                  <ChevronUp size={20} className="text-gray-700" />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === previews.length - 1}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Mover abajo"
                >
                  <ChevronDown size={20} className="text-gray-700" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleRemove(index)}
                  className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                  title="Eliminar"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* New Badge */}
              {image.isNew && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Nueva
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">No hay imágenes en la galería</p>
          <p className="text-sm text-gray-400">
            Haz clic en "Agregar Imágenes" para comenzar
          </p>
        </div>
      )}
    </div>
  );
}

export default GalleryManager;
