import { Link } from 'react-router-dom';
import { Home, DollarSign, Shield, Clock, TrendingUp, Users } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

function HostLandingPage() {
  const { user } = useAuthStore();

  const benefits = [
    {
      icon: DollarSign,
      title: 'Genera ingresos extra',
      description: 'Monetiza tu espacio cuando no lo uses y genera ingresos adicionales',
    },
    {
      icon: Shield,
      title: 'Protección total',
      description: 'Cobertura de daños y protección de host incluida en cada reserva',
    },
    {
      icon: Clock,
      title: 'Control total',
      description: 'Tú decides cuándo, cómo y a quién alquilar tu propiedad',
    },
    {
      icon: TrendingUp,
      title: 'Alcance global',
      description: 'Miles de viajeros buscando lugares como el tuyo cada día',
    },
    {
      icon: Users,
      title: 'Comunidad de hosts',
      description: 'Únete a una comunidad de anfitriones que comparten experiencias',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Crea tu anuncio',
      description: 'Describe tu espacio, añade fotos y establece tus precios',
    },
    {
      number: '2',
      title: 'Recibe reservas',
      description: 'Los viajeros pueden encontrar y reservar tu espacio',
    },
    {
      number: '3',
      title: 'Recibe pagos',
      description: 'Los pagos se procesan de forma segura a través de la plataforma',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Pon tu espacio en <span className="text-primary">TuDestino</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Comparte tu espacio con viajeros de todo el mundo y genera ingresos extra.
                Es fácil, seguro y tú tienes el control total.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  user.role === 'host' ? (
                    <Link
                      to="/host/properties"
                      className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-lg font-semibold shadow-lg hover:shadow-xl"
                    >
                      Ver mis propiedades
                    </Link>
                  ) : (
                    <Link
                      to="/host/properties/register"
                      className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-lg font-semibold shadow-lg hover:shadow-xl"
                    >
                      Publicar mi propiedad
                    </Link>
                  )
                ) : (
                  <>
                    <Link
                      to="/register?role=host"
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
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"
                  alt="Hermosa propiedad"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">$2,500</p>
                    <p className="text-sm text-gray-600">Promedio mensual</p>
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
              Por qué ser host en TuDestino
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Únete a miles de anfitriones que ya están ganando dinero compartiendo sus espacios
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
              Cómo funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              En solo 3 pasos podrás empezar a recibir reservas
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
      <div className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Home size={64} className="mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a nuestra comunidad de hosts y empieza a generar ingresos hoy mismo
          </p>
          {user ? (
            user.role === 'host' ? (
              <Link
                to="/host/properties"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition text-lg font-semibold shadow-lg"
              >
                Gestionar mis propiedades
              </Link>
            ) : (
              <Link
                to="/host/properties/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition text-lg font-semibold shadow-lg"
              >
                Publicar mi primera propiedad
              </Link>
            )
          ) : (
            <Link
              to="/register?role=host"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition text-lg font-semibold shadow-lg"
            >
              Registrarme como host
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
                ¿Cuánto cuesta publicar mi propiedad?
                <span className="ml-2 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Publicar tu propiedad en TuDestino es completamente gratis. Solo cobramos una pequeña
                comisión por cada reserva completada.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg p-6 hover:border-primary transition">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Cuándo recibo los pagos?
                <span className="ml-2 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Los pagos se procesan automáticamente 24 horas después del check-in del huésped y
                se transfieren a tu cuenta bancaria.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg p-6 hover:border-primary transition">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Qué pasa si hay daños en mi propiedad?
                <span className="ml-2 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Todas las reservas incluyen protección de host. Si hay daños, puedes reportarlos
                dentro de las 48 horas posteriores al check-out y te ayudaremos con el proceso.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg p-6 hover:border-primary transition">
              <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                ¿Puedo cancelar una reserva?
                <span className="ml-2 text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-gray-600">
                Sí, pero recomendamos evitar cancelaciones ya que afectan tu reputación como host.
                En casos excepcionales, puedes cancelar con al menos 7 días de anticipación.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostLandingPage;
