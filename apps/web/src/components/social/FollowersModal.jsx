import { useEffect, useState } from 'react';
import { X, User } from 'lucide-react';
import { getFollowers, getFollowing } from '../../services/socialService';
import FollowButton from './FollowButton';
import { Link } from 'react-router-dom';

function FollowersModal({ isOpen, onClose, userId, type = 'followers' }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUsers();
    }
  }, [isOpen, userId, type]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = type === 'followers'
        ? await getFollowers(userId)
        : await getFollowing(userId);

      setUsers(response.data[type]);
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {type === 'followers' ? 'Seguidores' : 'Siguiendo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay usuarios para mostrar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Link to={`/profile/${user.id}`} className="flex items-center gap-3 flex-1">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={24} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{user.travelBio || 'Viajero'}</p>
                      <p className="text-xs text-gray-500">{user.followersCount} seguidores</p>
                    </div>
                  </Link>
                  <div onClick={(e) => e.stopPropagation()}>
                    <FollowButton
                      userId={user.id}
                      initialIsFollowing={user.isFollowing}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasMore && (
          <div className="p-4 border-t text-center">
            <button className="text-primary hover:underline">Ver más</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowersModal;
