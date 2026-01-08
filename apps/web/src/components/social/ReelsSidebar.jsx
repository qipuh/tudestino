import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Play, Heart, MessageCircle, ChevronUp, ChevronDown, Video, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api, { getImageUrl } from '../../services/api';
import ReelViewer from './ReelViewer';

function ReelsSidebar({ isOpen, onToggle }) {
  const { user: currentUser } = useAuthStore();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [selectedReel, setSelectedReel] = useState(null);
  const sidebarRef = useRef(null);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    loadReels();
  }, [currentUser]);

  // Touch/Swipe events for navigation
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar || !isOpen) return;

    const handleTouchStart = (e) => {
      if (e.target.closest('.reel-card')) {
        startYRef.current = e.touches[0].clientY;
        isDraggingRef.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (startYRef.current === 0) return;

      const deltaY = e.touches[0].clientY - startYRef.current;

      if (Math.abs(deltaY) > 10) {
        isDraggingRef.current = true;
      }
    };

    const handleTouchEnd = (e) => {
      if (!isDraggingRef.current || startYRef.current === 0) {
        startYRef.current = 0;
        isDraggingRef.current = false;
        return;
      }

      const deltaY = e.changedTouches[0].clientY - startYRef.current;

      // Swipe down = previous reel
      if (deltaY > 50 && currentReelIndex > 0) {
        setCurrentReelIndex(currentReelIndex - 1);
      }
      // Swipe up = next reel
      else if (deltaY < -50 && currentReelIndex < reels.length - 1) {
        setCurrentReelIndex(currentReelIndex + 1);
      }

      startYRef.current = 0;
      isDraggingRef.current = false;
    };

    sidebar.addEventListener('touchstart', handleTouchStart);
    sidebar.addEventListener('touchmove', handleTouchMove);
    sidebar.addEventListener('touchend', handleTouchEnd);

    return () => {
      sidebar.removeEventListener('touchstart', handleTouchStart);
      sidebar.removeEventListener('touchmove', handleTouchMove);
      sidebar.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, currentReelIndex, reels.length]);

  const loadReels = async () => {
    try {
      setLoading(true);
      console.log('🎬 ReelsSidebar: Cargando reels...');
      const response = await api.get('/social/reels/feed');
      console.log('🎬 ReelsSidebar: Response completo:', response);
      const reelsData = response.data || response;
      console.log('🎬 ReelsSidebar: Reels data:', reelsData);

      // Extraer el array de reels correctamente
      const reelsArray = Array.isArray(reelsData) ? reelsData : (reelsData.reels || []);
      console.log('🎬 ReelsSidebar: Reels array:', reelsArray);
      console.log('🎬 ReelsSidebar: Es array?', Array.isArray(reelsArray));

      const orderedReels = smartOrderReels(reelsArray);
      console.log('🎬 ReelsSidebar: Reels ordenados:', orderedReels);
      setReels(orderedReels);
    } catch (error) {
      console.error('❌ Error loading reels:', error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const smartOrderReels = (reelsArray) => {
    // Si no es un array, devolver array vacío
    if (!Array.isArray(reelsArray)) {
      return [];
    }

    // Si no hay usuario actual, solo mezclar aleatoriamente
    if (!currentUser) {
      return shuffleArray([...reelsArray]);
    }

    const userLikes = JSON.parse(localStorage.getItem('userLikes') || '[]');
    const userComments = JSON.parse(localStorage.getItem('userComments') || '[]');

    const scoredReels = reelsArray.map(reel => {
      let score = Math.random();

      const hasLikedCreator = userLikes.some(like => like.userId === reel.user?.id);
      const hasCommentedCreator = userComments.some(comment => comment.userId === reel.user?.id);

      if (hasLikedCreator) score += 2;
      if (hasCommentedCreator) score += 3;
      if (reel.likesCount > 100) score += 0.5;
      if (reel.commentsCount > 20) score += 0.5;

      const daysOld = (Date.now() - new Date(reel.createdAt || reel.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) score += 1;

      return { ...reel, score };
    });

    return scoredReels
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...reel }) => reel);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handlePrevReel = () => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    }
  };

  const handleNextReel = () => {
    if (currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
    }
  };

  const openFullReel = () => {
    if (reels[currentReelIndex]) {
      setSelectedReel(reels[currentReelIndex]);
    }
  };

  const handleNavigate = (newIndex) => {
    setCurrentReelIndex(newIndex);
    setSelectedReel(reels[newIndex]);
  };

  const currentReel = reels[currentReelIndex];

  return (
    <>
      {/* Floating Button - Only visible when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 group"
          title="Ver Reels"
        >
          {/* Pulsating outer ring */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: '#ffb548' }}></div>

          {/* Main button */}
          <div className="relative text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110" style={{ backgroundColor: '#002c91' }}>
            <Video size={28} className="animate-pulse" />

            {/* Badge with reel count */}
            {reels.length > 0 && (
              <div className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white" style={{ backgroundColor: '#ffb548' }}>
                {reels.length > 99 ? '99+' : reels.length}
              </div>
            )}

            {/* Sparkle effect */}
            <Sparkles className="absolute -top-1 -left-1 animate-bounce" style={{ color: '#ffb548' }} size={16} />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-xl" style={{ backgroundColor: '#002c91' }}>
              ¡Descubre Reels! 🎬
              <div className="absolute top-full right-4 -mt-1">
                <div className="border-4 border-transparent" style={{ borderTopColor: '#002c91' }}></div>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Overlay Background - SOLO EN MOBILE */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar - Overlay con position fixed */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-screen transition-transform duration-300 z-50"
        style={{
          width: '24rem',
          maxWidth: '90vw',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        <div className="h-full bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Video size={24} className="text-primary" />
              <h2 className="text-lg font-bold text-gray-900">Reels</h2>
              {reels.length > 0 && (
                <span className="text-xs text-gray-500">({reels.length})</span>
              )}
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Cerrar"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : reels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <Video size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium text-lg">No hay reels disponibles</p>
                <p className="text-sm text-gray-400 mt-2">¡Sé el primero en crear uno!</p>
              </div>
            ) : (
              <div className="h-full flex flex-col p-4">
                {/* Navigation Arrow Up */}
                {currentReelIndex > 0 && (
                  <button
                    onClick={handlePrevReel}
                    className="self-center mb-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Reel anterior"
                  >
                    <ChevronUp size={24} className="text-gray-600" />
                  </button>
                )}

                {/* Reel Card */}
                <div
                  onClick={openFullReel}
                  className="reel-card flex-1 relative bg-black rounded-2xl overflow-hidden cursor-pointer hover:ring-4 hover:ring-primary/30 transition-all shadow-xl group"
                >
                  {/* Video/Image */}
                  {currentReel?.videoUrl || currentReel?.video_url ? (
                    <video
                      src={getImageUrl(currentReel.videoUrl || currentReel.video_url, 'social')}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  ) : currentReel?.images && currentReel.images.length > 0 ? (
                    <img
                      src={getImageUrl(currentReel.images[0], 'social')}
                      alt={currentReel.content}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-dark to-secondary">
                      <p className="text-white text-center p-6">
                        {currentReel?.content}
                      </p>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80">
                    {/* Play icon center */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-5">
                        <Play size={40} className="text-white" fill="white" />
                      </div>
                    </div>

                    {/* User info - Top */}
                    <div className="absolute top-4 left-4 right-4">
                      <Link
                        to={`/profile/${currentReel?.user?.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/40">
                          {currentReel?.user?.avatar ? (
                            <img
                              src={getImageUrl(currentReel.user.avatar, 'social')}
                              alt={currentReel.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {currentReel?.user?.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold drop-shadow-lg">
                            {currentReel?.user?.name || 'Usuario'}
                          </p>
                          <p className="text-white/90 text-xs drop-shadow">@{currentReel?.user?.username || 'usuario'}</p>
                        </div>
                      </Link>
                    </div>

                    {/* Content and stats - Bottom */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm mb-3 line-clamp-2 drop-shadow-lg">
                        {currentReel?.content}
                      </p>

                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-white drop-shadow-lg">
                          <Heart size={20} />
                          <span className="font-medium">
                            {currentReel?.likesCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white drop-shadow-lg">
                          <MessageCircle size={20} />
                          <span className="font-medium">
                            {currentReel?.commentsCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Counter */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-white text-sm font-medium">
                        {currentReelIndex + 1} / {reels.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrow Down */}
                {currentReelIndex < reels.length - 1 && (
                  <button
                    onClick={handleNextReel}
                    className="self-center mt-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Siguiente reel"
                  >
                    <ChevronDown size={24} className="text-gray-600" />
                  </button>
                )}

                {/* Swipe instruction */}
                <p className="text-center text-xs text-gray-400 mt-3">
                  Desliza para cambiar de reel
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reel Viewer Modal */}
      {selectedReel && (
        <ReelViewer
          reel={selectedReel}
          reels={reels}
          currentIndex={currentReelIndex}
          onNavigate={handleNavigate}
          onClose={() => setSelectedReel(null)}
          isOwnProfile={selectedReel.user?.id === currentUser?.id}
        />
      )}
    </>
  );
}

export default ReelsSidebar;
