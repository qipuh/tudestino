import { Mail, Phone } from 'lucide-react';

function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h1>
          <p className="text-xl text-gray-600">
            Estamos aquí para ayudarte. Elige el canal que prefieras
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Email */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Mail className="text-primary" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Email</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Escríbenos y te responderemos en menos de 24 horas
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Soporte general:</strong> support@tudestino.pe
              </p>
              <p className="text-gray-700">
                <strong>Negocios:</strong> business@tudestino.pe
              </p>
              <p className="text-gray-700">
                <strong>Legal:</strong> legal@tudestino.pe
              </p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Phone className="text-primary" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Teléfono</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Llámanos o envía un mensaje por WhatsApp
            </p>
            <p className="text-gray-700 mb-2">
              <strong>WhatsApp:</strong> +51 935 191 262
            </p>
            <p className="text-gray-700">
              <strong>Llamadas:</strong> +51 935 191 262
            </p>
          </div>
        </div>

        {/* Formulario de contacto */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de consulta *
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>Soy viajero - Tengo una pregunta</option>
                <option>Soy viajero - Problema con reserva</option>
                <option>Tengo un negocio - Quiero registrarme</option>
                <option>Tengo un negocio - Soporte técnico</option>
                <option>Prensa y medios</option>
                <option>Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje *
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Cuéntanos cómo podemos ayudarte..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition"
            >
              Enviar mensaje
            </button>
          </form>
        </div>

        {/* FAQ rápido */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ¿Buscas respuestas rápidas? Visita nuestro{' '}
            <a href="/help" className="text-primary font-semibold hover:underline">
              Centro de Ayuda
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
