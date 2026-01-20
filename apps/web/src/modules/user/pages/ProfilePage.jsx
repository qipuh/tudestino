import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Edit, MapPin, Calendar, Home, Video, Share2, Briefcase,
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Users, UserCheck, Plus, Star, PlusCircle, Image as ImageIcon, Camera, X
} from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import { getUserProfile, getMyProfile, getFollowers, getFollowing, uploadAvatar } from '../../../services/socialService';
import { getHostProperties } from '../../../services/propertyService';
import { getUserPosts, getUserReels } from '../../../services/socialService';
import { getImageUrl } from '../../../services/api';
import FollowButton from '../../../components/social/FollowButton';
import EditSocialProfileModal from '../../../components/social/EditSocialProfileModal';
import ReelViewer from '../../../components/social/ReelViewer';
import FloatingChatBubble from '../../../components/messaging/FloatingChatBubble';
import CreateContentSidebar from '../../social/components/CreateContentSidebar';
import PostCard from '../../social/components/PostCard';
import ReelsSidebar from '../../../components/social/ReelsSidebar';
import { useSidebar } from '../../../contexts/SidebarContext';

// Datos de ejemplo para Host Demo
const DEMO_POSTS = [
  {
    id: 1,
    type: 'post',
    content: '¡Bienvenidos a nuestra hermosa casa de playa! 🏖️ El lugar perfecto para unas vacaciones inolvidables. Acceso directo a la playa, piscina privada y vistas espectaculares. ¿Listos para reservar?',
    images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'],
    likes: 234,
    comments: 18,
    createdAt: '2025-10-10',
  },
  {
    id: 2,
    type: 'post',
    content: 'Atardecer desde la terraza 🌅 Estos son los momentos que hacen que nuestro lugar sea especial.',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    likes: 189,
    comments: 12,
    createdAt: '2025-10-08',
  }
];

const DEMO_REELS = [
  {
    id: 1,
    type: 'reel',
    videoUrl: '/videos/2025-10-08 10-00-44.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    views: '12.5K',
    duration: '0:45',
    content: 'Tour por la playa privada 🏖️',
    likesCount: 234,
    commentsCount: 45,
    sharesCount: 12,
    createdAt: '2025-10-08',
    isLiked: false,
  },
  {
    id: 2,
    type: 'reel',
    videoUrl: '/videos/2025-10-08 10-01-22.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400',
    views: '8.2K',
    duration: '0:32',
    content: 'Atardecer desde la terraza 🌅',
    likesCount: 189,
    commentsCount: 28,
    sharesCount: 8,
    createdAt: '2025-10-09',
    isLiked: false,
  },
  {
    id: 3,
    type: 'reel',
    videoUrl: '/videos/2025-10-11 17-27-00.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    views: '15.8K',
    duration: '0:58',
    content: 'Vista aérea de la propiedad 🏡',
    likesCount: 456,
    commentsCount: 67,
    sharesCount: 23,
    createdAt: '2025-10-11',
    isLiked: false,
  }
];

