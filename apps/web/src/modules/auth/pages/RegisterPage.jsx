import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import countriesService from '../../../services/countriesService';
import GoogleLoginButton from '../components/GoogleLoginButton';

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

  useEffect(() => {
    console.log('🚀 RegisterPage mounted, loading countries...');
    loadCountries();
  }, []);

  useEffect(() => {
    console.log('📊 State update:', {
      step,
      loadingCountries,
      countriesCount: countries.length,
      selectedCountry: selectedCountry?.name,
    });
  }, [step, loadingCountries, countries, selectedCountry]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      const response = await countriesService.getAll();
      console.log('Countries response:', response);

      if (response.success && response.data) {
        setCountries(response.data);

        // Detectar país por IP
        const detectedCountry = await countriesService.detectByIP();
        console.log('Detected country:', detectedCountry);

        if (detectedCountry.success && detectedCountry.data) {
          const country = response.data.find(c => c.code === detectedCountry.data.code);
          console.log('Found country:', country);

          if (country) {
            setSelectedCountry(country);
            setFormData(prev => ({ ...prev, country_code: country.phone_code }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading countries:', error);
      // Set default Peru country on error
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
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

    // Construir nombre completo
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
      // Redirigir a verificación
      const verificationMessage = formData.phone
        ? 'Usuario creado. Por favor verifica tu WhatsApp.'
        : 'Usuario creado. Por favor verifica tu email.';

      navigate('/verify-email', {
        state: {
          email: formData.email,
          phone: formData.phone,
          message: result.message || verificationMessage
        }
      });
    } else {
      setError(result.error);
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
            {step === 1 ? '¿Cómo quieres usar TuDestino?' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
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
              className="w-full p-6 border-2 border-gray-300 rounded-xl hover:border-primary hover:shadow-lg transition group"
            >
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary">Soy usuario</h3>
              <p className="text-gray-600 text-sm">
                Quiero buscar y reservar alojamientos, restaurantes, eventos y más
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('business_owner')}
              className="w-full p-6 border-2 border-gray-300 rounded-xl hover:border-primary hover:shadow-lg transition group"
            >
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary">Soy dueño de negocio</h3>
              <p className="text-gray-600 text-sm">
                Quiero registrar mi negocio (hotel, restaurante, eventos) y ofrecer servicios
              </p>
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Pérez García"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  País <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  value={selectedCountry?.code || ''}
                  onChange={handleCountryChange}
                  disabled={loadingCountries}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100"
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.country_code}
                    readOnly
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium"
                  />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 appearance-none block px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="987654321"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 mt-1 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
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
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">O regístrate con</span>
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
