function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>

        <p className="text-gray-600 mb-8">
          Última actualización: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed">
              En TuDestino.pe valoramos y respetamos tu privacidad. Esta Política de Privacidad
              explica cómo recopilamos, usamos, compartimos y protegemos tu información personal
              cuando utilizas nuestra plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">2.1 Información proporcionada por ti</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Datos de registro:</strong> Nombre, correo electrónico, teléfono, contraseña</li>
              <li><strong>Datos de perfil:</strong> Foto de perfil, biografía, preferencias</li>
              <li><strong>Información de negocio:</strong> Nombre del negocio, dirección, RUC, licencias, fotos, descripciones</li>
              <li><strong>Información de pago:</strong> Datos bancarios para transferencias (solo para negocios)</li>
              <li><strong>Contenido publicado:</strong> Publicaciones en la red social, comentarios, reseñas, fotos</li>
              <li><strong>Comunicaciones:</strong> Mensajes, consultas de soporte, feedback</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">2.2 Información recopilada automáticamente</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Datos de uso:</strong> Páginas visitadas, tiempo en la plataforma, clics, interacciones</li>
              <li><strong>Información del dispositivo:</strong> Tipo de dispositivo, sistema operativo, navegador</li>
              <li><strong>Datos de ubicación:</strong> IP, ubicación aproximada (si otorgas permiso)</li>
              <li><strong>Cookies y tecnologías similares:</strong> Para mejorar la experiencia de usuario</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo Usamos tu Información</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Utilizamos tu información para:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Facilitar reservas y transacciones entre viajeros y negocios</li>
              <li>Procesar pagos de forma segura</li>
              <li>Personalizar tu experiencia en la plataforma</li>
              <li>Mostrar contenido relevante en la red social</li>
              <li>Enviar confirmaciones de reserva y notificaciones importantes</li>
              <li>Proporcionar soporte al cliente</li>
              <li>Mejorar y optimizar nuestros servicios</li>
              <li>Prevenir fraude y garantizar la seguridad</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Enviar comunicaciones de marketing (con tu consentimiento)</li>
              <li>Generar estadísticas y análisis del mercado turístico (datos anonimizados)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartir Información</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Podemos compartir tu información en las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Con negocios turísticos:</strong> Cuando realizas una reserva, compartimos tu información de contacto necesaria</li>
              <li><strong>Información pública:</strong> Contenido que publicas en la red social es visible para otros usuarios</li>
              <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar (procesadores de pago, hosting, analytics)</li>
              <li><strong>Cumplimiento legal:</strong> Cuando la ley lo requiera o para proteger nuestros derechos</li>
              <li><strong>Transacciones corporativas:</strong> En caso de fusión, venta o reorganización empresarial</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>NO vendemos tu información personal a terceros.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Seguridad de los Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Encriptación de datos sensibles (HTTPS/SSL)</li>
              <li>Autenticación segura de usuarios</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo constante de seguridad</li>
              <li>Auditorías periódicas de seguridad</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Sin embargo, ningún sistema es 100% seguro. Te recomendamos usar contraseñas fuertes
              y no compartir tus credenciales de acceso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Tus Derechos</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Tienes derecho a:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Acceso:</strong> Solicitar una copia de tu información personal</li>
              <li><strong>Corrección:</strong> Actualizar o corregir datos incorrectos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de tu cuenta y datos</li>
              <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos para marketing</li>
              <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
              <li><strong>Retirar consentimiento:</strong> En cualquier momento</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Para ejercer estos derechos, contáctanos en <strong>privacy@tudestino.pe</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Retención de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Conservamos tu información personal solo mientras sea necesario para los fines
              descritos en esta política o según lo requiera la ley. Los datos de transacciones
              se conservan por motivos fiscales y legales durante el tiempo que exige la
              legislación peruana.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies y Tecnologías de Rastreo</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Mantener tu sesión iniciada</li>
              <li>Recordar tus preferencias</li>
              <li>Analizar el uso de la plataforma</li>
              <li>Personalizar contenido y anuncios</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Puedes gestionar las cookies desde la configuración de tu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacidad de Menores</h2>
            <p className="text-gray-700 leading-relaxed">
              TuDestino.pe no está dirigido a menores de 18 años. No recopilamos intencionalmente
              información de menores. Si descubrimos que hemos recopilado datos de un menor,
              los eliminaremos de inmediato.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Transferencias Internacionales</h2>
            <p className="text-gray-700 leading-relaxed">
              Tu información puede ser procesada en servidores ubicados fuera de Perú. Garantizamos
              que cualquier transferencia internacional cumple con estándares adecuados de protección
              de datos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cambios a esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre
              cambios significativos a través de correo electrónico o mediante un aviso en la
              plataforma. La fecha de última actualización siempre aparece al inicio de este documento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tus datos:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@tudestino.pe</p>
              <p className="text-gray-700"><strong>Asunto:</strong> Consulta de Privacidad</p>
              <p className="text-gray-700"><strong>Dirección:</strong> Lima, Perú</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
