import { useState, useEffect, useRef } from 'react';
import { getReelsFeed } from '../services/socialApi';
import ReelCard from '../components/ReelCard';
import useAuthStore from '../../../store/authStore';
import { Loader, Video } from 'lucide-react';

/**
 * Página de Reels - Scroll vertical estilo TikTok/Instagram
 */
function ReelsPage() {
  const { user } = useAuthStore();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    loadReels();
  }, []);

  // Intersection Observer para detectar el reel visible
  useEffect(() => {
    if (reels.length === 0) return;

    const options = {
      root: containerRef.current,
      threshold: 0.5,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setCurrentIndex(index);

          // Cargar más reels cuando llegue al penúltimo
          if (index >= reels.length - 2 && hasMore) {
            loadReels(page + 1);
          }
        }
      });
    }, options);

    // Observar todos los reels
    const reelElements = document.querySelectorAll('.reel-item');
    reelElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [reels, hasMore, page]);

  const loadReels = async (pageNum = 1) => {
    if (pageNum > 1 && !hasMore) return;

    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      const response = await getReelsFeed(pageNum, 10);
      const newReels = response.data?.reels || [];

      if (pageNum === 1) {
        setReels(newReels);
      } else {
        setReels(prev => [...prev, ...newReels]);
      }

      setHasMore(newReels.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReel = (reelId) => {
    setReels(prev => prev.filter(reel => reel.id !== reelId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-white" size={48} />
          <p className="text-white">Cargando reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden">
      {reels.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Video size={64} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay reels aún
            </h3>
            <p className="text-gray-400">
              Sé el primero en compartir tus aventuras
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>
            {`
              .h-screen::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              data-index={index}
              className="reel-item h-screen w-full"
            >
              <ReelCard
                reel={reel}
                currentUserId={user?.id}
                onDelete={handleDeleteReel}
                isActive={index === currentIndex}
              />
            </div>
          ))}

          {/* Loading indicator when loading more */}
          {hasMore && reels.length > 0 && (
            <div className="h-20 flex items-center justify-center">
              <Loader className="animate-spin text-white" size={32} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReelsPage;
