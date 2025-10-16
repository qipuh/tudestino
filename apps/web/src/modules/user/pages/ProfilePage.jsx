import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Edit, MapPin, Calendar, Home, Video, Share2, Briefcase,
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Users, UserCheck, Plus
} from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import { getUserProfile, getMyProfile, getFollowers, getFollowing } from '../../../services/socialService';
import { getHostProperties } from '../../../services/propertyService';
import FollowButton from '../../../components/social/FollowButton';
import EditSocialProfileModal from '../../../components/social/EditSocialProfileModal';
import ReelViewer from '../../../components/social/ReelViewer';
import FloatingChatBubble from '../../../components/messaging/FloatingChatBubble';

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

  const isOwnProfile = !userId || (currentUser && userId === currentUser.id);
  const isHost = profile?.role === 'host';

  useEffect(() => {
    if (currentUser || userId) {
      loadProfile();
    }
  }, [userId, currentUser?.id]);

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
    if (properties.length > 0) return;
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });

    // Load properties when switching to servicios tab
    if (tab === 'servicios' && isHost && properties.length === 0) {
      loadProperties();
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
      {/* Header Compact */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark p-0.5">
              <div className="w-full h-full rounded-full bg-white overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gray-200 text-gray-600">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Info & Actions */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                {isOwnProfile ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Editar perfil
                    </button>
                    <Link
                      to="/feed"
                      className="px-4 py-1 text-sm font-medium bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:opacity-90 flex items-center gap-1.5 transition"
                    >
                      <Plus size={16} />
                      Crear
                    </Link>
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
                      className="px-4 py-1 text-sm font-medium bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:opacity-90 flex items-center gap-1.5 transition"
                      title="Enviar mensaje"
                    >
                      <MessageCircle size={16} fill="currentColor" />
                      Mensaje
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Inline */}
              <div className="flex gap-4 text-sm">
                <button onClick={() => setShowFollowersModal(true)} className="hover:text-gray-600">
                  <span className="font-bold">{profile.followersCount}</span> seguidores
                </button>
                <button className="hover:text-gray-600">
                  <span className="font-bold">{profile.followingCount}</span> siguiendo
                </button>
                <div className="text-gray-600">
                  <Heart size={14} className="inline mr-1" />
                  <span className="font-bold">{profile.totalLikes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Biography Section */}
          {(profile.bio || profile.travelBio) && (
            <div className="mt-3">
              {profile.bio && (
                <p className="text-sm text-gray-700 mb-1">{profile.bio}</p>
              )}
              {profile.travelBio && (
                <p className="text-sm text-gray-600 italic">{profile.travelBio}</p>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex justify-between items-center mt-4 border-b -mb-px px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col items-center gap-1 px-6 py-3 transition border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  title={tab.label}
                >
                  <Icon size={24} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Muro Tab */}
        {activeTab === 'muro' && (
          <div className="space-y-6">
            {profile.name === 'Host Demo' ? (
              postsData.map((post) => {
                const isLiked = likedPosts.has(post.id);
                const isSaved = savedPosts.has(post.id);
                return (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm border">
                    {/* Post Header */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                          {profile.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{profile.name}</p>
                          <p className="text-xs text-gray-500">{post.createdAt}</p>
                        </div>
                      </div>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>

                    {/* Post Image */}
                    {post.images.length > 0 && (
                      <img src={post.images[0]} alt="Post" className="w-full h-96 object-cover" />
                    )}

                    {/* Post Actions */}
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`transition-all ${isLiked ? 'text-red-500 scale-110' : 'hover:text-red-500'}`}
                        >
                          <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                          className="hover:text-blue-500 transition"
                        >
                          <MessageCircle size={24} />
                        </button>
                        <button className="hover:text-green-500 transition">
                          <Send size={24} />
                        </button>
                        <button
                          onClick={() => handleSavePost(post.id)}
                          className={`ml-auto transition-all ${isSaved ? 'text-yellow-500 scale-110' : 'hover:text-yellow-500'}`}
                        >
                          <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <p className="font-semibold text-sm mb-2">{post.likes} Me gusta</p>
                      <p className="text-sm">
                        <span className="font-semibold">{profile.name}</span> {post.content}
                      </p>

                      {post.comments > 0 && (
                        <button
                          onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                          className="text-sm text-gray-500 mt-2 hover:text-gray-700"
                        >
                          Ver los {post.comments} comentarios
                        </button>
                      )}

                      {/* Comments Section */}
                      {showComments === post.id && (
                        <div className="mt-4 pt-4 border-t">
                          {/* Existing comments */}
                          {comments[post.id]?.map((comment) => {
                            const commentLikesCount = commentLikes[comment.id] || 0;
                            const hasLikedComment = commentLikes[`${comment.id}_liked`];
                            return (
                              <div key={comment.id} className="mb-4">
                                <div className="flex gap-2">
                                  <Link to={`/profile/${comment.userId || userId}`}>
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary">
                                      {comment.user.charAt(0).toUpperCase()}
                                    </div>
                                  </Link>
                                  <div className="flex-1">
                                    <p className="text-sm">
                                      <Link to={`/profile/${comment.userId || userId}`} className="font-semibold mr-2 hover:underline">
                                        {comment.user}
                                      </Link>
                                      {comment.text}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <p className="text-xs text-gray-500">Justo ahora</p>
                                      <button
                                        onClick={() => handleLikeComment(comment.id)}
                                        className={`text-xs font-medium ${hasLikedComment ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                                      >
                                        {commentLikesCount > 0 ? `${commentLikesCount} Me gusta` : 'Me gusta'}
                                      </button>
                                      <button
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                        className="text-xs text-gray-600 hover:text-primary font-medium"
                                      >
                                        Responder
                                      </button>
                                    </div>

                                    {/* Respuestas */}
                                    {comment.replies?.length > 0 && (
                                      <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
                                        {comment.replies.map((reply) => (
                                          <div key={reply.id} className="flex gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                              {reply.user.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                              <p className="text-sm">
                                                <span className="font-semibold mr-2">{reply.user}</span>
                                                {reply.text}
                                              </p>
                                              <p className="text-xs text-gray-500 mt-1">Justo ahora</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Reply input */}
                                    {replyingTo === comment.id && (
                                      <div className="flex gap-2 mt-3">
                                        <input
                                          type="text"
                                          value={newComment}
                                          onChange={(e) => setNewComment(e.target.value)}
                                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id, comment.id)}
                                          placeholder={`Responder a ${comment.user}...`}
                                          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                          autoFocus
                                        />
                                        <button
                                          onClick={() => handleAddComment(post.id, comment.id)}
                                          disabled={!newComment.trim()}
                                          className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
                                        >
                                          Enviar
                                        </button>
                                        <button
                                          onClick={() => {
                                            setReplyingTo(null);
                                            setNewComment('');
                                          }}
                                          className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm"
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Add comment */}
                          {!replyingTo && (
                            <div className="flex gap-2 mt-3">
                              <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                placeholder="Agrega un comentario..."
                                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                disabled={!newComment.trim()}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Publicar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <Home size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No hay publicaciones aún</p>
              </div>
            )}
          </div>
        )}

        {/* Reels Tab */}
        {activeTab === 'reels' && (
          <div className="grid grid-cols-3 gap-1">
            {profile.name === 'Host Demo' ? (
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
                    src={reel.videoUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
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
              <div className="col-span-3 text-center py-16">
                <Video size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No hay reels aún</p>
              </div>
            )}
          </div>
        )}

        {/* Compartidos Tab */}
        {activeTab === 'compartidos' && (
          <div className="text-center py-16 bg-white rounded-xl">
            <Share2 size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No hay publicaciones compartidas aún</p>
          </div>
        )}

        {/* Servicios Tab (solo para hosts) */}
        {activeTab === 'servicios' && isHost && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Propiedades ({properties.length})</h2>
              {isOwnProfile && (
                <Link
                  to="/host/properties"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  Gestionar Propiedades
                </Link>
              )}
            </div>

            {loadingProperties ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition group"
                  >
                    {/* Property Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <Home size={48} className="text-gray-400" />
                        </div>
                      )}
                      {/* Property Type Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                        {property.type}
                      </div>
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                        ${property.pricePerNight}/noche
                      </div>
                    </div>

                    {/* Property Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <MapPin size={14} />
                        {property.location?.city || property.city}, {property.location?.country || property.country}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {property.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{property.guests} huéspedes</span>
                        <span>{property.bedrooms} habitaciones</span>
                        <span>{property.bathrooms} baños</span>
                      </div>
                      {property.rating && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2">
                          <Heart size={14} className="text-red-500" fill="currentColor" />
                          <span className="text-sm font-semibold">{property.rating}</span>
                          <span className="text-sm text-gray-500">({property.reviewsCount || 0} reseñas)</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <Home size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No hay propiedades publicadas aún</p>
                {isOwnProfile && (
                  <Link
                    to="/host/properties"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
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

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFollowersModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="font-bold">Seguidores</h3>
              <button onClick={() => setShowFollowersModal(false)}>✕</button>
            </div>
            <div className="p-4">
              {profile.followersCount === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay seguidores aún</p>
              ) : (
                <p className="text-center text-gray-500 py-8">Cargando seguidores...</p>
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
            user: {
              id: profile.id,
              name: profile.name,
              avatar: profile.avatar,
              isFollowing: profile.isFollowing,
            }
          }}
          reels={DEMO_REELS}
          currentIndex={selectedReelIndex}
          onNavigate={(newIndex) => {
            setSelectedReelIndex(newIndex);
            setSelectedReel(DEMO_REELS[newIndex]);
          }}
          onClose={() => setSelectedReel(null)}
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
    </div>
  );
}

export default ProfilePage;
