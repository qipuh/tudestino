import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const message = location.state?.message || '';

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
    const digits = value.replace(/\D/g, '');

    if (digits.length > 1) {
      // Handle paste
      const pastedCode = digits.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);

      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = digits;
    setCode(newCode);

    if (digits && index < 5) {
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
        setSuccess('¡Email verificado exitosamente! Redirigiendo a tu cuenta...');

        const { token, user: verifiedUser } = response.data;

        if (token) {
          localStorage.setItem('token', token);
          useAuthStore.setState({
            user: verifiedUser,
            token: token,
            isAuthenticated: true,
          });
        }

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
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
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

      if (response.success) {
        setSuccess('Código reenviado. Por favor revisa tu correo.');
        setCountdown(60);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = code.every((d) => d !== '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <img src="/img/logo.svg" alt="TuDestino" className="h-10 w-auto" />
          </Link>
          <div className="mt-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="text-primary" size={28} />
            </div>
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold text-ink">
            Verifica tu correo electrónico
          </h2>
          <p className="mt-2 text-center text-sm text-mute">
            Hemos enviado un código de verificación de 6 dígitos a
          </p>
          <p className="text-center text-sm font-medium text-primary">
            {email}
          </p>
        </div>

        {message && (
          <div className="bg-primary/5 border border-primary/20 text-primary px-4 py-3 rounded-xl text-sm">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-3 text-center">
              Ingresa el código de verificación
            </label>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                  autoFocus={index === 0}
                  disabled={loading || !!success}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-mute text-center">
              El código expira en 10 minutos
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !!success || !isComplete}
            className="w-full py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Verificando...' : 'Verificar código'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0 || resendLoading}
              className="text-sm text-primary hover:text-primary-dark disabled:text-mute disabled:cursor-not-allowed font-medium"
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
              className="text-sm text-mute hover:text-ink"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>

        <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertTriangle className="text-gold flex-shrink-0" size={18} />
            <p className="text-sm text-ink">
              <strong>Importante:</strong> Revisa tu carpeta de spam o correo no deseado si no encuentras el email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
