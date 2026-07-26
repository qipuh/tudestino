import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Heart, MessageCircle, ChevronUp, ChevronDown, ChevronRight, Video, Sparkles, Image as ImageIcon, Grid3x3 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api, { getImageUrl } from '../../services/api';
import ReelViewer from './ReelViewer';

function ReelsSidebar({ isOpen, onToggle, userId, filterByUser = false, businessId, filterByBusiness = false }) {
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('reels'); // 'reels' | 'posts'
  const [reels, setReels] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [selectedReel, setSelectedReel] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const sidebarRef = useRef(null);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (activeTab === 'reels') {
      loadReels();
    } else {
      loadPosts();
    }
  }, [currentUser, userId, filterByUser, businessId, filterByBusiness, activeTab]);

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

      let endpoint = '/social/reels/feed';

      // Si está filtrado por usuario, usar el endpoint de reels de usuario
      if (filterByUser && userId) {
        endpoint = `/social/users/${userId}/reels`;
        console.log('🎬 ReelsSidebar: Cargando reels de usuario:', userId);
      }
      // Si está filtrado por negocio, usar el endpoint de posts de negocio con tipo reel
      else if (filterByBusiness && businessId) {
        endpoint = `/businesses/${businessId}/posts?type=reel`;
        console.log('🎬 ReelsSidebar: Cargando reels de negocio:', businessId);
      } else {
        console.log('🎬 ReelsSidebar: Cargando reels del feed general');
      }

      const response = await api.get(endpoint);
      // El interceptor de axios ya extrae response.data
      const reelsData = response;

      // Extraer el array de reels correctamente
      let reelsArray = [];

      if (filterByBusiness) {
        // Business posts: { posts: [...], total, page, pages }
        if (reelsData.posts) {
          reelsArray = reelsData.posts;
        } else if (Array.isArray(reelsData)) {
          reelsArray = reelsData;
        }
      } else if (filterByUser) {
        // User reels: puede venir como { reels: [...] } o directamente array
        reelsArray = Array.isArray(reelsData) ? reelsData : (reelsData.reels || []);
      } else {
        // Feed general: puede venir como { success: true, data: { reels: [...] } } o { reels: [...] }
        if (reelsData.data && reelsData.data.reels) {
          reelsArray = reelsData.data.reels;
        } else if (reelsData.reels) {
          reelsArray = reelsData.reels;
        } else if (Array.isArray(reelsData)) {
          reelsArray = reelsData;
        } else if (reelsData.data && Array.isArray(reelsData.data)) {
          // Caso donde data es directamente el array
          reelsArray = reelsData.data;
        }
      }

      console.log('🎬 ReelsSidebar: Reels array final:', reelsArray);
      console.log('🎬 ReelsSidebar: Array length:', reelsArray.length);
      console.log('🎬 ReelsSidebar: Es array?', Array.isArray(reelsArray));

      // Solo aplicar el smart ordering si es el feed general
      const orderedReels = (filterByUser || filterByBusiness)
        ? reelsArray
        : smartOrderReels(reelsArray);

      console.log('🎬 ReelsSidebar: Reels ordenados:', orderedReels);
      setReels(orderedReels);
    } catch (error) {
      console.error('❌ Error loading reels:', error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);

      let endpoint = '/social/feed';

      // Si está filtrado por usuario, usar el endpoint de posts de usuario
      if (filterByUser && userId) {
        endpoint = `/social/users/${userId}/posts`;
        console.log('📸 ReelsSidebar: Cargando posts de usuario:', userId);
      }
      // Si está filtrado por negocio, usar el endpoint de posts de negocio con tipo post
      else if (filterByBusiness && businessId) {
        endpoint = `/businesses/${businessId}/posts?type=post`;
        console.log('📸 ReelsSidebar: Cargando posts de negocio:', businessId);
      } else {
        console.log('📸 ReelsSidebar: Cargando posts del feed general');
      }

      const response = await api.get(endpoint);
      // El interceptor de axios ya extrae response.data
      const postsData = response;

      // Extraer el array de posts correctamente
      let postsArray = [];

      if (filterByBusiness) {
        // Business posts: { posts: [...], total, page, pages }
        if (postsData.posts) {
          postsArray = postsData.posts;
        } else if (Array.isArray(postsData)) {
          postsArray = postsData;
        }
      } else if (filterByUser) {
        // User posts: puede venir como { posts: [...] } o directamente array
        postsArray = Array.isArray(postsData) ? postsData : (postsData.posts || []);
      } else {
        // Feed general: puede venir como { success: true, data: { posts: [...] } } o { posts: [...] }
        if (postsData.data && postsData.data.posts) {
          postsArray = postsData.data.posts;
        } else if (postsData.posts) {
          postsArray = postsData.posts;
        } else if (Array.isArray(postsData)) {
          postsArray = postsData;
        } else if (postsData.data && Array.isArray(postsData.data)) {
          // Caso donde data es directamente el array
          postsArray = postsData.data;
        }
      }

      console.log('📸 ReelsSidebar: Posts array final:', postsArray);
      console.log('📸 ReelsSidebar: Array length:', postsArray.length);
      setPosts(postsArray);
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      setPosts([]);
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

  const openFullPost = (index) => {
    if (posts[index]) {
      setCurrentPostIndex(index);
      setSelectedPost(posts[index]);
    }
  };

  const handleNavigate = (newIndex) => {
    setCurrentReelIndex(newIndex);
    setSelectedReel(reels[newIndex]);
  };

  const handleNavigatePost = (newIndex) => {
    setCurrentPostIndex(newIndex);
    setSelectedPost(posts[newIndex]);
  };

  const currentReel = reels[currentReelIndex];
  const currentContent = activeTab === 'reels' ? reels : posts;
  const totalCount = activeTab === 'reels' ? reels.length : posts.length;

  return (
    <>
      {/* Floating Button - Only visible when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 group"
          title="Ver Contenido"
        >
          {/* Pulsating outer ring */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: '#ffb548' }}></div>

          {/* Main button */}
          <div className="relative text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110" style={{ backgroundColor: '#002c91' }}>
            <Grid3x3 size={28} className="animate-pulse" />

            {/* Sparkle effect */}
            <Sparkles className="absolute -top-1 -left-1 animate-bounce" style={{ color: '#ffb548' }} size={16} />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-xl" style={{ backgroundColor: '#002c91' }}>
              ¡Descubre Contenido! 📸
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
          {/* Tabs with collapse button */}
          <div className="border-b border-gray-200">
            <div className="flex gap-0 px-4 pt-4 relative">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 flex items-center justify-center gap-2 pb-3 border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ImageIcon size={18} />
                <span className="font-medium text-sm">Posts</span>
              </button>
              <button
                onClick={() => setActiveTab('reels')}
                className={`flex-1 flex items-center justify-center gap-2 pb-3 border-b-2 transition-colors ${
                  activeTab === 'reels'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Video size={18} />
                <span className="font-medium text-sm">Reels</span>
              </button>

            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : activeTab === 'posts' ? (
              // Posts Grid View
              posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <ImageIcon size={64} className="text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium text-lg">No hay posts disponibles</p>
                  <p className="text-sm text-gray-400 mt-2">¡Sé el primero en crear uno!</p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto p-4">
                  <div className="flex flex-col gap-4">
                    {posts.map((post, index) => {
                      const firstMedia = post.media?.[0] || (post.images?.[0] ? { url: post.images[0], type: 'image' } : null);
                      const isVideo = firstMedia?.type === 'video';

                      return (
                        <div
                          key={post.id || index}
                          onClick={() => openFullPost(index)}
                          className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer hover:ring-4 hover:ring-primary/30 transition-all"
                        >
                          {/* Media */}
                          {isVideo ? (
                            <video
                              src={getImageUrl(firstMedia.url, 'social')}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                            />
                          ) : firstMedia ? (
                            <img
                              src={getImageUrl(firstMedia.url, 'social')}
                              alt={post.caption || post.content}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <ImageIcon size={32} className="text-gray-400" />
                            </div>
                          )}

                          {/* Multi-media indicator */}
                          {post.media?.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                              <Grid3x3 size={14} className="text-white" />
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80">
                            {/* Play icon center - only for videos */}
                            {isVideo && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                  <Play size={32} className="text-white" fill="white" />
                                </div>
                              </div>
                            )}

                            {/* User/Business info - Top */}
                            <div className="absolute top-3 left-3 right-3">
                              {(() => {
                                const isBusinessPost = post?.business;
                                const profile = isBusinessPost ? post.business : post?.user;
                                const profileLink = isBusinessPost
                                  ? `/business/${profile?.id}`
                                  : `/profile/${profile?.id}`;
                                const profileImage = isBusinessPost ? profile?.logo : profile?.avatar;
                                const profileName = profile?.name || 'Usuario';

                                return (
                                  <Link
                                    to={profileLink}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/40">
                                      {profileImage ? (
                                        <img
                                          src={getImageUrl(profileImage, isBusinessPost ? 'business' : 'social')}
                                          alt={profileName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-white font-bold text-sm">
                                          {profileName?.charAt(0) || '?'}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-white font-semibold drop-shadow-lg text-sm">
                                      {profileName}
                                    </p>
                                  </Link>
                                );
                              })()}
                            </div>

                            {/* Caption and stats - Bottom */}
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-white text-sm mb-2 line-clamp-2 drop-shadow-lg">
                                {post?.caption || post?.content}
                              </p>
                              <div className="flex items-center gap-4 text-white text-sm">
                                <div className="flex items-center gap-1">
                                  <Heart size={16} />
                                  <span>{post.likesCount || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle size={16} />
                                  <span>{post.commentsCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : reels.length === 0 ? (
              // Reels Empty State
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <Video size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium text-lg">No hay reels disponibles</p>
                <p className="text-sm text-gray-400 mt-2">¡Sé el primero en crear uno!</p>
              </div>
            ) : (
              // Reels Viewer
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
                  {(() => {
                    // Soportar ambas estructuras: user posts (videoUrl) y business posts (media array)
                    const videoUrl = currentReel?.videoUrl || currentReel?.video_url;
                    const mediaVideo = currentReel?.media?.find(m => m.type === 'video');
                    const mediaImage = currentReel?.media?.find(m => m.type === 'image');
                    const userImage = currentReel?.images?.[0];

                    if (videoUrl || mediaVideo) {
                      const src = videoUrl || mediaVideo?.url;
                      return (
                        <video
                          src={getImageUrl(src, 'social')}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                          playsInline
                        />
                      );
                    } else if (mediaImage || userImage) {
                      const src = mediaImage?.url || userImage;
                      return (
                        <img
                          src={getImageUrl(src, 'social')}
                          alt={currentReel.content || currentReel.caption}
                          className="w-full h-full object-cover"
                        />
                      );
                    } else {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-dark to-secondary">
                          <p className="text-white text-center p-6">
                            {currentReel?.content || currentReel?.caption}
                          </p>
                        </div>
                      );
                    }
                  })()}

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
                      {(() => {
                        // Soportar ambas estructuras: user posts y business posts
                        const isBusinessPost = currentReel?.business;
                        const profile = isBusinessPost ? currentReel.business : currentReel?.user;
                        const profileLink = isBusinessPost
                          ? `/business/${profile?.id}`
                          : `/profile/${profile?.id}`;
                        const profileImage = isBusinessPost ? profile?.logo : profile?.avatar;
                        const profileName = profile?.name || 'Usuario';
                        const profileUsername = isBusinessPost
                          ? profile?.slug
                          : profile?.username || 'usuario';

                        return (
                          <Link
                            to={profileLink}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                          >
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/40">
                              {profileImage ? (
                                <img
                                  src={getImageUrl(profileImage, isBusinessPost ? 'business' : 'social')}
                                  alt={profileName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold">
                                  {profileName?.charAt(0) || '?'}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-semibold drop-shadow-lg">
                                {profileName}
                              </p>
                              <p className="text-white/90 text-xs drop-shadow">
                                {isBusinessPost ? profileUsername : `@${profileUsername}`}
                              </p>
                            </div>
                          </Link>
                        );
                      })()}
                    </div>

                    {/* Content and stats - Bottom */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm mb-3 line-clamp-2 drop-shadow-lg">
                        {currentReel?.content || currentReel?.caption}
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

          {/* Collapse button - bottom positioned, only visible when sidebar is open */}
          {isOpen && (
            <button
              onClick={onToggle}
              className="absolute bottom-6 -left-10 p-3 rounded-l-lg shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{ backgroundColor: '#002c91' }}
              aria-label="Ocultar panel"
              title="Ocultar panel"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
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

      {/* Post Viewer Modal */}
      {selectedPost && (
        <ReelViewer
          reel={selectedPost}
          reels={posts}
          currentIndex={currentPostIndex}
          onNavigate={handleNavigatePost}
          onClose={() => setSelectedPost(null)}
          isOwnProfile={selectedPost.user?.id === currentUser?.id || selectedPost.business?.id === businessId}
        />
      )}
    </>
  );
}

export default ReelsSidebar;
