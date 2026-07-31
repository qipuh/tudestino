import { useState } from 'react';
import { X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import api from '../../services/api';

function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [postType, setPostType] = useState('post'); // 'post' or 'reel'
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Debes agregar una descripción');
      return;
    }

    setUploading(true);

    try {
      // For now, create post without actual file upload
      // Using placeholder images/videos until file upload is implemented
      const postData = {
        type: postType,
        content: content.trim(),
        images: postType === 'post' ? ['https://picsum.photos/600/400'] : [],
        videoUrl: postType === 'reel' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : null,
      };

      const response = await api.post('/social/posts', postData);

      console.log('✅ Post created:', response.data);

      // Reset form
      setContent('');
      setFiles([]);
      setPostType('post');

      // Notify parent
      if (onPostCreated) {
        onPostCreated(response.data);
      }

      onClose();
    } catch (err) {
      console.error('❌ Error creating post:', err);
      setError(err.response?.data?.message || 'Error al crear la publicación');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-primary-dark">Crear publicación</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            disabled={uploading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Type selector */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setPostType('post')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                postType === 'post'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ImageIcon size={20} />
              Post
            </button>
            <button
              type="button"
              onClick={() => setPostType('reel')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                postType === 'reel'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Video size={20} />
              Reel
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`¿Qué quieres compartir${postType === 'reel' ? ' en tu reel' : ''}?`}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              disabled={uploading}
            />
          </div>

          {/* Info note */}
          <div className="mb-6 p-4 bg-primary/10 border-2 border-primary/30 rounded-xl">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-primary-dark">📌 Nota:</span> Por ahora, las publicaciones usarán {postType === 'reel' ? 'un video de ejemplo' : 'imágenes de placeholder'}. La subida de archivos se implementará próximamente.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Publicando...
                </>
              ) : (
                `Publicar ${postType === 'reel' ? 'Reel' : 'Post'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;
