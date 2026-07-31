import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Image as ImageIcon, Video, Grid3x3, Play, Heart, MessageCircle, Loader } from 'lucide-react';
import BusinessLayout from '../components/BusinessLayout';
import CreateContentSidebar from '../../social/components/CreateContentSidebar';
import ReelViewer from '../../../components/social/ReelViewer';
import { getBusinessPosts, createBusinessPost } from '../../../services/businessService';
import { getImageUrl } from '../../../services/api';
import { useSidebar } from '../../../contexts/SidebarContext';

function BusinessPosts() {
  const { id } = useParams();
  const { setSidebarVisible } = useSidebar();
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [contentType, setContentType] = useState('post'); // 'post' | 'reel'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'posts' | 'reels'
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);

  // Disable sidebar on this page
  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  useEffect(() => {
    loadPosts();
  }, [id, activeTab]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const typeFilter = activeTab === 'all' ? null : activeTab === 'posts' ? 'post' : 'reel';
      const response = await getBusinessPosts(id, 1, 50, typeFilter);
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Error loading business posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = (type) => {
    setContentType(type);
    setShowCreateSidebar(true);
  };

  const handlePostCreated = async () => {
    // Reload posts after creating a new one
    await loadPosts();
  };

  const handlePostClick = (post, index) => {
    setSelectedPost(post);
    setSelectedPostIndex(index);
  };

  const handleNavigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < filteredPosts.length) {
      setSelectedPostIndex(newIndex);
      setSelectedPost(filteredPosts[newIndex]);
    }
  };

  // Filter posts based on active tab
  const filteredPosts = activeTab === 'all'
    ? posts
    : posts.filter(post => {
        if (activeTab === 'posts') return post.type === 'post';
        if (activeTab === 'reels') return post.type === 'reel';
        return true;
      });

  return (
    <BusinessLayout activeMenu="posts">
      <div className="space-y-6">
        {/* Header with Create Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Publicaciones</h2>
              <p className="text-gray-600 mt-1">
                Crea y gestiona publicaciones y reels de tu negocio
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleCreatePost('post')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <ImageIcon size={20} />
                Crear Post
              </button>
              <button
                onClick={() => handleCreatePost('reel')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:opacity-90 transition"
              >
                <Video size={20} />
                Crear Reel
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 px-1 font-medium transition ${
                activeTab === 'all'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3x3 size={18} className="inline mr-2" />
              Todos
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 px-1 font-medium transition ${
                activeTab === 'posts'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ImageIcon size={18} className="inline mr-2" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`pb-3 px-1 font-medium transition ${
                activeTab === 'reels'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Video size={18} className="inline mr-2" />
              Reels
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'reels' ? '🎬' : activeTab === 'posts' ? '📸' : '💬'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No hay {activeTab === 'reels' ? 'reels' : activeTab === 'posts' ? 'posts' : 'publicaciones'} aún
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza a compartir contenido de tu negocio
            </p>
            <button
              onClick={() => handleCreatePost(activeTab === 'reels' ? 'reel' : 'post')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <Plus size={20} />
              Crear {activeTab === 'reels' ? 'Reel' : 'Post'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {filteredPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post, index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Content Sidebar - Adaptado para negocios */}
      <BusinessCreateContentSidebar
        businessId={id}
        isOpen={showCreateSidebar}
        onClose={() => setShowCreateSidebar(false)}
        type={contentType}
        onSuccess={handlePostCreated}
      />

      {/* Post/Reel Viewer Modal */}
      {selectedPost && (
        <ReelViewer
          reel={selectedPost}
          reels={filteredPosts}
          currentIndex={selectedPostIndex}
          onNavigate={handleNavigate}
          onClose={() => setSelectedPost(null)}
          isOwnProfile={false}
        />
      )}
    </BusinessLayout>
  );
}

// Componente de tarjeta de post en el grid
function PostCard({ post, onClick }) {
  const firstMedia = post.media?.[0];
  const isVideo = firstMedia?.type === 'video';

  return (
    <div
      onClick={onClick}
      className="relative aspect-square bg-gray-100 group cursor-pointer overflow-hidden"
    >
      {/* Media */}
      {isVideo ? (
        <video
          src={getImageUrl(firstMedia.url, 'social')}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={getImageUrl(firstMedia?.url, 'social')}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      )}

      {/* Type indicator */}
      {post.type === 'reel' && (
        <div className="absolute top-2 right-2">
          <Play size={20} className="text-white drop-shadow-lg" fill="white" />
        </div>
      )}

      {post.media?.length > 1 && (
        <div className="absolute top-2 right-2">
          <Grid3x3 size={20} className="text-white drop-shadow-lg" />
        </div>
      )}

      {/* Hover overlay with stats */}
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
        <div className="flex items-center gap-2">
          <Heart size={20} fill="white" />
          <span className="font-semibold">{post.likesCount || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle size={20} fill="white" />
          <span className="font-semibold">{post.commentsCount || 0}</span>
        </div>
      </div>
    </div>
  );
}

// Wrapper del CreateContentSidebar adaptado para negocios
function BusinessCreateContentSidebar({ businessId, isOpen, onClose, type, onSuccess }) {
  const handleSubmit = async (formData) => {
    try {
      console.log('📤 Enviando FormData al endpoint de negocio:', businessId);

      // Log del contenido del FormData para debugging
      for (let pair of formData.entries()) {
        console.log('FormData:', pair[0], pair[1]);
      }

      // Llamar al endpoint de negocios en lugar del de usuarios
      const response = await createBusinessPost(businessId, formData);

      console.log('✅ Respuesta exitosa:', response);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response;
    } catch (error) {
      console.error('❌ Error creating business post:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      throw error;
    }
  };

  // Usamos el CreateContentSidebar existente pero interceptamos el submit
  return (
    <CreateContentSidebar
      isOpen={isOpen}
      onClose={onClose}
      type={type}
      onSuccess={onSuccess}
      businessId={businessId}
      customSubmit={handleSubmit}
    />
  );
}

export default BusinessPosts;
