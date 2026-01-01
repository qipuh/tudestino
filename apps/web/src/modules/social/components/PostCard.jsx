import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toggleLike, addComment, deletePost, getComments, toggleCommentLike } from '../services/socialApi';
import { getImageUrl } from '@services/api';
import { Link } from 'react-router-dom';

/**
 * Card para mostrar un post estilo Instagram
 */
function PostCard({ post, onDelete, currentUserId, onUpdate }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const menuRef = useRef(null);
  const commentInputRef = useRef(null);

  const media = Array.isArray(post.media) ? post.media : [];
  const isOwner = currentUserId === post.userId;

  // Sincronizar estado cuando cambia el post
  useEffect(() => {
    setIsLiked(post.isLiked || false);
    setLikesCount(post.likesCount || 0);
    setCommentsCount(post.commentsCount || 0);
  }, [post.id, post.isLiked, post.likesCount, post.commentsCount]);

  // Cargar comentarios automáticamente al montar
  useEffect(() => {
    if (commentsCount > 0 && comments.length === 0) {
      loadComments();
    }
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLike = async () => {
    try {
      const result = await toggleLike('post', post.id);
      console.log('Toggle like result:', result);
      // El backend devuelve { success: true, data: { liked: true/false } }
      const newIsLiked = result.data.liked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

      console.log('Setting isLiked to:', newIsLiked, 'likesCount to:', newLikesCount);
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      // Notificar al padre para actualizar el post en la lista
      if (onUpdate) {
        onUpdate({
          ...post,
          isLiked: newIsLiked,
          likesCount: newLikesCount
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const loadComments = async () => {
    if (loadingComments || comments.length > 0) return;

    setLoadingComments(true);
    try {
      const response = await getComments('post', post.id, 1, 10);
      console.log('Loaded comments response:', response);
      // El backend devuelve { success: true, data: { comments, pagination } }
      const loadedComments = (response.data?.comments || response.comments || []).map(comment => ({
        ...comment,
        isLiked: comment.isLiked || false,
        likesCount: comment.likesCount || 0
      }));
      console.log('Setting comments:', loadedComments);
      setComments(loadedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const response = await toggleCommentLike(commentId);
      console.log('Toggle comment like response:', response);
      // El backend devuelve { liked: true/false, likesCount: number }
      const { liked, likesCount: newLikesCount } = response;

      // Actualizar el comentario en el estado
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId
            ? { ...comment, isLiked: liked, likesCount: newLikesCount }
            : comment
        )
      );
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await addComment('post', post.id, commentText);
      console.log('Add comment response:', response);

      setCommentText('');
      setReplyingTo(null);
      const newCommentsCount = commentsCount + 1;
      setCommentsCount(newCommentsCount);

      // El backend devuelve { success: true, message: '...', data: commentWithUser }
      const newCommentData = response.data;
      if (newCommentData) {
        console.log('Adding new comment to list:', newCommentData);
        // Inicializar campos de like
        const commentWithLikeData = {
          ...newCommentData,
          isLiked: false,
          likesCount: newCommentData.likesCount || 0
        };
        setComments(prev => [commentWithLikeData, ...prev]);
      }

      // Notificar al padre para actualizar el post en la lista
      if (onUpdate) {
        onUpdate({
          ...post,
          commentsCount: newCommentsCount
        });
      }
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
      <div className="bg-white rounded-none md:rounded-lg overflow-hidden md:flex max-w-7xl mx-auto" style={{ maxHeight: '90vh' }}>
        {/* Media Section - Left side on desktop */}
        {media.length > 0 && (
          <div className="relative bg-black flex-1 md:flex-shrink-0 flex items-center justify-center">
            {media[currentMediaIndex].type === 'image' ? (
              <img
                src={getImageUrl(media[currentMediaIndex].url)}
                alt={`Media ${currentMediaIndex + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
              />
            ) : (
              <video
                src={getImageUrl(media[currentMediaIndex].url)}
                controls
                className="w-full h-full object-cover"
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

        {/* Content Section - Right side on desktop */}
        <div className="w-full md:w-[400px] md:flex-shrink-0 md:flex md:flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link to={`/profile/${post.user?.id}`} className="flex items-center gap-3 hover:opacity-80">
              <img
                src={post.user?.avatar ? getImageUrl(post.user.avatar, 'social') : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || 'User')}&background=random`}
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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <MoreHorizontal size={20} />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-t-lg font-medium"
                    >
                      Eliminar publicación
                    </button>
                  )}
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Caption and comments area - scrollable on desktop */}
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Caption */}
            <div className="text-sm mb-4">
              <Link to={`/profile/${post.user?.id}`} className="flex items-start gap-2">
                <img
                  src={post.user?.avatar ? getImageUrl(post.user.avatar, 'social') : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name || 'User')}&background=random`}
                  alt={post.user?.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <span className="font-semibold hover:opacity-80">{post.user?.name}</span>
                  <span className="ml-2">{post.caption}</span>
                </div>
              </Link>
            </div>

            {/* Comments section - Always visible */}
            <div className="space-y-3 mb-4">
              {loadingComments ? (
                <p className="text-sm text-gray-400">Cargando comentarios...</p>
              ) : comments.length > 0 ? (
                (() => {
                  console.log('📝 Rendering comments:', comments);
                  // Crear un mapa de respuestas por comentario
                  const repliesMap = new Map();
                  const mainComments = [];

                  // Primero, identificar comentarios principales (que no empiezan con @)
                  comments.forEach(comment => {
                    if (!comment.text.trim().startsWith('@')) {
                      mainComments.push(comment);
                      repliesMap.set(comment.id, []);
                    }
                  });

                  // Luego, asociar respuestas con su comentario padre
                  comments.forEach(comment => {
                    const trimmedText = comment.text.trim();
                    if (trimmedText.startsWith('@')) {
                      // Extraer el nombre mencionado
                      const mentionMatch = trimmedText.match(/^@(\S+)/);
                      if (mentionMatch) {
                        const mentionedName = mentionMatch[1];

                        // Buscar el comentario más reciente de ese usuario antes de esta respuesta
                        const parentComment = mainComments
                          .filter(c =>
                            c.user?.name === mentionedName &&
                            new Date(c.createdAt) < new Date(comment.createdAt)
                          )
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

                        if (parentComment && repliesMap.has(parentComment.id)) {
                          repliesMap.get(parentComment.id).push(comment);
                        }
                      }
                    }
                  });

                  return mainComments.map((comment) => {
                    const replies = repliesMap.get(comment.id) || [];
                    const hasReplies = replies.length > 0;
                    const areRepliesVisible = showReplies[comment.id];

                    return (
                      <div key={comment.id}>
                        {/* Comentario principal */}
                        <div className="flex gap-2">
                          <Link to={`/profile/${comment.user?.id}`}>
                            <img
                              src={comment.user?.avatar ? getImageUrl(comment.user.avatar, 'social') : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}&background=random`}
                              alt={comment.user?.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          </Link>
                          <div className="flex-1">
                            <div className="text-sm">
                              <Link to={`/profile/${comment.user?.id}`} className="font-semibold hover:opacity-80">
                                {comment.user?.name}
                              </Link>
                              <span className="ml-2">{comment.text}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-gray-400">
                                {formatDate(comment.createdAt)}
                              </p>
                              {comment.likesCount > 0 && (
                                <p className="text-xs font-semibold text-gray-600">
                                  {comment.likesCount} {comment.likesCount === 1 ? 'like' : 'likes'}
                                </p>
                              )}
                              <button
                                onClick={() => handleCommentLike(comment.id)}
                                className={`text-xs font-semibold transition-colors ${
                                  comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Me gusta
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(comment);
                                  setCommentText(`@${comment.user?.name} `);
                                  commentInputRef.current?.focus();
                                  commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                              >
                                Responder
                              </button>
                              {hasReplies && (
                                <button
                                  onClick={() => setShowReplies(prev => ({
                                    ...prev,
                                    [comment.id]: !prev[comment.id]
                                  }))}
                                  className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                                >
                                  {areRepliesVisible ? 'Ocultar' : `Ver ${replies.length}`} {replies.length === 1 ? 'respuesta' : 'respuestas'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Respuestas anidadas */}
                        {hasReplies && areRepliesVisible && (
                          <div className="ml-10 mt-3 space-y-3 border-l-2 border-gray-200 pl-3">
                            {replies.map((reply) => (
                              <div key={reply.id} className="flex gap-2">
                                <Link to={`/profile/${reply.user?.id}`}>
                                  <img
                                    src={reply.user?.avatar ? getImageUrl(reply.user.avatar, 'social') : `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user?.name || 'User')}&background=random`}
                                    alt={reply.user?.name}
                                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                  />
                                </Link>
                                <div className="flex-1">
                                  <div className="text-sm">
                                    <Link to={`/profile/${reply.user?.id}`} className="font-semibold hover:opacity-80">
                                      {reply.user?.name}
                                    </Link>
                                    <span className="ml-2">{reply.text}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-xs text-gray-400">
                                      {formatDate(reply.createdAt)}
                                    </p>
                                    {reply.likesCount > 0 && (
                                      <p className="text-xs font-semibold text-gray-600">
                                        {reply.likesCount} {reply.likesCount === 1 ? 'like' : 'likes'}
                                      </p>
                                    )}
                                    <button
                                      onClick={() => handleCommentLike(reply.id)}
                                      className={`text-xs font-semibold transition-colors ${
                                        reply.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                    >
                                      Me gusta
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReplyingTo(comment);
                                        setCommentText(`@${reply.user?.name} `);
                                        commentInputRef.current?.focus();
                                        commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }}
                                      className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                                    >
                                      Responder
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
              ) : commentsCount > 0 ? (
                <p className="text-sm text-gray-500">No hay comentarios todavía</p>
              ) : null}
            </div>

            {/* Timestamp */}
            <p className="text-xs text-gray-400 uppercase mt-4">
              {formatDate(post.createdAt)}
            </p>
          </div>

          {/* Actions and comment input - fixed at bottom */}
          <div className="border-t border-gray-200">
            <div className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <button
                  onClick={handleLike}
                  className={`transition-colors ${isLiked ? 'text-red-500' : 'hover:text-gray-600'}`}
                >
                  <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => {
                    commentInputRef.current?.focus();
                    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="hover:text-gray-600 transition-colors"
                >
                  <MessageCircle size={24} />
                </button>
              </div>

              {/* Likes count */}
              {likesCount > 0 && (
                <p className="font-semibold text-sm mb-3">
                  {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
                </p>
              )}
            </div>

            {/* Comment input */}
            <div className="border-t border-gray-200 p-4">
              {replyingTo && (
                <div className="flex items-center justify-between mb-2 px-2 py-1 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">
                    Respondiendo a <span className="font-semibold">@{replyingTo.user?.name}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setCommentText('');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <form onSubmit={handleComment} className="flex items-center gap-3">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Agregar un comentario..."
                  className="flex-1 outline-none text-sm bg-transparent"
                  autoComplete="off"
                />
                {commentText.trim() && (
                  <button
                    type="submit"
                    className="font-semibold text-sm text-primary hover:text-primary-dark transition"
                  >
                    Publicar
                  </button>
                )}
              </form>
            </div>
          </div>
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
            src={getImageUrl(media[currentMediaIndex].url)}
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
