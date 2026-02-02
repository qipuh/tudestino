import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Error al enviar el email de recuperación');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el email de recuperación');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link to="/" className="flex justify-center">
              <span className="text-3xl font-bold text-primary">TuDestino</span>
            </Link>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Revisa tu correo
            </h2>
          </div>

          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            <p className="text-center">
              Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
            </p>
            <p className="text-center mt-2 text-sm">
              Por favor revisa tu bandeja de entrada y la carpeta de spam.
            </p>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <span className="text-3xl font-bold text-primary">TuDestino</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
