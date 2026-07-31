import { Link } from 'react-router-dom';
import { Home, DollarSign, Shield, Clock, TrendingUp, Users } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

function HostLandingPage() {
  const { user } = useAuthStore();

  const benefits = [
    {
      icon: DollarSign,
      title: 'Maximiza tus reservas',
      description: 'Aumenta tu rentabilidad con un sistema de reservas online que conecta tu hotel, restaurante, tour o evento directamente con clientes en Perú y el mundo',
    },
    {
      icon: TrendingUp,
      title: 'Red social para decisiones inteligentes',
      description: 'Analiza el comportamiento de tus clientes, las tendencias del mercado turístico peruano y toma decisiones basadas en datos reales de la comunidad',
    },
    {
      icon: Shield,
      title: 'Pagos seguros y comisiones justas',
      description: 'Recibe tus pagos de forma segura. Solo cobramos comisión por reservas confirmadas, sin costos ocultos',
    },
    {
      icon: Users,
      title: 'Visibilidad en el mercado turístico peruano',
      description: 'Miles de viajeros buscan hoteles, restaurantes, tours y eventos en Perú cada día. Destaca tu negocio donde te están buscando',
    },
    {
      icon: Clock,
      title: 'Gestión 24/7 desde un solo lugar',
      description: 'Administra reservas, publica contenido en la red social, actualiza precios y responde consultas desde un panel unificado',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Registra tu negocio turístico',
      description: 'Hotel, restaurante, agencia de viajes, guía turístico o evento. Crea tu perfil, sube fotos profesionales y configura tu disponibilidad',
    },
    {
      number: '2',
      title: 'Recibe reservas automáticas',
      description: 'Los viajeros reservan directamente en tu perfil. Gestiona disponibilidad, precios y confirmaciones en tiempo real',
    },
    {
      number: '3',
      title: 'Crece con insights de la red social',
      description: 'Analiza qué buscan los turistas, comparte experiencias, mejora tu servicio y aumenta tus ingresos con datos reales',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Aumenta las reservas de tu hotel, restaurante o tour en <span className="text-primary">Perú</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                TuDestino.pe conecta tu negocio turístico con miles de viajeros.
                Sistema de reservas online + red social que te ayuda a tomar mejores decisiones y aumentar tu rentabilidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  user.role === 'business_owner' || user.role === 'host' ? (
                    <Link
                      to="/account/businesses"
                      className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-lg font-semibold shadow-lg hover:shadow-xl"
                    >
                      Ver mis negocios
                    </Link>
                  ) : (
                    <Link
                      to="/business/create"
                      className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-lg font-semibold shadow-lg hover:shadow-xl"
                    >
                      Publicar mi negocio
                    </Link>
                  )
                ) : (
                  <>
                    <Link
                      to="/register?role=business_owner"
                      className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-lg font-semibold shadow-lg hover:shadow-xl"
                    >
                      Comenzar
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition text-lg font-semibold"
                    >
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80"
                  alt="Negocio exitoso"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">+45%</p>
                    <p className="text-sm text-gray-600">Más reservas en promedio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué los hoteles, restaurantes y agencias de Perú eligen TuDestino.pe?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Reservas directas + red social = más ingresos y decisiones inteligentes para tu negocio turístico
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-gray-200 hover:border-primary hover:shadow-lg transition group"
                >
                  <div className="bg-primary/10 p-3 rounded-lg inline-block mb-4 group-hover:bg-primary/20 transition">
                    <Icon className="text-primary" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How it works Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cómo registrar tu hotel, restaurante o tour en TuDestino.pe
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En 3 pasos simples empieza a recibir reservas directas y aumenta tu rentabilidad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
                  <div className="bg-primary text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-primary"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Home size={64} className="mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffb547' }}>
            Lleva tu hotel, restaurante o agencia al siguiente nivel
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a los negocios turísticos en Perú que ya aumentaron sus reservas e ingresos con TuDestino.pe
          </p>
          {user ? (
            user.role === 'business_owner' || user.role === 'host' ? (
              <Link
                to="/account/businesses"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition text-lg font-semibold shadow-lg"
              >
                Gestionar mis negocios
              </Link>
            ) : (
              <Link
                to="/business/create"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition text-lg font-semibold shadow-lg"
              >
                Publicar mi primer negocio
              </Link>
            )
          ) : (
            <Link
              to="/register?role=business_owner"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition text-lg font-semibold shadow-lg"
            >
              Registra tu negocio ahora
            </Link>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            <details className="group border border-gray-200 rounded-lg p-6 hover:border-primary transition">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Qué negocios turísticos pueden registrarse en TuDestino.pe?
                <span className="ml-2 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600">
                <strong>Hoteles y hospedajes</strong> en Perú (hostales, lodges, resorts), <strong>restaurantes y cafés</strong>,
                <strong>agencias de viajes y turismo</strong>, <strong>guías turísticos certificados</strong>,
                <strong>organizadores de eventos</strong>, tours operadores y cualquier servicio relacionado con turismo en Perú.
                Publicar es gratis, solo cobras comisión por reservas confirmadas.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg p-6 hover:border-primary transition">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Cómo aumenta TuDestino.pe mis reservas y rentabilidad?
                <span className="ml-2 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Con nuestro <strong>sistema de reservas online</strong> los viajeros reservan directamente tu hotel, tour o restaurante
                sin intermediarios. Además, nuestra <strong>red social turística</strong> te permite publicar contenido, interactuar con
                clientes y acceder a datos sobre qué buscan los turistas en Perú, ayudándote a tomar decisiones que aumentan tus ingresos.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg p-6 hover:border-primary transition">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Cómo funciona la red social para mejorar mi toma de decisiones?
                <span className="ml-2 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600">
                La red social de TuDestino.pe te muestra <strong>tendencias del turismo en Perú</strong>, qué experiencias buscan los viajeros,
                opiniones reales y comportamiento de tu competencia. Esto te permite ajustar precios, crear ofertas atractivas,
                mejorar tus servicios y maximizar tu ocupación u ventas basándote en datos reales, no en suposiciones.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg p-6 hover:border-primary transition">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Cómo recibo los pagos de mis reservas?
                <span className="ml-2 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Los pagos de reservas se procesan de forma <strong>100% segura</strong> y se transfieren directamente a tu cuenta bancaria
                en Perú. Solo pagas comisión por reservas exitosas, sin costos de suscripción ni tarifas ocultas.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg p-6 hover:border-primary transition">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Necesito experiencia técnica para gestionar mi perfil?
                <span className="ml-2 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600">
                No. TuDestino.pe está diseñado para ser <strong>simple e intuitivo</strong>. Desde un solo panel administras reservas,
                actualizas disponibilidad de habitaciones o tours, publicas en la red social, respondes consultas y ves tus estadísticas.
                Todo en español y optimizado para negocios en Perú.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostLandingPage;
