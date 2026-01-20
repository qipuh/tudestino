function CancellationPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Cancelación</h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Políticas de Cancelación por Negocio</h2>
            <p className="text-gray-700 leading-relaxed">
              En TuDestino.pe, cada negocio turístico (hotel, restaurante, tour, evento) establece
              su propia política de cancelación. Como viajero, es importante que revises cuidadosamente
              la política específica de cada reserva antes de confirmarla.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Políticas Más Comunes</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Reembolso completo:</strong> Si cancelas hasta 24 horas antes del check-in/evento
                </p>
                <p className="text-gray-600 text-sm">
                  Ideal para viajeros que necesitan flexibilidad en sus planes
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 bg-yellow-50 p-4 rounded">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Moderada</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Reembolso completo:</strong> Si cancelas hasta 5 días antes<br />
                  <strong>50% de reembolso:</strong> Si cancelas entre 2-5 días antes<br />
                  <strong>Sin reembolso:</strong> Si cancelas con menos de 2 días
                </p>
                <p className="text-gray-600 text-sm">
                  Política balanceada entre flexibilidad y compromiso
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4 bg-red-50 p-4 rounded">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Estricta</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Reembolso completo:</strong> Solo si cancelas hasta 7 días antes<br />
                  <strong>50% de reembolso:</strong> Si cancelas entre 7-14 días antes<br />
                  <strong>Sin reembolso:</strong> Si cancelas con menos de 7 días
                </p>
                <p className="text-gray-600 text-sm">
                  Común en hoteles y tours con alta demanda
                </p>
              </div>

              <div className="border-l-4 border-gray-500 pl-4 bg-gray-50 p-4 rounded">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reembolsable</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Sin reembolso:</strong> No se permiten cancelaciones ni cambios<br />
                  <strong>Precio reducido:</strong> Generalmente 10-30% más económico
                </p>
                <p className="text-gray-600 text-sm">
                  Ideal para fechas confirmadas y presupuestos ajustados
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cómo Cancelar una Reserva</h2>
            <ol className="list-decimal pl-6 text-gray-700 space-y-3">
              <li>Inicia sesión en tu cuenta de TuDestino.pe</li>
              <li>Ve a "Mis Reservas" en tu perfil</li>
              <li>Selecciona la reserva que deseas cancelar</li>
              <li>Haz clic en "Cancelar reserva"</li>
              <li>Revisa el monto de reembolso según la política aplicable</li>
              <li>Confirma la cancelación</li>
              <li>Recibirás un correo de confirmación</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reembolsos</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Los reembolsos se procesan de la siguiente manera:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>El reembolso se calcula según la política de cancelación del negocio</li>
              <li>El dinero se devuelve al mismo método de pago utilizado</li>
              <li>El proceso puede tomar de 5 a 10 días hábiles</li>
              <li>Recibirás una notificación cuando el reembolso haya sido procesado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Circunstancias Especiales</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cancelación por el Negocio</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si el negocio turístico cancela tu reserva, recibirás un <strong>reembolso completo</strong>
              automáticamente, sin importar la política de cancelación. El negocio puede ser penalizado
              si cancela frecuentemente.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Emergencias o Fuerza Mayor</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              En casos de emergencias (desastres naturales, problemas de salud graves, restricciones
              gubernamentales), evalúamos cada caso individualmente. Contacta a nuestro equipo de
              soporte con la documentación necesaria.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Modificaciones de Reserva</h3>
            <p className="text-gray-700 leading-relaxed">
              Si deseas modificar fechas o detalles de tu reserva en lugar de cancelar, contacta
              directamente al negocio a través de la plataforma. Las modificaciones están sujetas
              a disponibilidad y a la política del negocio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Para Negocios Turísticos</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Como negocio registrado en TuDestino.pe:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Puedes elegir entre las políticas de cancelación disponibles</li>
              <li>Debes respetar la política que hayas establecido</li>
              <li>Puedes ofrecer excepciones caso por caso</li>
              <li>Las cancelaciones frecuentes por tu parte afectan tu reputación</li>
              <li>Si cancelas una reserva confirmada, el cliente recibe reembolso completo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disputas</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tienes un problema con una cancelación o reembolso, nuestro equipo de soporte
              está aquí para ayudarte. Contacta a <strong>support@tudestino.pe</strong> con tu
              número de reserva y descripción del problema. Mediaremos entre ambas partes para
              llegar a una solución justa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contacto</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Para consultas sobre cancelaciones:</strong>
              </p>
              <p className="text-gray-700"><strong>Email:</strong> support@tudestino.pe</p>
              <p className="text-gray-700"><strong>WhatsApp:</strong> +51 935 191 262</p>
              <p className="text-gray-700 mt-3 text-sm">
                Horario de atención: Lunes a Domingo, 8:00 AM - 10:00 PM (hora de Perú)
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CancellationPage;
