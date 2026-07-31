import { useState, useEffect } from 'react';
import { Play, Heart, MessageCircle, Image as ImageIcon, Plus, Users, TrendingUp, Compass } from 'lucide-react';
import ReelViewer from '../../../components/social/ReelViewer';
import CreatePostModal from '../../../components/social/CreatePostModal';
import useAuthStore from '../../../store/authStore';
import api, { getImageUrl } from '../../../services/api';

function FeedPage() {
  const { user: currentUser } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all'); // all, reels, posts
  const [feedMode, setFeedMode] = useState('explore'); // explore, following, trending
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [activeFilter]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = activeFilter === 'all' ? {} : { type: activeFilter === 'reels' ? 'reel' : 'post' };
      const response = await api.get('/social/posts', { params });

      console.log('📦 API Response:', response);

      // Handle different response formats
      let postsData = [];
      if (Array.isArray(response.data)) {
        postsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        postsData = response.data.data;
      } else if (response.data?.posts && Array.isArray(response.data.posts)) {
        postsData = response.data.posts;
      }

      console.log('✅ Posts loaded:', postsData.length, postsData);
      setPosts(postsData);
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const openPost = (post, index) => {
    setSelectedPost(post);
    setSelectedPostIndex(index);
  };

  const handleNavigate = (newIndex) => {
    setSelectedPostIndex(newIndex);
    setSelectedPost(posts[newIndex]);
  };

  const handlePostCreated = (newPost) => {
    // Refresh posts after creating
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Create Button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-dark mb-2 flex items-center gap-3">
                <Compass className="text-primary" size={32} />
                Muro Social
              </h1>
              <p className="text-gray-600">Descubre y comparte momentos de viaje</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Crear</span>
            </button>
          </div>

          {/* Feed Mode Tabs */}
          <div className="mb-6 flex gap-3 bg-white rounded-xl p-1.5 shadow-sm w-fit">
            <button
              onClick={() => setFeedMode('explore')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                feedMode === 'explore'
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Compass size={18} />
              Explorar
            </button>
            <button
              onClick={() => setFeedMode('following')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                feedMode === 'following'
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users size={18} />
              Siguiendo
            </button>
            <button
              onClick={() => setFeedMode('trending')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                feedMode === 'trending'
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={18} />
              Tendencias
            </button>
          </div>

          {/* Content Type Filters */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeFilter === 'all'
                  ? 'bg-white text-primary shadow-md border-2 border-primary'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('reels')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeFilter === 'reels'
                  ? 'bg-white text-primary shadow-md border-2 border-primary'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <Play size={18} />
              Reels
            </button>
            <button
              onClick={() => setActiveFilter('posts')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeFilter === 'posts'
                  ? 'bg-white text-primary shadow-md border-2 border-primary'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <ImageIcon size={18} />
              Publicaciones
            </button>
          </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              {activeFilter === 'reels' ? <Play size={64} className="mx-auto" /> : <ImageIcon size={64} className="mx-auto" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay {activeFilter === 'reels' ? 'reels' : 'publicaciones'} aún
            </h3>
            <p className="text-gray-500">Sé el primero en compartir contenido</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {posts.map((post, index) => (
              <div
                key={post.id}
                onClick={() => openPost(post, index)}
                className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-900 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                style={{
                  aspectRatio: post.type === 'reel' ? '9/16' : '1/1',
                }}
              >
                {/* Thumbnail */}
                {post.type === 'reel' ? (
                  <video
                    src={getImageUrl(post.videoUrl, 'social')}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : post.images && post.images.length > 0 ? (
                  <img
                    src={post.images[0]}
                    alt={post.content}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-dark">
                    <p className="text-white text-center p-4 text-sm line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="text-white flex items-center gap-6 transform group-hover:scale-110 transition-transform duration-300">
                    <div className="flex items-center gap-2">
                      <Heart size={26} fill="white" className="drop-shadow-lg" />
                      <span className="font-bold text-lg">{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle size={26} fill="white" className="drop-shadow-lg" />
                      <span className="font-bold text-lg">{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Type badge */}
                <div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  {post.type === 'reel' ? (
                    <div className="bg-primary rounded-full p-2 shadow-lg">
                      <Play size={16} className="text-white" fill="white" />
                    </div>
                  ) : (
                    post.images && post.images.length > 1 && (
                      <div className="bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-white font-semibold shadow-lg">
                        {post.images.length} fotos
                      </div>
                    )
                  )}
                </div>

                {/* User info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold overflow-hidden ring-2 ring-white/30">
                      {post.user?.avatar ? (
                        <img src={getImageUrl(post.user.avatar, 'social')} alt={post.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white">{post.user?.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <span className="text-white text-sm font-semibold truncate drop-shadow-lg">
                      {post.user?.name || 'Usuario'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Viewer Modal */}
        {selectedPost && (
          <ReelViewer
            reel={selectedPost}
            reels={posts}
            currentIndex={selectedPostIndex}
            onNavigate={handleNavigate}
            onClose={() => setSelectedPost(null)}
            isOwnProfile={selectedPost.user?.id === currentUser?.id}
          />
        )}

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </div>
  );
}

export default FeedPage;
