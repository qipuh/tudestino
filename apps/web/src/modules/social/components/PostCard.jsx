import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toggleLike, addComment, deletePost } from '../services/socialApi';
import { Link } from 'react-router-dom';

/**
 * Card para mostrar un post estilo Instagram
 */
function PostCard({ post, onDelete, currentUserId }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const media = Array.isArray(post.media) ? post.media : [];
  const isOwner = currentUserId === post.userId;

  const handleLike = async () => {
    try {
      const result = await toggleLike('post', post.id);
      setIsLiked(result.data.liked);
      setLikesCount(prev => result.data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment('post', post.id, commentText);
      setCommentText('');
      setCommentsCount(prev => prev + 1);
      // TODO: Actualizar lista de comentarios
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      await deletePost(post.id);
      if (onDelete) onDelete(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar la publicación');
    }
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link to={`/profile/${post.user?.id}`} className="flex items-center gap-3 hover:opacity-80">
            <img
              src={post.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || 'User')}&background=random`}
              alt={post.user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm">{post.user?.name}</p>
              {post.location && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={12} />
                  {post.location}
                </p>
              )}
            </div>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 rounded-t-lg"
                  >
                    Eliminar publicación
                  </button>
                )}
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media Carousel */}
        {media.length > 0 && (
          <div className="relative bg-black aspect-square">
            {media[currentMediaIndex].type === 'image' ? (
              <img
                src={`http://localhost:3000${media[currentMediaIndex].url}`}
                alt={`Media ${currentMediaIndex + 1}`}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
              />
            ) : (
              <video
                src={`http://localhost:3000${media[currentMediaIndex].url}`}
                controls
                className="w-full h-full object-contain"
              />
            )}

            {/* Navigation arrows */}
            {media.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                  {media.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentMediaIndex
                          ? 'w-6 bg-white'
                          : 'w-1.5 bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`transition-colors ${isLiked ? 'text-red-500' : 'hover:text-gray-600'}`}
              >
                <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:text-gray-600 transition-colors"
              >
                <MessageCircle size={24} />
              </button>
              <button className="hover:text-gray-600 transition-colors">
                <Send size={24} />
              </button>
            </div>
            <button className="hover:text-gray-600 transition-colors">
              <Bookmark size={24} />
            </button>
          </div>

          {/* Likes count */}
          {likesCount > 0 && (
            <p className="font-semibold text-sm mb-2">
              {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
            </p>
          )}

          {/* Caption */}
          <div className="text-sm mb-2">
            <Link to={`/profile/${post.user?.id}`} className="font-semibold hover:opacity-80">
              {post.user?.name}
            </Link>
            <span className="ml-2">{post.caption}</span>
          </div>

          {/* Comments count */}
          {commentsCount > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              Ver {commentsCount === 1 ? 'el' : 'los'} {commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}
            </button>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400 uppercase">
            {formatDate(post.createdAt)}
          </p>
        </div>

        {/* Comment input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleComment} className="flex items-center gap-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Agregar un comentario..."
              className="flex-1 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`font-semibold text-sm ${
                commentText.trim() ? 'text-primary' : 'text-gray-300'
              }`}
            >
              Publicar
            </button>
          </form>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={32} />
          </button>
          <img
            src={`http://localhost:3000${media[currentMediaIndex].url}`}
            alt={`Media ${currentMediaIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {media.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default PostCard;
