import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, Play, ChevronLeft, ChevronRight, MoreHorizontal, MapPin, X } from 'lucide-react';
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

  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(reel.commentsCount || 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showReplies, setShowReplies] = useState({});

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const response = await getPostComments(reel.id, 'reel');
      console.log('🔍 loadComments - Full response:', response);

      const commentsArray = response?.comments || response?.data?.comments || [];
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
      const response = await togglePostLike(reel.id, 'reel');
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
      const response = await addComment(reel.id, newComment.trim(), 'reel', null);
      const newCommentData = response?.data;

      if (newCommentData) {
        setComments([newCommentData, ...comments]);
        setCommentsCount(commentsCount + 1);
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

      const liked = response?.liked ?? response?.data?.liked;

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
    const areRepliesVisible = showReplies[comment.id];

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
                className={`text-xs font-semibold transition-colors ${
                  comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
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
              {hasReplies && !isReply && (
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

        {/* Nested replies */}
        {hasReplies && areRepliesVisible && (
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
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50" onClick={onClose} />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-lg overflow-hidden flex max-w-7xl w-full mx-auto relative"
          style={{ maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
          >
            <X size={32} />
          </button>

          {/* Previous button */}
          {hasPrevious && (
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next button */}
          {hasNext && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Video Section - Left side */}
          <div className="relative bg-black flex-1 flex items-center justify-center">
            {reel.videoUrl || reel.video_url ? (
              <video
                src={getImageUrl(reel.videoUrl || reel.video_url, 'social')}
                className="max-w-full max-h-[90vh] object-contain"
                controls
                autoPlay
                loop
                playsInline
              />
            ) : (
              <div className="flex items-center justify-center text-white text-center p-8">
                <div>
                  <Play size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{reel.caption || reel.content || 'Contenido no disponible'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section - Right side */}
          <div className="w-full md:w-[400px] flex-shrink-0 flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link to={`/profile/${reel.user?.id}`} onClick={onClose} className="flex items-center gap-3 hover:opacity-80">
                <img
                  src={reel.user?.avatar ? getImageUrl(reel.user.avatar, 'social') : `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.user?.name || 'User')}&background=random`}
                  alt={reel.user?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm">{reel.user?.name || 'Usuario'}</p>
                  {reel.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {reel.location}
                    </p>
                  )}
                </div>
              </Link>
              {!isOwnProfile && reel.user?.id && (
                <FollowButton
                  userId={reel.user.id}
                  initialIsFollowing={reel.user.isFollowing}
                  onFollowChange={onFollowChange}
                  className="ml-auto"
                />
              )}
            </div>

            {/* Caption and comments area - scrollable */}
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {/* Caption */}
              {(reel.caption || reel.content) && (
                <div className="text-sm mb-4">
                  <Link to={`/profile/${reel.user?.id}`} onClick={onClose} className="flex items-start gap-2">
                    <img
                      src={reel.user?.avatar ? getImageUrl(reel.user.avatar, 'social') : `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.user?.name || 'User')}&background=random`}
                      alt={reel.user?.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <span className="font-semibold hover:opacity-80">{reel.user?.name}</span>
                      <span className="ml-2">{reel.caption || reel.content}</span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Comments section */}
              <div className="space-y-3 mb-4">
                {loadingComments ? (
                  <p className="text-sm text-gray-400">Cargando comentarios...</p>
                ) : comments.length > 0 ? (
                  (() => {
                    // Separar comentarios principales de respuestas
                    const repliesMap = new Map();
                    const mainComments = [];

                    comments.forEach(comment => {
                      if (!comment.parentCommentId) {
                        mainComments.push(comment);
                        repliesMap.set(comment.id, []);
                      }
                    });

                    // Asociar respuestas
                    comments.forEach(comment => {
                      if (comment.parentCommentId && repliesMap.has(comment.parentCommentId)) {
                        repliesMap.get(comment.parentCommentId).push(comment);
                      }
                    });

                    return mainComments.map(comment => {
                      const replies = repliesMap.get(comment.id) || [];
                      return renderComment({ ...comment, replies }, false);
                    });
                  })()
                ) : (
                  <p className="text-sm text-gray-500">No hay comentarios todavía</p>
                )}
              </div>

              {/* Timestamp */}
              <p className="text-xs text-gray-400 uppercase mt-4">
                {formatDate(reel.createdAt || reel.created_at || Date.now())}
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
