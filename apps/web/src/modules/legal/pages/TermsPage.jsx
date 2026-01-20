function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>

        <p className="text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y usar TuDestino.pe (en adelante, "la Plataforma"), aceptas cumplir con estos
              Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos,
              no debes usar nuestra plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              TuDestino.pe es una plataforma digital que conecta viajeros con negocios turísticos
              en Perú, incluyendo:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Hoteles, hostales y todo tipo de alojamientos</li>
              <li>Restaurantes y establecimientos gastronómicos</li>
              <li>Agencias de viajes y tour operadores</li>
              <li>Guías turísticos certificados</li>
              <li>Organizadores de eventos turísticos</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Además, la plataforma incluye una red social turística donde usuarios y negocios
              pueden interactuar, compartir experiencias y acceder a información del mercado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registro y Cuentas de Usuario</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3.1 Tipos de Usuario</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Viajeros:</strong> Usuarios que buscan y reservan servicios turísticos</li>
              <li><strong>Empresarios/Business Owners:</strong> Propietarios de negocios turísticos que publican sus servicios</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3.2 Responsabilidades</h3>
            <p className="text-gray-700 leading-relaxed">
              Los usuarios son responsables de mantener la confidencialidad de su cuenta y contraseña,
              así como de toda actividad que ocurra bajo su cuenta. Debes proporcionar información
              veraz, precisa y actualizada durante el registro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Reservas y Transacciones</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.1 Proceso de Reserva</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Al realizar una reserva a través de TuDestino.pe, el viajero acepta los términos
              específicos del negocio turístico, incluyendo precios, políticas de cancelación
              y condiciones del servicio.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.2 Pagos</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Todos los pagos se procesan de forma segura a través de nuestra plataforma.
              TuDestino.pe actúa como intermediario de pago entre viajeros y negocios turísticos.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">4.3 Comisiones</h3>
            <p className="text-gray-700 leading-relaxed">
              TuDestino.pe cobra una comisión por cada reserva exitosa procesada a través de la
              plataforma. El porcentaje de comisión se comunica claramente al negocio turístico
              antes de publicar sus servicios. No hay costos de suscripción ni tarifas ocultas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Políticas de Cancelación</h2>
            <p className="text-gray-700 leading-relaxed">
              Cada negocio turístico define su propia política de cancelación. Los viajeros deben
              revisar cuidadosamente estas políticas antes de confirmar una reserva. TuDestino.pe
              facilita el proceso de cancelación según las políticas establecidas por cada negocio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Responsabilidades de los Negocios</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Los negocios turísticos registrados en TuDestino.pe se comprometen a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Proporcionar información veraz y actualizada sobre sus servicios</li>
              <li>Mantener disponibilidad actualizada en tiempo real</li>
              <li>Cumplir con todas las reservas confirmadas</li>
              <li>Contar con las licencias y permisos necesarios para operar</li>
              <li>Ofrecer servicios de calidad según lo publicitado</li>
              <li>Respetar las políticas de cancelación establecidas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Uso de la Red Social</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              La red social integrada en TuDestino.pe está diseñada para compartir experiencias
              turísticas. Los usuarios se comprometen a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>No publicar contenido ofensivo, difamatorio o ilegal</li>
              <li>Respetar los derechos de autor en imágenes y videos</li>
              <li>No realizar spam o publicidad no autorizada</li>
              <li>Mantener un ambiente respetuoso y constructivo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 leading-relaxed">
              TuDestino.pe actúa como intermediario entre viajeros y negocios turísticos. No somos
              responsables de la calidad, seguridad o legalidad de los servicios ofrecidos por
              terceros. Los usuarios utilizan los servicios bajo su propio riesgo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Propiedad Intelectual</h2>
            <p className="text-gray-700 leading-relaxed">
              Todo el contenido de TuDestino.pe, incluyendo diseño, logos, textos y código,
              está protegido por derechos de propiedad intelectual. Los usuarios conservan
              los derechos sobre el contenido que publican, pero otorgan a TuDestino.pe una
              licencia para usar, mostrar y distribuir ese contenido en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modificaciones</h2>
            <p className="text-gray-700 leading-relaxed">
              TuDestino.pe se reserva el derecho de modificar estos términos en cualquier momento.
              Los cambios importantes serán notificados a los usuarios con al menos 15 días de
              anticipación. El uso continuado de la plataforma después de los cambios constituye
              aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-700 leading-relaxed">
              Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa
              se resolverá en los tribunales competentes de Lima, Perú.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Para preguntas sobre estos términos, puedes contactarnos en:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p className="text-gray-700"><strong>Email:</strong> legal@tudestino.pe</p>
              <p className="text-gray-700"><strong>Dirección:</strong> Lima, Perú</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
