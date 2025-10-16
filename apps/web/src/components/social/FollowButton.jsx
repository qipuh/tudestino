import { useState } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import { followUser, unfollowUser } from '../../services/socialService';

function FollowButton({ userId, initialIsFollowing = false, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followUser(userId);
        setIsFollowing(true);
      }

      // Notificar al padre del cambio
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-primary text-white hover:bg-primary-dark'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Procesando...</span>
        </>
      ) : isFollowing ? (
        <>
          <UserMinus size={18} />
          <span>Siguiendo</span>
        </>
      ) : (
        <>
          <UserPlus size={18} />
          <span>Seguir</span>
        </>
      )}
    </button>
  );
}

export default FollowButton;