function ProfilePage({ userIdProp }) {
  const { userId: userIdParam } = useParams();
  const userId = userIdProp || userIdParam; // Use prop if provided, otherwise use URL param
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'muro');
  const [followersData, setFollowersData] = useState({ followers: [], loading: false });
  const [followingData, setFollowingData] = useState({ following: [], loading: false });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [likedPosts, setLikedPosts] = useState(() => {
    const saved = localStorage.getItem('likedPosts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [selectedReel, setSelectedReel] = useState(null);
  const [selectedReelIndex, setSelectedReelIndex] = useState(0);
  const [postsData, setPostsData] = useState(() => {
    const saved = localStorage.getItem('postsData');
    return saved ? JSON.parse(saved) : DEMO_POSTS;
  });
  const [showComments, setShowComments] = useState(null);
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('comments');
    return saved ? JSON.parse(saved) : {};
  });
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [savedPosts, setSavedPosts] = useState(() => {
    const saved = localStorage.getItem('savedPosts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [commentLikes, setCommentLikes] = useState(() => {
    const saved = localStorage.getItem('commentLikes');
    return saved ? JSON.parse(saved) : {};
  });
  const [reelLikes, setReelLikes] = useState(() => {
    const saved = localStorage.getItem('reelLikes');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [savedReels, setSavedReels] = useState(() => {
    const saved = localStorage.getItem('savedReels');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(false);
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [contentType, setContentType] = useState('post'); // 'post' | 'reel'
  const [realPosts, setRealPosts] = useState([]);
  const [realReels, setRealReels] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingReels, setLoadingReels] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const avatarInputRef = useRef(null);
  const { sidebarOpen, toggleSidebar, setSidebarVisible } = useSidebar();

  const isOwnProfile = !userId || (currentUser && userId === currentUser.id);
  const isHost = profile?.role === 'host';

  // Enable sidebar when ProfilePage mounts, disable when unmounts
  useEffect(() => {
    setSidebarVisible(true);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  // Función para obtener el nombre de la propiedad
  const getPropertyName = (property) => {
    if (property.propertyName) return property.propertyName;
    if (property.hotelName) return property.hotelName;

    const typeTranslations = {
      'apartment': 'Departamento',
      'house': 'Casa',
      'villa': 'Villa',
      'cabin': 'Cabaña',
      'room': 'Habitación',
      'hotel': 'Hotel',
      'motel': 'Motel',
      'hostel': 'Hostal',
      'resort': 'Resort',
      'bed_and_breakfast': 'Bed & Breakfast',
      'guesthouse': 'Casa de huéspedes',
    };

    const typeName = typeTranslations[property.accommodationType] || property.accommodationType;
    return `${typeName} en ${property.addressCity}`;
  };

  // Función para obtener el precio de la propiedad
  const getPropertyPrice = (property) => {
    if (property.rooms && property.rooms.length > 0) {
      return property.rooms[0].pricePerNight;
    }
    return 0;
  };

  useEffect(() => {
    if (currentUser || userId) {
      loadProfile();
    }
  }, [userId, currentUser?.id]);

  // Load posts and reels when profile is loaded
  useEffect(() => {
    if (profile?.id || currentUser?.id) {
      loadRealPosts();
      loadRealReels();
    }
  }, [profile?.id, currentUser?.id]);

  // Reset properties when profile changes
  useEffect(() => {
    setProperties([]);
    setRealPosts([]);
    setRealReels([]);
  }, [userId]);

  // Load followers when modal opens
  useEffect(() => {
    if (showFollowersModal && profile?.id) {
      loadFollowers();
    }
  }, [showFollowersModal, profile?.id]);

  // Load following when modal opens
  useEffect(() => {
    if (showFollowingModal && profile?.id) {
      loadFollowing();
    }
  }, [showFollowingModal, profile?.id]);

  // Guardar likes en localStorage
  useEffect(() => {
    localStorage.setItem('likedPosts', JSON.stringify([...likedPosts]));
  }, [likedPosts]);

  // Guardar posts en localStorage
  useEffect(() => {
    localStorage.setItem('postsData', JSON.stringify(postsData));
  }, [postsData]);

  // Guardar comentarios en localStorage
  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  // Guardar posts guardados en localStorage
  useEffect(() => {
    localStorage.setItem('savedPosts', JSON.stringify([...savedPosts]));
  }, [savedPosts]);

  // Guardar likes de comentarios en localStorage
  useEffect(() => {
    localStorage.setItem('commentLikes', JSON.stringify(commentLikes));
  }, [commentLikes]);

  // Guardar likes y guardados de reels en localStorage
  useEffect(() => {
    localStorage.setItem('reelLikes', JSON.stringify([...reelLikes]));
  }, [reelLikes]);

  useEffect(() => {
    localStorage.setItem('savedReels', JSON.stringify([...savedReels]));
  }, [savedReels]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = isOwnProfile ? await getMyProfile() : await getUserProfile(userId);
      setProfile(response);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowers = async () => {
    if (followersData.followers.length > 0) return;
    setFollowersData({ ...followersData, loading: true });
    try {
      const response = await getFollowers(profile.id);
      setFollowersData({ followers: response.followers || [], loading: false });
    } catch (error) {
      console.error('Error loading followers:', error);
      setFollowersData({ followers: [], loading: false });
    }
  };

  const loadFollowing = async () => {
    if (followingData.following.length > 0) return;
    setFollowingData({ ...followingData, loading: true });
    try {
      const response = await getFollowing(profile.id);
      setFollowingData({ following: response.following || [], loading: false });
    } catch (error) {
      console.error('Error loading following:', error);
      setFollowingData({ following: [], loading: false });
    }
  };

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await getHostProperties(profile.id);
      setProperties(response.properties || response || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadRealPosts = async (force = false) => {
  const targetUserId = profile?.id || currentUser?.id;
  console.log('🔍 loadRealPosts called:', { force, targetUserId, hasExistingPosts: realPosts.length > 0 });

  if (!force && realPosts.length > 0) {
    console.log('⏭️ Skipping - already have posts');
    return;
  }
  if (!targetUserId) {
    console.log('⚠️ No target user ID');
    return;
  }

  setLoadingPosts(true);
    try {
      console.log('📡 Fetching posts for user:', targetUserId);
      const response = await getUserPosts(targetUserId, 1, 20);
      console.log('✅ Full response:', response);
      
      // La respuesta contiene { posts: [...], pagination: {...} }
      const posts = (response.posts || []).map(post => ({
        ...post,
        // Asegurar que tenga los campos correctos
        userId: post.userId,
        caption: post.caption,
        location: post.location,
        media: post.media || [],
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        isLiked: post.isLiked || false,
        user: post.user
      }));
      
      console.log('📝 Mapped posts:', posts.length, posts);
      setRealPosts(posts);
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      setRealPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadRealReels = async (force = false) => {
  const targetUserId = profile?.id || currentUser?.id;
  if (!force && realReels.length > 0) return;
  if (!targetUserId) return;

  setLoadingReels(true);
  try {
    const response = await getUserReels(targetUserId, 1, 20);
    
    // La respuesta contiene { reels: [...], pagination: {...} }
    const reels = (response.reels || []).map(reel => ({
      ...reel,
      // Asegurar que tenga los campos correctos
      userId: reel.userId,
      caption: reel.caption,
      videoUrl: reel.videoUrl,
      thumbnailUrl: reel.thumbnailUrl,
      likesCount: reel.likesCount || 0,
      commentsCount: reel.commentsCount || 0,
      viewsCount: reel.viewsCount || 0,
      isLiked: reel.isLiked || false,
      user: reel.user
    }));
    
    setRealReels(reels);
  } catch (error) {
    console.error('Error loading reels:', error);
    setRealReels([]);
  } finally {
    setLoadingReels(false);
  }
};

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });

    // Load properties when switching to servicios tab
    if (tab === 'servicios' && isHost && properties.length === 0) {
      loadProperties();
    }

    // Load posts when switching to muro tab
    if (tab === 'muro' && realPosts.length === 0) {
      loadRealPosts();
    }

    // Load reels when switching to reels tab
    if (tab === 'reels' && realReels.length === 0) {
      loadRealReels();
    }
  };

  const handleFollowChange = () => {
    loadProfile();
  };

  const handleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    const isLiked = newLikedPosts.has(postId);

    if (isLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }

    setLikedPosts(newLikedPosts);

    // Actualizar el contador de likes
    setPostsData(postsData.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId, parentCommentId = null) => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: currentUser?.name || 'Usuario',
      avatar: currentUser?.avatar,
      text: newComment,
      createdAt: new Date().toISOString(),
      parentId: parentCommentId,
      replies: []
    };

    if (parentCommentId) {
      // Es una respuesta a un comentario
      const updatedComments = (comments[postId] || []).map(c => {
        if (c.id === parentCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), comment]
          };
        }
        return c;
      });
      setComments({
        ...comments,
        [postId]: updatedComments
      });
    } else {
      // Es un comentario principal
      setComments({
        ...comments,
        [postId]: [...(comments[postId] || []), comment]
      });
    }

    // Actualizar contador de comentarios
    setPostsData(postsData.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1
        };
      }
      return post;
    }));

    setNewComment('');
    setReplyingTo(null);
  };

  const handleSavePost = (postId) => {
    const newSavedPosts = new Set(savedPosts);

    if (newSavedPosts.has(postId)) {
      newSavedPosts.delete(postId);
    } else {
      newSavedPosts.add(postId);
    }

    setSavedPosts(newSavedPosts);
  };

  const handleLikeComment = (commentId) => {
    const likes = commentLikes[commentId] || 0;
    const hasLiked = likes > 0 && commentLikes[`${commentId}_liked`];

    setCommentLikes({
      ...commentLikes,
      [commentId]: hasLiked ? likes - 1 : likes + 1,
      [`${commentId}_liked`]: !hasLiked
    });
  };

  const handleLikeReel = (reelId) => {
    const newReelLikes = new Set(reelLikes);
    if (newReelLikes.has(reelId)) {
      newReelLikes.delete(reelId);
    } else {
      newReelLikes.add(reelId);
    }
    setReelLikes(newReelLikes);
  };

  const handleSaveReel = (reelId) => {
    const newSavedReels = new Set(savedReels);
    if (newSavedReels.has(reelId)) {
      newSavedReels.delete(reelId);
    } else {
      newSavedReels.add(reelId);
    }
    setSavedReels(newSavedReels);
  };

  const handleAvatarClick = () => {
    if (isOwnProfile && avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const response = await uploadAvatar(file);
      console.log('Upload response:', response);

      // El interceptor de axios desenvuelve response.data, así que response ya es el objeto de datos
      // Estructura esperada: { success: true, avatarUrl: "/uploads/social/...", message: "..." }
      const avatarUrl = response.avatarUrl;

      if (avatarUrl) {
        // Actualizar el perfil con la nueva imagen inmediatamente
        setProfile({
          ...profile,
          avatar: avatarUrl
        });
      }

      // Recargar el perfil completo para asegurar sincronización
      await loadProfile();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setUploadingAvatar(false);
      // Limpiar el input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil no encontrado</h2>
          <p className="text-gray-600">El usuario que buscas no existe o su perfil es privado</p>
        </div>
      </div>
    );
  }

  // Tabs según el rol
  const tabs = [
    { id: 'muro', label: 'Muro', icon: Home },
    { id: 'reels', label: 'Reels', icon: Video },
    { id: 'compartidos', label: 'Compartidos', icon: Share2 },
    ...(isHost ? [{ id: 'servicios', label: 'Servicios', icon: Briefcase }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Enhanced */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            {/* Avatar with enhanced styling */}
            <div className="relative">
              <div
                onClick={handleAvatarClick}
                className={`w-28 h-28 rounded-full bg-gradient-to-br from-primary via-primary-dark to-purple-600 p-1 shadow-lg ${
                  isOwnProfile ? 'cursor-pointer group' : ''
                }`}
              >
                <div className="w-full h-full rounded-full bg-white overflow-hidden ring-4 ring-white relative">
                  {profile.avatar ? (
                    <img
                      src={getImageUrl(profile.avatar, 'social')}
                      alt={profile.name}
                      className={`w-full h-full object-cover ${isOwnProfile ? 'group-hover:opacity-75 transition-opacity' : ''}`}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-primary/10 to-primary/20 text-primary ${
                      isOwnProfile ? 'group-hover:opacity-75 transition-opacity' : ''
                    }`}>
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Camera overlay on hover (only for own profile) */}
                  {isOwnProfile && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Camera size={32} className="text-white drop-shadow-lg" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Hidden file input */}
              {isOwnProfile && (
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              )}

              {/* Online indicator */}
              {isOwnProfile && !uploadingAvatar && (
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              )}
            </div>

            {/* Info & Actions */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h1>
                  {profile.username && (
                    <p className="text-sm text-gray-500">@{profile.username}</p>
                  )}
                </div>
                {isOwnProfile ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-5 py-2 text-sm font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Edit size={16} />
                      Editar perfil
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FollowButton
                      userId={profile.id}
                      initialIsFollowing={profile.isFollowing}
                      onFollowChange={handleFollowChange}
                    />
                    <button
                      onClick={() => setShowChatBubble(true)}
                      className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:scale-105 flex items-center gap-2 transition-all shadow-md"
                      title="Enviar mensaje"
                    >
                      <MessageCircle size={16} />
                      Mensaje
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Enhanced */}
              <div className="flex gap-6 mb-4">
                <button
                  onClick={() => setShowFollowersModal(true)}
                  className="group hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">{profile.followersCount}</div>
                      <div className="text-xs text-gray-500 -mt-1">seguidores</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setShowFollowingModal(true)}
                  className="group hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">{profile.followingCount}</div>
                      <div className="text-xs text-gray-500 -mt-1">siguiendo</div>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-red-500" fill="currentColor" />
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-lg">{profile.totalLikes}</div>
                    <div className="text-xs text-gray-500 -mt-1">me gusta</div>
                  </div>
                </div>
              </div>

              {/* Biography Section Enhanced */}
              {(profile.bio || profile.travelBio) && (
                <div className="bg-gradient-to-r from-gray-50 to-transparent rounded-lg p-4 border-l-4 border-primary">
                  {profile.bio && (
                    <p className="text-sm text-gray-800 leading-relaxed mb-2">{profile.bio}</p>
                  )}
                  {profile.travelBio && (
                    <p className="text-sm text-gray-600 italic leading-relaxed flex items-start gap-2">
                      <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{profile.travelBio}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabs Enhanced */}
          <div className="flex justify-around items-center mt-6 border-b -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col items-center gap-2 px-8 py-3 transition-all border-b-3 relative group ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                  title={tab.label}
                >
                  <Icon
                    size={22}
                    className={`transition-all ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                  />
                  <span className={`text-xs font-semibold transition-all ${isActive ? 'text-primary' : ''}`}>
                    {tab.label}
                  </span>
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-t-full shadow-lg shadow-primary/50"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Muro Tab - Grid View */}
        {activeTab === 'muro' && (() => {
          console.log('🎨 Rendering Muro tab:', { loadingPosts, postsCount: realPosts.length, realPosts });
          return (
          <div>
            {loadingPosts ? (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
                <p className="mt-4 text-gray-600 font-medium">Cargando publicaciones...</p>
              </div>
            ) : realPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {realPosts.map((post) => {
                  const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
                  const hasMultipleMedia = post.media && post.media.length > 1;

                  return (
                    <div
                      key={post.id}
                      className="relative aspect-square bg-gray-100 group cursor-pointer overflow-hidden"
                      onClick={() => setSelectedPost(post)}
                    >
                      {/* Thumbnail */}
                      {firstMedia ? (
                        firstMedia.type === 'video' ? (
                          <video
                            src={getImageUrl(firstMedia.url)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={getImageUrl(firstMedia.url)}
                            alt={post.caption || 'Post'}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <ImageIcon size={48} className="text-gray-400" />
                        </div>
                      )}

                      {/* Multiple media indicator */}
                      {hasMultipleMedia && (
                        <div className="absolute top-2 right-2">
                          <ImageIcon size={20} className="text-white drop-shadow-lg" />
                        </div>
                      )}

                      {/* Video indicator */}
                      {firstMedia?.type === 'video' && (
                        <div className="absolute top-2 right-2">
                          <Video size={20} className="text-white drop-shadow-lg" />
                        </div>
                      )}

                      {/* Hover overlay with stats */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <Heart size={24} fill="white" />
                          <span>{post.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <MessageCircle size={24} fill="white" />
                          <span>{post.commentsCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full mb-4">
                  <ImageIcon size={40} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay publicaciones aún
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {isOwnProfile ? 'Comparte tus experiencias de viaje y conecta con otros viajeros' : 'Este usuario no ha compartido publicaciones aún'}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowCreateSidebar(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all shadow-md font-medium"
                  >
                    <PlusCircle size={18} />
                    Crear primera publicación
                  </button>
                )}
              </div>
            )}
          </div>
          );
        })()}

        {/* Reels Tab */}
        {activeTab === 'reels' && (
          <div className="grid grid-cols-3 gap-2">
            {loadingReels ? (
              <div className="col-span-3 bg-white rounded-xl shadow-sm border p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
                <p className="mt-4 text-gray-600 font-medium">Cargando reels...</p>
              </div>
            ) : realReels.length > 0 ? (
              realReels.map((reel, index) => (
                <div
                  key={reel.id}
                  onClick={() => {
                    setSelectedReel(reel);
                    setSelectedReelIndex(index);
                  }}
                  className="aspect-[9/16] relative group cursor-pointer overflow-hidden rounded bg-gray-900"
                >
                  {/* Thumbnail */}
                  {reel.thumbnailUrl ? (
                    <img
                      src={getImageUrl(reel.thumbnailUrl)}
                      alt="Reel"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={`${getImageUrl(reel.videoUrl, 'social')}#t=0.1`}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <Play size={48} className="text-white opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="absolute bottom-2 left-2 text-white text-xs font-semibold flex items-center gap-1 drop-shadow-lg">
                    <Play size={12} fill="white" />
                    {reel.viewsCount || 0}
                  </div>
                  {reel.duration && (
                    <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-1 rounded">
                      {Math.floor(reel.duration / 60)}:{(reel.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play size={32} className="text-white drop-shadow-lg" fill="white" />
                  </div>
                </div>
              ))
            ) : profile.name === 'Host Demo' ? (
              DEMO_REELS.map((reel, index) => (
                <div
                  key={reel.id}
                  onClick={() => {
                    setSelectedReel(reel);
                    setSelectedReelIndex(index);
                  }}
                  className="aspect-[9/16] relative group cursor-pointer overflow-hidden rounded bg-gray-900"
                >
                  {/* Use video element for thumbnail - shows first frame */}
                  <video
                    src={`${getImageUrl(reel.videoUrl, 'social')}#t=0.1`}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <Play size={48} className="text-white opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="absolute bottom-2 left-2 text-white text-xs font-semibold flex items-center gap-1 drop-shadow-lg">
                    <Play size={12} fill="white" />
                    {reel.views}
                  </div>
                  <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-1 rounded">
                    {reel.duration}
                  </div>
                  {/* Play icon overlay always visible */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play size={32} className="text-white drop-shadow-lg" fill="white" />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full mb-4">
                  <Video size={40} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay reels aún
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {isOwnProfile ? 'Comparte videos cortos de tus aventuras' : 'Este usuario no ha compartido reels aún'}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setContentType('reel');
                      setShowCreateSidebar(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all shadow-md font-medium"
                  >
                    <Video size={18} />
                    Crear primer reel
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Compartidos Tab */}
        {activeTab === 'compartidos' && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full mb-4">
              <Share2 size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No hay publicaciones compartidas aún
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {isOwnProfile ? 'Las publicaciones que compartas aparecerán aquí' : 'Este usuario no ha compartido publicaciones aún'}
            </p>
          </div>
        )}

        {/* Servicios Tab (solo para hosts) */}
        {activeTab === 'servicios' && isHost && (
          <div>
            <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Briefcase size={24} className="text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Propiedades</h2>
                  <p className="text-sm text-gray-600">{properties.length} {properties.length === 1 ? 'propiedad' : 'propiedades'}</p>
                </div>
              </div>
              {isOwnProfile && (
                <Link
                  to="/host/properties"
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all shadow-md font-medium flex items-center gap-2"
                >
                  <Briefcase size={16} />
                  Gestionar Propiedades
                </Link>
              )}
            </div>

            {loadingProperties ? (
              <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
                <p className="mt-4 text-gray-600 font-medium">Cargando propiedades...</p>
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="group border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {property.rooms && property.rooms.length > 0 && property.rooms[0].images && property.rooms[0].images.length > 0 ? (
                        <img
                          src={property.rooms[0].images[0]}
                          alt={getPropertyName(property)}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Sin imagen
                        </div>
                      )}
                      {property.ratingAverage >= 4.5 && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-primary-dark px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                          <Star size={14} className="fill-white text-white" />
                          <span className="text-sm font-bold text-white">Destacado</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition">
                        {getPropertyName(property)}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin size={14} className="text-primary" />
                        <span className="truncate">{property.addressCity}, {property.addressCountry}</span>
                      </div>
                      {property.ratingAverage > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {typeof property.ratingAverage === 'number'
                              ? property.ratingAverage.toFixed(1)
                              : property.ratingAverage}
                          </span>
                          <span className="text-sm text-gray-600">({property.ratingCount})</span>
                        </div>
                      )}
                      <div className="mt-3">
                        <span className="text-lg font-bold text-primary-dark">${getPropertyPrice(property)}</span>
                        <span className="text-gray-600"> / noche</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full mb-4">
                  <Home size={40} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay propiedades publicadas aún
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {isOwnProfile ? 'Comienza a publicar tus propiedades y genera ingresos' : 'Este usuario no ha publicado propiedades aún'}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/host/properties"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all shadow-md font-medium"
                  >
                    <Briefcase size={18} />
                    Publicar mi primera propiedad
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Followers Modal Enhanced */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowFollowersModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[32rem] overflow-hidden shadow-2xl transform transition-all animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-primary/5 to-transparent border-b p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-primary" />
                <h3 className="font-bold text-lg text-gray-900">Seguidores</h3>
              </div>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[26rem]">
              {profile.followersCount === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No hay seguidores aún</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isOwnProfile ? 'Comparte contenido para conseguir seguidores' : 'Este usuario aún no tiene seguidores'}
                  </p>
                </div>
              ) : followersData.loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary mb-3"></div>
                  <p className="text-gray-600 font-medium">Cargando seguidores...</p>
                </div>
              ) : followersData.followers.length > 0 ? (
                <div className="space-y-3">
                  {followersData.followers.map((follower) => (
                    <div key={follower.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 overflow-hidden flex-shrink-0">
                          {follower.avatar ? (
                            <img
                              src={getImageUrl(follower.avatar, 'social')}
                              alt={follower.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary">
                              {follower.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/profile/${follower.id}`}
                            onClick={() => setShowFollowersModal(false)}
                            className="font-semibold text-gray-900 hover:text-primary transition-colors truncate block"
                          >
                            {follower.name}
                          </Link>
                          {follower.username && (
                            <p className="text-sm text-gray-500 truncate">@{follower.username}</p>
                          )}
                        </div>
                      </div>
                      {follower.id !== currentUser?.id && (
                        <FollowButton
                          userId={follower.id}
                          initialIsFollowing={follower.isFollowing}
                          onFollowChange={() => {
                            // Actualizar el estado local
                            setFollowersData({
                              ...followersData,
                              followers: followersData.followers.map(f =>
                                f.id === follower.id ? { ...f, isFollowing: !f.isFollowing } : f
                              )
                            });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No se pudieron cargar los seguidores</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal Enhanced */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowFollowingModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[32rem] overflow-hidden shadow-2xl transform transition-all animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-primary/5 to-transparent border-b p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck size={20} className="text-primary" />
                <h3 className="font-bold text-lg text-gray-900">Siguiendo</h3>
              </div>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[26rem]">
              {profile.followingCount === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                    <UserCheck size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No sigues a nadie aún</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isOwnProfile ? 'Descubre usuarios interesantes y síguelos' : 'Este usuario no sigue a nadie aún'}
                  </p>
                </div>
              ) : followingData.loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary mb-3"></div>
                  <p className="text-gray-600 font-medium">Cargando...</p>
                </div>
              ) : followingData.following.length > 0 ? (
                <div className="space-y-3">
                  {followingData.following.map((following) => (
                    <div key={following.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 overflow-hidden flex-shrink-0">
                          {following.avatar ? (
                            <img
                              src={getImageUrl(following.avatar, 'social')}
                              alt={following.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary">
                              {following.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/profile/${following.id}`}
                            onClick={() => setShowFollowingModal(false)}
                            className="font-semibold text-gray-900 hover:text-primary transition-colors truncate block"
                          >
                            {following.name}
                          </Link>
                          {following.username && (
                            <p className="text-sm text-gray-500 truncate">@{following.username}</p>
                          )}
                        </div>
                      </div>
                      {following.id !== currentUser?.id && (
                        <FollowButton
                          userId={following.id}
                          initialIsFollowing={true}
                          onFollowChange={() => {
                            // Actualizar el estado local
                            setFollowingData({
                              ...followingData,
                              following: followingData.following.filter(f => f.id !== following.id)
                            });
                            // Actualizar el contador en el perfil
                            setProfile({
                              ...profile,
                              followingCount: profile.followingCount - 1
                            });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                    <UserCheck size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No se pudo cargar la lista</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reel Viewer Modal */}
      {selectedReel && (
        <ReelViewer
          reel={{
            ...selectedReel,
            user: selectedReel.user || {
              id: profile.id,
              name: profile.name,
              avatar: profile.avatar,
              isFollowing: profile.isFollowing,
            }
          }}
          reels={realReels.length > 0 ? realReels : (profile.name === 'Host Demo' ? DEMO_REELS : [])}
          currentIndex={selectedReelIndex}
          onNavigate={(newIndex) => {
            setSelectedReelIndex(newIndex);
            const reelsToUse = realReels.length > 0 ? realReels : (profile.name === 'Host Demo' ? DEMO_REELS : []);
            setSelectedReel(reelsToUse[newIndex]);
          }}
          onClose={() => {
            setSelectedReel(null);
            // Recargar reels para reflejar cambios de likes/comentarios
            if (realReels.length > 0) {
              loadRealReels(true);
            }
          }}
          isOwnProfile={isOwnProfile}
          onFollowChange={handleFollowChange}
        />
      )}

      <EditSocialProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={loadProfile}
      />

      {/* Floating Chat Bubble */}
      {showChatBubble && profile && !isOwnProfile && (
        <FloatingChatBubble
          recipient={{
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar,
          }}
          onClose={() => setShowChatBubble(false)}
        />
      )}

      {/* Floating Action Button - Solo en perfil propio */}
      {isOwnProfile && (
        <>
          {/* Botón principal flotante */}
          <div className="fixed bottom-24 right-8 z-30 flex flex-col gap-3">
            {/* Botones secundarios (aparecen cuando está abierto) */}
            <div className={`flex flex-col gap-3 transition-all duration-300 ${showCreateSidebar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <button
                onClick={() => {
                  setContentType('post');
                  setShowCreateSidebar(true);
                }}
                className="group relative bg-white text-primary p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                title="Crear publicación"
              >
                <ImageIcon size={24} />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Nueva publicación
                </span>
              </button>
              <button
                onClick={() => {
                  setContentType('reel');
                  setShowCreateSidebar(true);
                }}
                className="group relative bg-white text-primary p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
                title="Crear reel"
              >
                <Video size={24} />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Nuevo reel
                </span>
              </button>
            </div>

            {/* Botón principal */}
            <button
              onClick={() => setShowCreateSidebar(!showCreateSidebar)}
              className={`bg-gradient-to-r from-primary to-primary-dark text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 ${showCreateSidebar ? 'rotate-45' : ''}`}
              title="Crear contenido"
            >
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>

          {/* Create Content Sidebar */}
          <CreateContentSidebar
            isOpen={showCreateSidebar}
            onClose={() => setShowCreateSidebar(false)}
            type={contentType}
            onSuccess={() => {
              // Recargar posts o reels según el tipo
              if (contentType === 'post') {
                loadRealPosts(true);
              } else if (contentType === 'reel') {
                loadRealReels(true);
              }
            }}
          />
        </>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="w-full h-full max-w-7xl max-h-[95vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-10"
              >
                <X size={32} />
              </button>
              <PostCard
                post={selectedPost}
                currentUserId={currentUser?.id}
                onDelete={(postId) => {
                  setRealPosts(prev => prev.filter(p => p.id !== postId));
                  setSelectedPost(null);
                }}
                onUpdate={(updatedPost) => {
                  // Actualizar el post en la lista
                  setRealPosts(prev => prev.map(p =>
                    p.id === updatedPost.id ? updatedPost : p
                  ));
                  // Actualizar el post seleccionado
                  setSelectedPost(updatedPost);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reels Sidebar - Filtrado por usuario */}
      <ReelsSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        userId={userId || currentUser?.id}
        filterByUser={true}
      />
    </div>
  );
}

export default ProfilePage;
