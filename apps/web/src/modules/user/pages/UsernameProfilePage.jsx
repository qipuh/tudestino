import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfileByUsername } from '../../../services/socialService';
import api from '../../../services/api';
import ProfilePage from './ProfilePage';
import BusinessDetail from '../../business/pages/BusinessDetail';

function UsernameProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBusiness, setIsBusiness] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        // Primero verificar si es un slug de negocio
        try {
          const businessResponse = await api.get(`/businesses/slug/${username}`);
          if (businessResponse.data && businessResponse.data.id) {
            // Es un negocio, mostrar BusinessDetail sin cambiar la URL
            setBusinessId(businessResponse.data.id);
            setIsBusiness(true);
            setLoading(false);
            return;
          }
        } catch (businessError) {
          // No es un negocio, continuar con la búsqueda de usuario
          console.log('Not a business slug, checking for user profile');
        }

        // Si no es un negocio, buscar por nombre de usuario
        const response = await getProfileByUsername(username);

        // Handle nested response format: {success: true, data: {...}}
        const profile = response?.data?.data || response?.data || response;

        console.log('Username profile response:', { response, profile });

        if (profile && profile.id) {
          // Set the userId to render ProfilePage directly
          setUserId(profile.id);
          setIsBusiness(false);
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
  }, [username, navigate]);

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

  // Si es un negocio, renderizar BusinessDetail sin cambiar la URL
  // Esto mantiene la URL bonita (/slug) en el navegador
  if (isBusiness && businessId) {
    return <BusinessDetail businessIdProp={businessId} />;
  }

  // Render ProfilePage directly with the userId, WITHOUT changing the URL
  // This keeps the pretty URL (/username) in the browser
  if (userId) {
    return <ProfilePage userIdProp={userId} />;
  }

  return null;
}

export default UsernameProfilePage;
