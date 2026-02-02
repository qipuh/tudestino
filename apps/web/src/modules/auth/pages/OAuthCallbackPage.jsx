import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Error en OAuth:', error);
      alert('Error al iniciar sesión con Google. Por favor intenta nuevamente.');
      navigate('/login');
      return;
    }

    if (token) {
      try {
        // Decodificar token para obtener datos del usuario
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Guardar token en localStorage
        localStorage.setItem('token', token);

        // Actualizar store de autenticación
        setUser({
          id: payload.id,
          email: payload.email,
          role: payload.role,
          name: payload.name
        });

        // Redirigir a home
        navigate('/');
      } catch (err) {
        console.error('Error procesando token:', err);
        alert('Error procesando la autenticación. Por favor intenta nuevamente.');
        navigate('/login');
      }
    } else {
      // Si no hay token ni error, redirigir a login
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Iniciando sesión...</p>
        <p className="text-sm text-gray-500 mt-2">Por favor espera un momento</p>
      </div>
    </div>
  );
}

export default OAuthCallbackPage;
