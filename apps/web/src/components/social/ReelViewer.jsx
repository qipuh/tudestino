import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, Play, ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';
import FollowButton from './FollowButton';
import { togglePostLike, getPostComments, addComment, toggleCommentLike } from '../../services/reelsService';
import { getImageUrl } from '../../services/api';
import useAuthStore from '../../store/authStore';

function ReelViewer({ reel, onClose, isOwnProfile, onFollowChange, reels = [], currentIndex = 0, onNavigate }) {
  const { user: currentUser } = useAuthStore();
  const commentInputRef = useRef(null);

  // Validate reel prop
  if (!reel || !reel.id) {
    console.error('ReelViewer: Invalid reel prop', reel);
    return null;
  }

  // Detectar el tipo de contenido automáticamente
  // Si es un business post, usar el tipo del campo 'type'
  // Si es un user post/reel, detectar por videoUrl (reel) o images (post)
  const contentType = reel.type || (reel.videoUrl || reel.video_url ? 'reel' : 'post');
  console.log('🔍 ReelViewer - Content type:', contentType, 'for reel:', reel);

  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(reel.commentsCount || 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const response = await getPostComments(reel.id, contentType);
      console.log('🔍 loadComments - Full response:', response);

      // API retorna: { success, data: { comments: [...], pagination } }
      // El interceptor extrae response.data, quedando: { success, data: { comments } }
      const commentsArray = response?.data?.comments || [];
      console.log('🔍 loadComments - Comments array:', commentsArray);

      setComments(commentsArray);
    } catch (error) {
      console.error('❌ Error loading comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Update state when reel changes (for navigation)
  useEffect(() => {
    console.log('🎬 Reel data:', {
      id: reel.id,
      isLiked: reel.isLiked,
      likesCount: reel.likesCount,
      commentsCount: reel.commentsCount
    });

    setIsLiked(reel.isLiked || false);
    setLikesCount(reel.likesCount || 0);
    setCommentsCount(reel.commentsCount || 0);
    setComments([]);
    setNewComment('');
    setReplyingTo(null);
    loadComments();
  }, [reel.id]);

  const handleLike = async () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    try {
      const response = await togglePostLike(reel.id, contentType);
      console.log('👍 handleLike - Response:', response);
      // API retorna: { success, message, data: { liked: true/false } }
      // El interceptor extrae response.data, quedando: { success, message, data: { liked } }
      const liked = response?.data?.liked;

      if (liked !== undefined) {
        setIsLiked(liked);
        setLikesCount(liked ? likesCount + 1 : likesCount - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Error al dar like. Por favor intenta nuevamente.');
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleAddComment = async (e) => {
    e?.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    try {
      // Si estamos respondiendo a un comentario, usar su ID como parentCommentId
      const parentCommentId = replyingTo ? replyingTo.id : null;
      const response = await addComment(reel.id, newComment.trim(), contentType, parentCommentId);
      console.log('💬 handleAddComment - Response:', response);
      // API retorna: { success, message, data: commentObject }
      // El interceptor extrae response.data, quedando: { success, message, data: commentObject }
      const newCommentData = response?.data;

      if (newCommentData) {
        if (parentCommentId) {
          // Es una respuesta, agregar al array de replies del comentario padre
          const updateComments = (commentsList) => {
            return commentsList.map(c => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newCommentData],
                };
              }
              return c;
            });
          };
          setComments(updateComments(comments));
          // No incrementar commentsCount para respuestas, solo para comentarios principales
        } else {
          // Es un comentario principal, agregar al inicio
          setComments([newCommentData, ...comments]);
          setCommentsCount(commentsCount + 1);
        }
      }

      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error al agregar comentario. Por favor intenta nuevamente.');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    try {
      const response = await toggleCommentLike(commentId);
      console.log('💬 toggleCommentLike response:', response);

      // API retorna: { success, message, data: { liked: true/false } }
      // El interceptor extrae response.data, quedando: { success, message, data: { liked } }
      const liked = response?.data?.liked;

      if (liked === undefined) {
        console.error('❌ Invalid response from toggleCommentLike:', response);
        return;
      }

      console.log('✅ Like toggled, new state:', liked);

      // Update comment in state recursively
      const updateCommentLike = (commentsList) => {
        return commentsList.map(c => {
          if (c.id === commentId) {
            const newLikesCount = liked
              ? (c.likesCount || 0) + 1
              : Math.max((c.likesCount || 0) - 1, 0);

            console.log(`📊 Actualizando comentario ${commentId}: isLiked=${liked}, likesCount=${newLikesCount}`);

            return {
              ...c,
              isLiked: liked,
              likesCount: newLikesCount,
            };
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: updateCommentLike(c.replies),
            };
          }
          return c;
        });
      };

      setComments(updateCommentLike(comments));
    } catch (error) {
      console.error('❌ Error toggling comment like:', error);
      alert('Error al dar like al comentario.');
    }
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

  const renderComment = (comment, isReply = false) => {
    if (!comment || !comment.user) {
      console.warn('Comment missing user data:', comment);
      return null;
    }

    const replies = comment.replies || [];
    const hasReplies = replies.length > 0;

    return (
      <div key={comment.id}>
        {/* Main comment */}
        <div className="flex gap-2">
          <Link to={`/profile/${comment.user.id}`} onClick={onClose}>
            <img
              src={comment.user?.avatar ? getImageUrl(comment.user.avatar, 'social') : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}&background=random`}
              alt={comment.user?.name}
              className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full object-cover flex-shrink-0`}
            />
          </Link>
          <div className="flex-1">
            <div className="text-sm">
              <Link to={`/profile/${comment.user.id}`} onClick={onClose} className="font-semibold hover:opacity-80">
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
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                  comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Heart
                  size={14}
                  className={comment.isLiked ? 'fill-red-500' : ''}
                />
                Me gusta
              </button>
              {!isReply && (
                <button
                  onClick={() => {
                    setReplyingTo(comment);
                    setNewComment(`@${comment.user?.name} `);
                    commentInputRef.current?.focus();
                    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Responder
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Nested replies - Always visible */}
        {hasReplies && (
          <div className="ml-10 mt-3 space-y-3 border-l-2 border-gray-200 pl-3">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  const hasPrevious = reels.length > 0 && currentIndex > 0;
  const hasNext = reels.length > 0 && currentIndex < reels.length - 1;

  const handlePrevious = (e) => {
    e.stopPropagation();
    if (hasPrevious && onNavigate) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (hasNext && onNavigate) {
      onNavigate(currentIndex + 1);
    }
  };

  return (
    <>
      {/* Full-screen backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 bg-black bg-opacity-50 rounded-full p-2"
        >
          <X size={24} />
        </button>

        {/* Previous button */}
        {hasPrevious && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Next button */}
        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* Two-column modal container */}
        <div
          className="bg-white w-full max-w-7xl h-[90vh] flex flex-col md:flex-row rounded-lg overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* LEFT COLUMN: Image/Video */}
          <div className="relative bg-black flex items-center justify-center md:w-[60%] md:h-full h-[50vh] md:min-h-0">
            {(() => {
              // Soportar ambas estructuras: user posts (videoUrl) y business posts (media array)
              const videoUrl = reel.videoUrl || reel.video_url;
              const mediaVideo = reel.media?.find(m => m.type === 'video');
              const mediaImage = reel.media?.find(m => m.type === 'image');
              const userImage = reel.images?.[0];

              if (videoUrl || mediaVideo) {
                const src = videoUrl || mediaVideo?.url;
                return (
                  <video
                    src={getImageUrl(src, 'social')}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    loop
                    playsInline
                  />
                );
              } else if (mediaImage || userImage) {
                const src = mediaImage?.url || userImage;
                return (
                  <img
                    src={getImageUrl(src, 'social')}
                    alt={reel.caption || reel.content}
                    className="w-full h-full object-contain"
                  />
                );
              } else {
                return (
                  <div className="flex items-center justify-center text-white text-center p-8">
                    <div>
                      <Play size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg">{reel.caption || reel.content || 'Contenido no disponible'}</p>
                    </div>
                  </div>
                );
              }
            })()}
          </div>

          {/* RIGHT COLUMN: Comments and Interactions */}
          <div className="flex-1 md:w-[40%] flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              {(() => {
                // Soportar ambas estructuras: user posts y business posts
                const isBusinessPost = reel.business;
                const profile = isBusinessPost ? reel.business : reel.user;
                const profileLink = isBusinessPost
                  ? `/business/${profile?.id}`
                  : `/profile/${profile?.id}`;
                const profileImage = isBusinessPost ? profile?.logo : profile?.avatar;
                const profileName = profile?.name || 'Usuario';

                return (
                  <>
                    <Link to={profileLink} onClick={onClose} className="flex items-center gap-3 hover:opacity-80">
                      <img
                        src={profileImage ? getImageUrl(profileImage, isBusinessPost ? 'business' : 'social') : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=random`}
                        alt={profileName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm">{profileName}</p>
                        {reel.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={12} />
                            {reel.location}
                          </p>
                        )}
                      </div>
                    </Link>
                    {!isOwnProfile && profile?.id && !isBusinessPost && (
                      <FollowButton
                        userId={profile.id}
                        initialIsFollowing={profile.isFollowing}
                        onFollowChange={onFollowChange}
                        className="ml-auto"
                      />
                    )}
                  </>
                );
              })()}
            </div>

            {/* Caption and comments area - scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Caption */}
              {(reel.caption || reel.content) && (() => {
                const isBusinessPost = reel.business;
                const profile = isBusinessPost ? reel.business : reel.user;
                const profileLink = isBusinessPost
                  ? `/business/${profile?.id}`
                  : `/profile/${profile?.id}`;
                const profileImage = isBusinessPost ? profile?.logo : profile?.avatar;
                const profileName = profile?.name || 'Usuario';

                return (
                  <div className="text-sm mb-4 pb-4 border-b border-gray-100">
                    <Link to={profileLink} onClick={onClose} className="flex items-start gap-2">
                      <img
                        src={profileImage ? getImageUrl(profileImage, isBusinessPost ? 'business' : 'social') : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=random`}
                        alt={profileName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="font-semibold hover:opacity-80">{profileName}</span>
                        <span className="ml-2">{reel.caption || reel.content}</span>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(reel.createdAt || reel.created_at || Date.now())}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })()}

              {/* Comments section */}
              <div className="space-y-4">
                {loadingComments ? (
                  <p className="text-sm text-gray-400">Cargando comentarios...</p>
                ) : comments.length > 0 ? (
                  // El backend ya envía los comentarios con sus replies anidadas
                  comments.map(comment => renderComment(comment, false))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No hay comentarios todavía</p>
                )}
              </div>
            </div>

            {/* Actions and comment input - fixed at bottom */}
            <div className="border-t border-gray-200 flex-shrink-0">
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
                    }}
                    className="hover:text-gray-600 transition-colors"
                  >
                    <MessageCircle size={24} />
                  </button>
                  <button className="hover:text-gray-600 transition-colors">
                    <Send size={24} />
                  </button>
                  <button
                    onClick={handleSave}
                    className={`ml-auto transition-colors ${isSaved ? 'text-yellow-500' : 'hover:text-gray-600'}`}
                  >
                    <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
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
                        setNewComment('');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <form onSubmit={handleAddComment} className="flex items-center gap-3">
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Agrega un comentario..."
                    className="flex-1 outline-none text-sm bg-transparent"
                    autoComplete="off"
                  />
                  {newComment.trim() && (
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
      </div>
    </>
  );
}

export default ReelViewer;
