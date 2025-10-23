import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, MapPin, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { toggleLike, addComment, deleteReel } from '../services/socialApi';
import { Link } from 'react-router-dom';

/**
 * Card para mostrar un reel estilo TikTok/Instagram
 */
function ReelCard({ reel, onDelete, currentUserId, isActive }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likesCount || 0);
  const [viewsCount, setViewsCount] = useState(reel.viewsCount || 0);
  const [commentsCount, setCommentsCount] = useState(reel.commentsCount || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isOwner = currentUserId === reel.userId;

  // Auto play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Auto-play prevented:', err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const result = await toggleLike('reel', reel.id);
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
      await addComment('reel', reel.id, commentText);
      setCommentText('');
      setCommentsCount(prev => prev + 1);
      setShowCommentInput(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este reel?')) return;

    try {
      await deleteReel(reel.id);
      if (onDelete) onDelete(reel.id);
    } catch (error) {
      console.error('Error deleting reel:', error);
      alert('Error al eliminar el reel');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="relative w-full h-full bg-black snap-start snap-always">
      {/* Video */}
      <video
        ref={videoRef}
        src={`http://localhost:3000${reel.videoUrl}`}
        loop
        playsInline
        muted={isMuted}
        className="absolute inset-0 w-full h-full object-contain cursor-pointer"
        onClick={togglePlayPause}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          onClick={togglePlayPause}
        >
          <div className="bg-black bg-opacity-50 rounded-full p-6">
            <Play size={48} className="text-white" fill="white" />
          </div>
        </div>
      )}

      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition z-10"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="flex items-end justify-between gap-4">
          {/* Left side - User info and caption */}
          <div className="flex-1 pointer-events-auto">
            <Link
              to={`/profile/${reel.user?.id}`}
              className="flex items-center gap-3 mb-3 hover:opacity-80"
            >
              <img
                src={reel.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.user?.name || 'User')}&background=random`}
                alt={reel.user?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
              <div>
                <p className="font-semibold text-white text-sm">{reel.user?.name}</p>
                {reel.location && (
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <MapPin size={12} />
                    {reel.location}
                  </p>
                )}
              </div>
            </Link>

            {/* Caption */}
            <p className="text-white text-sm mb-2 line-clamp-2">
              {reel.caption}
            </p>

            {/* Views */}
            {viewsCount > 0 && (
              <p className="text-white/70 text-xs">
                {formatNumber(viewsCount)} {viewsCount === 1 ? 'reproducción' : 'reproducciones'}
              </p>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-col items-center gap-6 pointer-events-auto">
            {/* Like */}
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="bg-black/30 p-3 rounded-full group-hover:bg-black/50 transition">
                <Heart
                  size={28}
                  className={isLiked ? 'text-red-500' : 'text-white'}
                  fill={isLiked ? 'currentColor' : 'none'}
                  strokeWidth={1.5}
                />
              </div>
              {likesCount > 0 && (
                <span className="text-white text-xs font-semibold">
                  {formatNumber(likesCount)}
                </span>
              )}
            </button>

            {/* Comment */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentInput(!showCommentInput);
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="bg-black/30 p-3 rounded-full group-hover:bg-black/50 transition">
                <MessageCircle size={28} className="text-white" strokeWidth={1.5} />
              </div>
              {commentsCount > 0 && (
                <span className="text-white text-xs font-semibold">
                  {formatNumber(commentsCount)}
                </span>
              )}
            </button>

            {/* Share */}
            <button className="flex flex-col items-center gap-1 group">
              <div className="bg-black/30 p-3 rounded-full group-hover:bg-black/50 transition">
                <Send size={28} className="text-white" strokeWidth={1.5} />
              </div>
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="bg-black/30 p-3 rounded-full hover:bg-black/50 transition"
              >
                <MoreHorizontal size={28} className="text-white" strokeWidth={1.5} />
              </button>
              {showMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 rounded-t-lg"
                    >
                      Eliminar reel
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
        </div>
      </div>

      {/* Comment input */}
      {showCommentInput && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleComment} className="flex items-center gap-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Agregar un comentario..."
              className="flex-1 bg-white/20 text-white placeholder-white/60 px-4 py-2 rounded-full outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className={`font-semibold text-sm px-4 py-2 rounded-full ${
                commentText.trim()
                  ? 'bg-primary text-white'
                  : 'bg-white/20 text-white/40'
              }`}
            >
              Publicar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ReelCard;
