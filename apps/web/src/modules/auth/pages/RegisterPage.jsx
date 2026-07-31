import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X, AlertTriangle, User, Briefcase } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import countriesService from '../../../services/countriesService';
import GoogleLoginButton from '../components/GoogleLoginButton';

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Muy débil', color: 'bg-red-500' },
    { label: 'Débil', color: 'bg-red-500' },
    { label: 'Regular', color: 'bg-gold' },
    { label: 'Buena', color: 'bg-secondary' },
    { label: 'Fuerte', color: 'bg-green-500' },
    { label: 'Muy fuerte', color: 'bg-green-500' },
  ];

  return { score, ...levels[Math.min(score, levels.length - 1)] };
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country_code: '+51',
    role: 'guest', // guest o business_owner
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await countriesService.getAll();

      if (response.success && response.data) {
        setCountries(response.data);

        const detectedCountry = await countriesService.detectByIP();

        if (detectedCountry.success && detectedCountry.data) {
          const country = response.data.find(c => c.code === detectedCountry.data.code);

          if (country) {
            setSelectedCountry(country);
            setFormData(prev => ({ ...prev, country_code: country.phone_code }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      setFormData(prev => ({ ...prev, country_code: '+51' }));
    } finally {
      setLoadingCountries(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    const country = countries.find(c => c.code === countryCode);
    setSelectedCountry(country);
    setFormData({
      ...formData,
      country_code: country ? country.phone_code : '+51',
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email), [formData.email]);
  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const canSubmit =
    formData.first_name.trim() &&
    formData.last_name.trim() &&
    emailValid &&
    formData.password.length >= 6 &&
    passwordsMatch &&
    formData.acceptTerms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true, confirmPassword: true });

    if (!emailValid) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    const fullName = `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name}`.trim();

    const result = await register({
      name: fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      country_code: formData.country_code,
      role: formData.role,
    });

    if (result.success) {
      navigate('/verify-email', {
        state: {
          email: formData.email,
          message: result.message || 'Usuario creado. Por favor verifica tu email.',
        }
      });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <img src="/img/logo.svg" alt="TuDestino" className="h-10 w-auto" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-ink">
            {step === 1 ? '¿Cómo quieres usar TuDestino?' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-2 text-center text-sm text-mute">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('guest')}
              className="w-full p-6 bg-white border-2 border-line rounded-2xl hover:border-primary hover:shadow-card transition group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition">
                <User className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-ink group-hover:text-primary transition">Soy usuario</h3>
              <p className="text-mute text-sm">
                Quiero buscar y reservar alojamientos, restaurantes, eventos y más
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('business_owner')}
              className="w-full p-6 bg-white border-2 border-line rounded-2xl hover:border-primary hover:shadow-card transition group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-3 group-hover:bg-secondary/15 transition">
                <Briefcase className="text-secondary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-ink group-hover:text-primary transition">Soy dueño de negocio</h3>
              <p className="text-mute text-sm">
                Quiero registrar mi negocio (hotel, restaurante, eventos) y ofrecer servicios
              </p>
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-ink mb-1">
                    Nombre(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-line rounded-xl placeholder-mute/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-ink mb-1">
                    Apellido(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-line rounded-xl placeholder-mute/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    placeholder="Pérez García"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className={`appearance-none block w-full px-3 py-2 border rounded-xl placeholder-mute/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition ${
                    touched.email && formData.email && !emailValid ? 'border-red-400' : 'border-line'
                  }`}
                  placeholder="tu@email.com"
                />
                {touched.email && formData.email && !emailValid && (
                  <p className="mt-1 text-xs text-red-600">Ingresa un correo electrónico válido</p>
                )}
                <p className="mt-1 text-xs text-mute">
                  A este correo te enviaremos un código para verificar tu cuenta
                </p>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-ink mb-1">
                  País
                </label>
                <select
                  id="country"
                  value={selectedCountry?.code || ''}
                  onChange={handleCountryChange}
                  disabled={loadingCountries}
                  className="appearance-none block w-full px-3 py-2 border border-line rounded-xl placeholder-mute/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-sand transition"
                >
                  {loadingCountries ? (
                    <option value="">Cargando países...</option>
                  ) : (
                    <>
                      {!selectedCountry && <option value="">Selecciona un país</option>}
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag_emoji} {country.name} ({country.phone_code})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-ink mb-1">
                  Teléfono <span className="text-mute font-normal">(opcional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.country_code}
                    readOnly
                    className="w-20 px-3 py-2 border border-line rounded-xl bg-sand text-ink font-medium"
                  />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 appearance-none block px-3 py-2 border border-line rounded-xl placeholder-mute/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    placeholder="987654321"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-line rounded-xl placeholder-mute/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors ${
                            i < passwordStrength.score ? passwordStrength.color : 'bg-line'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-mute">{passwordStrength.label}</p>
                  </div>
                )}
                <p className="mt-1 text-xs text-mute">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-xl placeholder-mute/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition ${
                      touched.confirmPassword && formData.confirmPassword && !passwordsMatch ? 'border-red-400' : 'border-line'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <p className={`mt-1 text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordsMatch ? <Check size={12} /> : <X size={12} />}
                    {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 mt-1 text-primary focus:ring-primary border-line rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-ink">
                Acepto los{' '}
                <Link to="/terms" className="text-primary hover:text-primary-dark">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacy" className="text-primary hover:text-primary-dark">
                  política de privacidad
                </Link>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 border border-line rounded-full shadow-sm text-sm font-medium text-ink bg-white hover:bg-sand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="flex-1 py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-sand text-mute">O regístrate con</span>
              </div>
            </div>

            <div>
              <GoogleLoginButton />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
