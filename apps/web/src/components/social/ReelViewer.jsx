import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import FollowButton from './FollowButton';
import { togglePostLike, getPostComments, addComment, toggleCommentLike } from '../../services/reelsService';
import useAuthStore from '../../store/authStore';

function ReelViewer({ reel, onClose, isOwnProfile, onFollowChange, reels = [], currentIndex = 0, onNavigate }) {
  const { user: currentUser } = useAuthStore();

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

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const fetchedComments = await getPostComments(reel.id);
      setComments(fetchedComments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]); // Ensure comments is always an array
    } finally {
      setLoadingComments(false);
    }
  };

  // Update state when reel changes (for navigation)
  useEffect(() => {
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
      const response = await togglePostLike(reel.id);
      // Handle both response formats
      const liked = response?.liked ?? response?.data?.liked;
      const count = response?.likesCount ?? response?.data?.likesCount;

      if (liked !== undefined) {
        setIsLiked(liked);
      }
      if (count !== undefined) {
        setLikesCount(count);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Error al dar like. Por favor intenta nuevamente.');
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality in backend
    setIsSaved(!isSaved);
  };

  const handleAddComment = async (parentId = null) => {
    if (!newComment.trim()) return;

    if (!currentUser) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    try {
      const comment = await addComment(reel.id, {
        text: newComment,
        parentId,
      });

      if (parentId) {
        // Add reply to parent comment
        setComments(comments.map(c => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), comment],
            };
          }
          return c;
        }));
      } else {
        // Add new top-level comment
        setComments([...comments, comment]);
      }

      setCommentsCount(commentsCount + 1);
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
      // Handle both response formats
      const liked = response?.liked ?? response?.data?.liked;
      const count = response?.likesCount ?? response?.data?.likesCount;

      // Update comment in state
      const updateCommentLike = (commentsList) => {
        return commentsList.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              isLiked: liked !== undefined ? liked : c.isLiked,
              likesCount: count !== undefined ? count : c.likesCount,
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
      console.error('Error toggling comment like:', error);
      alert('Error al dar like al comentario.');
    }
  };

  const renderComment = (comment, isReply = false) => {
    // Safety check for user data
    if (!comment || !comment.user) {
      console.warn('Comment missing user data:', comment);
      return null;
    }

    return (
      <div key={comment.id} className={`${isReply ? 'ml-10' : ''} mb-4`}>
        <div className="flex gap-2">
          <Link to={`/profile/${comment.user.id}`} onClick={onClose}>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-white">
              {comment.user.avatar ? (
                <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                comment.user.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
          </Link>
          <div className="flex-1">
            <p className="text-sm text-white">
              <Link to={`/profile/${comment.user.id}`} onClick={onClose} className="font-semibold mr-2 hover:underline">
                {comment.user.name || 'Usuario'}
              </Link>
              {comment.text}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-white/70">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`text-xs font-medium ${comment.isLiked ? 'text-red-400' : 'text-white/70 hover:text-red-400'}`}
              >
                {comment.likesCount > 0 ? `${comment.likesCount} Me gusta` : 'Me gusta'}
              </button>
              {!isReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-xs text-white/70 hover:text-white font-medium"
                >
                  Responder
                </button>
              )}
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(comment.id)}
                  placeholder={`Responder a ${comment.user?.name || 'usuario'}...`}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  autoFocus
                />
                <button
                  onClick={() => handleAddComment(comment.id)}
                  disabled={!newComment.trim()}
                  className="px-3 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
                >
                  Enviar
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment('');
                  }}
                  className="px-3 py-2 text-white hover:text-gray-300 text-sm"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
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
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={onClose}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button */}
      {hasPrevious && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition"
          title="Reel anterior"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition"
          title="Siguiente reel"
        >
          <ChevronRight size={32} />
        </button>
      )}

      <div className="w-full max-w-5xl h-screen flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-4 h-[90vh] w-full">
          {/* Video Section */}
          <div className="relative flex-1 bg-black rounded-lg overflow-hidden flex items-center justify-center">
            {reel.videoUrl || reel.video_url ? (
              <video
                src={reel.videoUrl || reel.video_url}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                loop
                playsInline
              />
            ) : reel.images && reel.images.length > 0 ? (
              <img
                src={reel.images[0]}
                alt={reel.content}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center text-white text-center p-8">
                <div>
                  <Play size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{reel.content || 'Contenido no disponible'}</p>
                </div>
              </div>
            )}

            {/* Overlay con info del reel */}
            {reel.user && (
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none">
                {/* Top info */}
                <div className="absolute top-4 left-4 right-4 pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${reel.user.id}`} onClick={onClose}>
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 cursor-pointer hover:ring-2 hover:ring-white">
                        {reel.user.avatar ? (
                          <img src={reel.user.avatar} alt={reel.user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          reel.user.name?.charAt(0) || '?'
                        )}
                      </div>
                    </Link>
                    <div>
                      <Link to={`/profile/${reel.user.id}`} onClick={onClose}>
                        <p className="font-semibold text-white text-sm hover:underline cursor-pointer">{reel.user.name || 'Usuario'}</p>
                      </Link>
                      <p className="text-xs text-white/80">
                        {new Date(reel.createdAt || reel.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    {!isOwnProfile && reel.user.id && (
                      <FollowButton
                        userId={reel.user.id}
                        initialIsFollowing={reel.user.isFollowing}
                        onFollowChange={onFollowChange}
                        className="ml-auto px-4 py-1 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100"
                      />
                    )}
                  </div>
                </div>

                {/* Bottom caption */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-sm mb-2">{reel.content}</p>
                </div>
              </div>
            )}
          </div>

          {/* Comments Sidebar */}
          <div className="w-96 bg-gray-900 rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Comentarios</h3>
            </div>

            {/* Interactions */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-white hover:text-red-500'}`}
                >
                  <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                  <span className="text-sm font-semibold">{likesCount}</span>
                </button>
                <div className="flex items-center gap-2 text-white">
                  <MessageCircle size={24} />
                  <span className="text-sm font-semibold">{commentsCount}</span>
                </div>
                <button className="text-white hover:text-blue-400 transition">
                  <Send size={24} />
                </button>
                <button
                  onClick={handleSave}
                  className={`ml-auto transition-all ${isSaved ? 'text-yellow-500 scale-110' : 'text-white hover:text-yellow-500'}`}
                >
                  <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingComments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : !comments || comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No hay comentarios aún</p>
                  <p className="text-gray-500 text-sm mt-1">Sé el primero en comentar</p>
                </div>
              ) : (
                comments.map(comment => renderComment(comment))
              )}
            </div>

            {/* Add Comment */}
            {currentUser && !replyingTo && (
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Agrega un comentario..."
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    onClick={() => handleAddComment()}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReelViewer;
