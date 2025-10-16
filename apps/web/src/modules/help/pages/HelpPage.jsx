import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  Search,
  ChevronDown,
  Home,
  CreditCard,
  Shield,
  User,
  Calendar
} from 'lucide-react';

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState(null);

  const categories = [
    {
      id: 'getting-started',
      title: 'Comenzar',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600',
      faqs: [
        {
          question: '¿Cómo me registro en TuDestino?',
          answer: 'Para registrarte, haz clic en "Registrarse" en la esquina superior derecha. Puedes registrarte con tu email o usar tu cuenta de Google/Facebook. Completa tu perfil con tu nombre, foto y una breve biografía.'
        },
        {
          question: '¿Cómo busco alojamientos?',
          answer: 'Usa la barra de búsqueda en la página principal. Puedes filtrar por ubicación, fechas, número de huéspedes, tipo de propiedad, precio y amenidades. También puedes explorar las propiedades destacadas en la página de inicio.'
        },
        {
          question: '¿Es seguro usar TuDestino?',
          answer: 'Sí, TuDestino verifica todos los anfitriones, procesa pagos de forma segura, ofrece protección de host y reembolsos para huéspedes en caso de problemas. Lee nuestras políticas de seguridad para más información.'
        }
      ]
    },
    {
      id: 'bookings',
      title: 'Reservas',
      icon: Calendar,
      color: 'bg-green-100 text-green-600',
      faqs: [
        {
          question: '¿Cómo hago una reserva?',
          answer: 'Selecciona la propiedad que te interesa, elige tus fechas y número de huéspedes. Revisa el precio total y haz clic en "Reservar". Completa el pago y recibirás una confirmación por email.'
        },
        {
          question: '¿Puedo cancelar mi reserva?',
          answer: 'Sí, puedes cancelar tu reserva desde "Mis Reservas". El reembolso depende de la política de cancelación de la propiedad. Revisa la política antes de hacer la reserva.'
        },
        {
          question: '¿Cómo me comunico con el anfitrión?',
          answer: 'Una vez confirmada la reserva, puedes enviar mensajes al anfitrión desde la sección "Mensajes" o directamente desde los detalles de tu reserva.'
        },
        {
          question: '¿Qué pasa si tengo problemas durante mi estancia?',
          answer: 'Contacta inmediatamente al anfitrión a través de mensajes. Si el problema no se resuelve, contacta a nuestro equipo de soporte desde la sección de ayuda en tu reserva.'
        }
      ]
    },
    {
      id: 'hosting',
      title: 'Ser Anfitrión',
      icon: Home,
      color: 'bg-purple-100 text-purple-600',
      faqs: [
        {
          question: '¿Cómo publico mi propiedad?',
          answer: 'Haz clic en "Pon tu espacio en TuDestino" en el menú. Completa la información de tu propiedad: tipo, ubicación, fotos, descripción, amenidades y precio. Publica tu anuncio y empieza a recibir reservas.'
        },
        {
          question: '¿Cuánto cuesta publicar?',
          answer: 'Publicar tu propiedad es gratis. Solo cobramos una comisión del 12% sobre cada reserva completada. No hay costos ocultos ni tarifas mensuales.'
        },
        {
          question: '¿Cuándo recibo el pago?',
          answer: 'Los pagos se procesan 24 horas después del check-in del huésped y se transfieren a tu cuenta bancaria registrada en un plazo de 3-5 días hábiles.'
        },
        {
          question: '¿Puedo rechazar una reserva?',
          answer: 'Sí, puedes revisar cada solicitud de reserva y aceptarla o rechazarla. Sin embargo, rechazar muchas solicitudes puede afectar tu posicionamiento en las búsquedas.'
        },
        {
          question: '¿Qué protección tengo como anfitrión?',
          answer: 'Todas las reservas incluyen protección de host contra daños hasta $1,000,000. Si hay daños, repórtalos dentro de las 48 horas posteriores al check-out.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Pagos',
      icon: CreditCard,
      color: 'bg-yellow-100 text-yellow-600',
      faqs: [
        {
          question: '¿Qué métodos de pago aceptan?',
          answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal, transferencias bancarias y pagos en criptomonedas (Bitcoin, Ethereum).'
        },
        {
          question: '¿Cuándo se me cobra?',
          answer: 'El pago completo se cobra al momento de confirmar la reserva. El dinero se retiene de forma segura y se libera al anfitrión 24 horas después del check-in.'
        },
        {
          question: '¿Hay costos adicionales?',
          answer: 'El precio mostrado incluye la tarifa de servicio. Algunas propiedades pueden tener costos adicionales como limpieza o depósito de seguridad, que se muestran claramente antes de confirmar.'
        },
        {
          question: '¿Cómo obtengo un reembolso?',
          answer: 'Si cancelas según la política de cancelación, el reembolso se procesa automáticamente al método de pago original en 5-10 días hábiles.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Mi Cuenta',
      icon: User,
      color: 'bg-red-100 text-red-600',
      faqs: [
        {
          question: '¿Cómo actualizo mi perfil?',
          answer: 'Ve a "Mi Cuenta" desde el menú de usuario. Ahí puedes actualizar tu foto, nombre, biografía, información de contacto y preferencias.'
        },
        {
          question: '¿Cómo cambio mi contraseña?',
          answer: 'En "Mi Cuenta", ve a la sección de Seguridad y selecciona "Cambiar contraseña". Necesitarás tu contraseña actual para confirmar el cambio.'
        },
        {
          question: '¿Puedo tener cuenta de host y huésped?',
          answer: 'Sí, puedes ser huésped y anfitrión con la misma cuenta. Tu perfil se adapta automáticamente según estés buscando alojamiento o publicando propiedades.'
        },
        {
          question: '¿Cómo elimino mi cuenta?',
          answer: 'Puedes solicitar la eliminación de tu cuenta en "Configuración" > "Privacidad y datos". Asegúrate de no tener reservas activas antes de eliminarla.'
        }
      ]
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: Shield,
      color: 'bg-indigo-100 text-indigo-600',
      faqs: [
        {
          question: '¿Cómo verifica TuDestino a los usuarios?',
          answer: 'Verificamos la identidad mediante email, teléfono y documentos oficiales. Los anfitriones también pasan por una verificación de propiedad.'
        },
        {
          question: '¿Es seguro compartir información personal?',
          answer: 'Tu información personal está encriptada y protegida. Solo compartimos datos necesarios con anfitriones/huéspedes después de confirmar una reserva.'
        },
        {
          question: '¿Qué hago si detecto una estafa?',
          answer: 'Repórtala inmediatamente a través de "Reportar problema" en el perfil o propiedad sospechosa. Nunca hagas pagos fuera de la plataforma.'
        }
      ]
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Chat en vivo',
      description: 'Disponible 24/7',
      action: 'Iniciar chat',
      color: 'bg-blue-500'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'soporte@tudestino.com',
      action: 'Enviar email',
      color: 'bg-green-500'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      description: '+1 (555) 123-4567',
      action: 'Llamar ahora',
      color: 'bg-purple-500'
    }
  ];

  const filteredCategories = categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle size={64} className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
          <p className="text-xl opacity-90 mb-8">
            ¿En qué podemos ayudarte hoy?
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca respuestas a tus preguntas..."
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isOpen = openCategory === category.id;

            return (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                      <p className="text-sm text-gray-600">{category.faqs.length} preguntas</p>
                    </div>
                  </div>
                  <ChevronDown
                    size={24}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-4 border-t">
                    {category.faqs.map((faq, index) => (
                      <details key={index} className="group">
                        <summary className="py-3 cursor-pointer list-none font-semibold text-gray-900 hover:text-primary transition">
                          {faq.question}
                        </summary>
                        <p className="pl-4 pb-3 text-gray-600 leading-relaxed border-l-2 border-gray-200">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No encontramos resultados para "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white border-t py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Aún necesitas ayuda?
            </h2>
            <p className="text-xl text-gray-600">
              Nuestro equipo de soporte está aquí para ti
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="text-center p-6 rounded-xl border hover:border-primary hover:shadow-lg transition">
                  <div className={`${method.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <button className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium">
                    {method.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 py-12 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/host"
              className="p-6 bg-white rounded-xl border hover:border-primary hover:shadow-lg transition group"
            >
              <Home className="text-primary mb-3 group-hover:scale-110 transition" size={32} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Información para anfitriones</h3>
              <p className="text-gray-600">
                Aprende cómo publicar tu propiedad y empezar a ganar dinero
              </p>
            </Link>

            <Link
              to="/"
              className="p-6 bg-white rounded-xl border hover:border-primary hover:shadow-lg transition group"
            >
              <BookOpen className="text-primary mb-3 group-hover:scale-110 transition" size={32} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Guía para huéspedes</h3>
              <p className="text-gray-600">
                Descubre cómo encontrar y reservar el alojamiento perfecto
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;
