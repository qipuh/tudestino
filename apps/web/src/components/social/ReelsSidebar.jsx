import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Play, Heart, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api, { getImageUrl } from '../../services/api';
import ReelViewer from './ReelViewer';

function ReelsSidebar({ isOpen, onToggle }) {
  const { user: currentUser } = useAuthStore();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [selectedReel, setSelectedReel] = useState(null);

  useEffect(() => {
    loadReels();
  }, [currentUser]);

  const loadReels = async () => {
    try {
      setLoading(true);
      console.log('🎬 ReelsSidebar: Cargando reels...');
      const response = await api.get('/social/reels/feed');
      console.log('🎬 ReelsSidebar: Response completo:', response);
      const reelsData = response.data || response;
      console.log('🎬 ReelsSidebar: Reels data:', reelsData);
      console.log('🎬 ReelsSidebar: Es array?', Array.isArray(reelsData));

      const orderedReels = smartOrderReels(reelsData);
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
    if (!currentUser || !Array.isArray(reelsArray)) {
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
      {/* Toggle Button - Positioned relative to sidebar state */}
      <button
        onClick={onToggle}
        className="fixed top-1/2 -translate-y-1/2 z-50 text-gray-700 p-2 rounded-full transition-all bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
        style={{
          right: isOpen ? '22rem' : '0.5rem'
        }}
        title={isOpen ? 'Ocultar Reels' : 'Mostrar Reels'}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Sidebar - Full height from top */}
      <div
        className="fixed top-0 right-0 h-screen transition-all duration-300 z-30 overflow-hidden"
        style={{
          width: isOpen ? '22rem' : '0',
          background: isOpen
            ? 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(245,245,247,0.95) 15%, rgba(245,245,247,1) 30%)'
            : 'transparent',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        <div className="h-full flex flex-col pl-3 pr-3 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reels.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Play size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No hay reels disponibles</p>
              <p className="text-sm text-gray-400 mt-1">¡Sé el primero en crear uno!</p>
            </div>
          ) : (
            <>
              {/* Main Reel Display */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Navigation Arrow Up */}
                {currentReelIndex > 0 && (
                  <button
                    onClick={handlePrevReel}
                    className="self-center mb-3 p-1.5 rounded-full hover:bg-white/70 transition-colors"
                    title="Reel anterior"
                  >
                    <ChevronUp size={24} className="text-gray-600" />
                  </button>
                )}

                {/* Reel Card */}
                <div
                  onClick={openFullReel}
                  className="flex-1 relative bg-black rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all shadow-xl group min-h-0"
                >
                  {/* Video/Image */}
                  {currentReel?.videoUrl || currentReel?.video_url ? (
                    <video
                      src={getImageUrl(currentReel.videoUrl || currentReel.video_url, 'social')}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                    />
                ) : currentReel?.images && currentReel.images.length > 0 ? (
                    <img
                      src={getImageUrl(currentReel.images[0], 'social')}
                      alt={currentReel.content}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-dark to-secondary">
                      <p className="text-white text-center p-6 text-sm">
                        {currentReel?.content}
                      </p>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80">
                    {/* Play icon center */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Play size={32} className="text-white" fill="white" />
                      </div>
                    </div>

                    {/* User info - Top */}
                    <div className="absolute top-4 left-4 right-4">
                      <Link
                        to={`/profile/${currentReel?.user?.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/30">
                          {currentReel?.user?.avatar ? (
                            <img
                              src={getImageUrl(currentReel.user.avatar, 'social')}
                              alt={currentReel.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {currentReel?.user?.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm drop-shadow-lg">
                            {currentReel?.user?.name || 'Usuario'}
                          </p>
                          <p className="text-white/80 text-xs drop-shadow">Ver perfil</p>
                        </div>
                      </Link>
                    </div>

                    {/* Content and stats - Bottom */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm mb-3 line-clamp-2 drop-shadow-lg">
                        {currentReel?.content}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-white drop-shadow-lg">
                          <Heart size={18} />
                          <span className="text-sm font-medium">
                            {currentReel?.likesCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white drop-shadow-lg">
                          <MessageCircle size={18} />
                          <span className="text-sm font-medium">
                            {currentReel?.commentsCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Counter */}
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">
                        {currentReelIndex + 1} / {reels.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrow Down */}
                {currentReelIndex < reels.length - 1 && (
                  <button
                    onClick={handleNextReel}
                    className="self-center mt-3 p-1.5 rounded-full hover:bg-white/70 transition-colors"
                    title="Siguiente reel"
                  >
                    <ChevronDown size={24} className="text-gray-600" />
                  </button>
                )}
              </div>

              
            </>
          )}
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
