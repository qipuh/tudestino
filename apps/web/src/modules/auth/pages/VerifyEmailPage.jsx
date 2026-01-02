import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import api from '../../../services/api';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef([]);

  const email = location.state?.email || user?.email;
  const phone = location.state?.phone || user?.phone;
  const message = location.state?.message || '';

  // Determinar si es verificación por WhatsApp o email
  const isWhatsApp = !!phone;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);

      // Focus last filled input or last input
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Single character input
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/verify-email-code', {
        email,
        code: verificationCode,
      });

      if (response.success) {
        setSuccess(`¡${isWhatsApp ? 'WhatsApp' : 'Email'} verificado exitosamente! Redirigiendo a tu cuenta...`);

        // Guardar token y usuario en localStorage y authStore
        const { token, user: verifiedUser } = response.data;

        if (token) {
          localStorage.setItem('token', token);

          // Actualizar el store de autenticación
          useAuthStore.setState({
            user: verifiedUser,
            token: token,
            isAuthenticated: true,
          });
        }

        // Redirigir a la cuenta del usuario después de 2 segundos
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Error al verificar el código';

      if (errorMessage.includes('expirado') || errorMessage.includes('expired')) {
        setError('El código ha expirado. Por favor solicita uno nuevo.');
      } else if (errorMessage.includes('inválido') || errorMessage.includes('invalid')) {
        setError('Código inválido. Por favor verifica e intenta nuevamente.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      setResendLoading(true);
      setError('');

      const response = await api.post('/auth/send-email-code', { email });

      if (response.data.success) {
        setSuccess(`Código reenviado. Por favor revisa tu ${isWhatsApp ? 'WhatsApp' : 'correo'}.`);
        setCountdown(60); // 60 seconds cooldown
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <span className="text-3xl font-bold text-primary">TuDestino</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isWhatsApp ? 'Verifica tu WhatsApp' : 'Verifica tu correo electrónico'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hemos enviado un código de verificación de 6 dígitos a
          </p>
          <p className="text-center text-sm font-medium text-primary">
            {isWhatsApp ? phone : email}
          </p>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Ingresa el código de verificación
            </label>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">
              El código expira en 10 minutos
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Verificar código'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0 || resendLoading}
              className="text-sm text-primary hover:text-primary-dark disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {resendLoading
                ? 'Reenviando...'
                : countdown > 0
                ? `Reenviar código (${countdown}s)`
                : '¿No recibiste el código? Reenviar'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>

        {!isWhatsApp && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Importante:</strong> Revisa tu carpeta de spam o correo no deseado si no encuentras el email.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
