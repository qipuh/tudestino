import { Building2, Users, Target, Heart } from 'lucide-react';

function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Acerca de TuDestino.pe
          </h1>
          <p className="text-xl text-gray-600">
            La plataforma que conecta negocios turísticos con viajeros en Perú
          </p>
        </div>

        {/* Misión */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary" size={32} />
            <h2 className="text-3xl font-bold text-gray-900">Nuestra Misión</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            TuDestino.pe nace con la misión de democratizar el acceso al turismo en Perú,
            conectando directamente a viajeros con hoteles, restaurantes, agencias de viajes,
            guías turísticos y organizadores de eventos. Creemos que cada negocio turístico,
            sin importar su tamaño, merece tener las herramientas para crecer y prosperar.
          </p>
        </div>

        {/* Qué nos hace diferentes */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-primary" size={32} />
            <h2 className="text-3xl font-bold text-gray-900">Qué nos hace diferentes</h2>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sistema de reservas + Red social
              </h3>
              <p className="text-gray-700">
                No solo ofrecemos un sistema de reservas online. TuDestino.pe integra una
                red social turística que permite a los negocios interactuar con sus clientes,
                publicar contenido y acceder a datos e insights sobre tendencias del mercado
                turístico peruano.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Toma de decisiones basada en datos
              </h3>
              <p className="text-gray-700">
                A través de nuestra red social y sistema de analytics, los empresarios pueden
                ver qué buscan los turistas, cuáles son las tendencias, qué precios maneja la
                competencia y tomar decisiones inteligentes que aumenten su rentabilidad.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Comisiones justas
              </h3>
              <p className="text-gray-700">
                Solo cobramos comisión por reservas confirmadas y exitosas. Sin costos de
                suscripción, sin tarifas ocultas. Publicar tu negocio es completamente gratis.
              </p>
            </div>
          </div>
        </div>

        {/* Para quién */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="text-primary" size={32} />
            <h2 className="text-3xl font-bold text-gray-900">¿Para quién es TuDestino.pe?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Hoteles y hospedajes</h3>
              <p className="text-gray-600">
                Hostales, hoteles, lodges, resorts y cualquier tipo de alojamiento en Perú
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Restaurantes</h3>
              <p className="text-gray-600">
                Restaurantes, cafés, bares y negocios gastronómicos
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Agencias y tours</h3>
              <p className="text-gray-600">
                Agencias de viajes, tour operadores y empresas de turismo
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Guías y eventos</h3>
              <p className="text-gray-600">
                Guías turísticos certificados y organizadores de eventos
              </p>
            </div>
          </div>
        </div>

        {/* Compromiso */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-primary" size={32} />
            <h2 className="text-3xl font-bold text-gray-900">Nuestro Compromiso</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Nos comprometemos a ser más que una plataforma de reservas. Queremos ser el
            aliado estratégico de los negocios turísticos en Perú, ofreciendo:
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Transparencia total:</strong> Sin costos ocultos ni sorpresas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Soporte en español:</strong> Atención personalizada para negocios peruanos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Mejora continua:</strong> Escuchamos a nuestra comunidad y mejoramos la plataforma constantemente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>Impulsar el turismo local:</strong> Promovemos experiencias auténticas y negocios locales</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#ffb547' }}>¿Tienes un negocio turístico en Perú?</h2>
          <p className="mb-6 opacity-90">
            Únete a TuDestino.pe y empieza a aumentar tus reservas e ingresos hoy mismo
          </p>
          <a
            href="/host"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Registra tu negocio gratis
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
