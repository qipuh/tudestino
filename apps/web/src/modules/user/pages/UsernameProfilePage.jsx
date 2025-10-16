import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileByUsername } from '../../../services/socialService';
import ProfilePage from './ProfilePage';

function UsernameProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfileByUsername(username);

        // Handle nested response format: {success: true, data: {...}}
        const profile = response?.data?.data || response?.data || response;

        console.log('Username profile response:', { response, profile });

        if (profile && profile.id) {
          // Set the userId to render ProfilePage directly
          setUserId(profile.id);
        } else {
          setError('Perfil no encontrado');
        }
      } catch (err) {
        console.error('Error loading profile by username:', err);
        setError(err?.response?.data?.message || err.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil no encontrado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Render ProfilePage directly with the userId, WITHOUT changing the URL
  // This keeps the pretty URL (/username) in the browser
  if (userId) {
    return <ProfilePage userIdProp={userId} />;
  }

  return null;
}

export default UsernameProfilePage;
