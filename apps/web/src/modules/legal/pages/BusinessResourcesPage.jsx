import { BookOpen, TrendingUp, Users, FileText, Video, MessageCircle } from 'lucide-react';

function BusinessResourcesPage() {
  const resources = [
    {
      icon: BookOpen,
      title: 'Guías de inicio',
      description: 'Aprende a crear y optimizar tu perfil de negocio',
      items: [
        'Cómo crear un perfil atractivo',
        'Mejores prácticas para fotos',
        'Cómo escribir descripciones que vendan',
        'Configurar tu disponibilidad y precios'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Marketing y ventas',
      description: 'Estrategias para aumentar tus reservas',
      items: [
        'Cómo usar la red social efectivamente',
        'Promociones y ofertas que funcionan',
        'Optimización SEO de tu perfil',
        'Análisis de competencia'
      ]
    },
    {
      icon: Users,
      title: 'Gestión de clientes',
      description: 'Mejora la experiencia de tus huéspedes',
      items: [
        'Responder reseñas profesionalmente',
        'Manejo de quejas y problemas',
        'Fidelización de clientes',
        'Comunicación efectiva'
      ]
    },
    {
      icon: FileText,
      title: 'Legal y operaciones',
      description: 'Cumple con regulaciones y mejores prácticas',
      items: [
        'Requisitos legales en Perú',
        'Políticas de cancelación recomendadas',
        'Contratos y documentación',
        'Protección de datos de clientes'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recursos para Empresarios Turísticos
          </h1>
          <p className="text-xl text-gray-600">
            Todo lo que necesitas para tener éxito en TuDestino.pe
          </p>
        </div>

        {/* Recursos principales */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="text-primary" size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{resource.title}</h2>
                </div>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <ul className="space-y-2">
                  {resource.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-primary font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-4 text-primary font-semibold hover:underline">
                  Ver recursos →
                </button>
              </div>
            );
          })}
        </div>

        {/* Video tutoriales */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Video className="text-primary" size={32} />
            <h2 className="text-3xl font-bold text-gray-900">Video Tutoriales</h2>
          </div>
          <p className="text-gray-700 mb-6">
            Aprende paso a paso con nuestros tutoriales en video
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Registro y configuración inicial', duration: '8 min' },
              { title: 'Cómo gestionar reservas', duration: '12 min' },
              { title: 'Maximiza tu visibilidad', duration: '15 min' },
            ].map((video, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-md">
                <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <Video className="text-gray-400" size={48} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
                <p className="text-sm text-gray-500">{video.duration}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Centro de ayuda rápido */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Respuestas Rápidas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                question: '¿Cómo actualizo mi disponibilidad?',
                answer: 'Ve a tu panel de gestión > Calendario y actualiza las fechas disponibles.'
              },
              {
                question: '¿Cómo cambio mis precios?',
                answer: 'En tu perfil de negocio > Servicios/Habitaciones > Editar precios.'
              },
              {
                question: '¿Cómo añado más fotos?',
                answer: 'Panel de gestión > Galería > Subir fotos (máx. 20 fotos por servicio).'
              },
              {
                question: '¿Cómo respondo reseñas?',
                answer: 'Notificaciones > Reseñas pendientes > Responder públicamente.'
              },
              {
                question: '¿Cómo veo mis estadísticas?',
                answer: 'Panel de gestión > Analytics para ver visitas, reservas y tendencias.'
              },
              {
                question: '¿Cómo promociono mi negocio?',
                answer: 'Usa la red social para publicar contenido, ofertas especiales y novedades.'
              },
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comunidad */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle size={32} />
            <h2 className="text-3xl font-bold">Comunidad de Empresarios</h2>
          </div>
          <p className="text-lg opacity-90 mb-6">
            Únete a otros empresarios turísticos en Perú. Comparte experiencias,
            aprende y crece junto a la comunidad.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">Grupo de WhatsApp</h3>
              <p className="text-sm opacity-90 mb-3">
                Chat exclusivo para negocios registrados
              </p>
              <button className="text-sm bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                Unirse
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">Foro de Empresarios</h3>
              <p className="text-sm opacity-90 mb-3">
                Haz preguntas y comparte consejos
              </p>
              <button className="text-sm bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                Acceder
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">Webinars Mensuales</h3>
              <p className="text-sm opacity-90 mb-3">
                Sesiones en vivo con expertos
              </p>
              <button className="text-sm bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                Ver calendario
              </button>
            </div>
          </div>
        </div>

        {/* Casos de éxito */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Casos de Éxito
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div>
                  <h3 className="font-bold text-lg">Hotel Boutique Lima</h3>
                  <p className="text-sm text-gray-500">Hotel • Lima, Perú</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                "En 3 meses aumentamos nuestras reservas directas en 60% gracias a TuDestino.pe.
                La red social nos ayudó a conectar con viajeros que buscan experiencias auténticas."
              </p>
              <p className="text-primary font-semibold">+60% reservas en 3 meses</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div>
                  <h3 className="font-bold text-lg">Tours Machu Picchu</h3>
                  <p className="text-sm text-gray-500">Tour Operador • Cusco, Perú</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                "Los datos del mercado nos ayudaron a ajustar nuestros precios y ofertas.
                Ahora competimos mejor y nuestros tours se llenan más rápido."
              </p>
              <p className="text-primary font-semibold">Ocupación del 85%</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Necesitas ayuda personalizada?
          </h2>
          <p className="text-gray-600 mb-6">
            Nuestro equipo está listo para ayudarte a maximizar tu éxito en la plataforma
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
            >
              Contactar soporte
            </a>
            <a
              href="/help"
              className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition"
            >
              Centro de ayuda
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessResourcesPage;
