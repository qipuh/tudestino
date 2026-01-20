import { Check, DollarSign } from 'lucide-react';

function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Precios y Comisiones</h1>
          <p className="text-xl text-gray-600">
            Transparente, simple y sin costos ocultos
          </p>
        </div>

        {/* Hero pricing card */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl p-8 mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <DollarSign size={40} />
            <h2 className="text-5xl font-bold">0</h2>
          </div>
          <p className="text-2xl font-semibold mb-2">Costo de registro</p>
          <p className="text-lg opacity-90">
            Publicar tu negocio en TuDestino.pe es 100% gratis
          </p>
        </div>

        {/* Cómo funciona */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            ¿Cómo funcionan nuestras comisiones?
          </h2>
          <div className="bg-gray-50 rounded-xl p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
              Solo cobramos una comisión cuando recibes una reserva exitosa.
              Si no hay reservas, <strong>no pagas nada</strong>.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border-2 border-primary">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Hoteles & Hospedajes</h3>
                <p className="text-3xl font-bold text-primary mb-2">8-12%</p>
                <p className="text-sm text-gray-600">por reserva confirmada</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Gestión de disponibilidad</li>
                  <li>• Sistema de reservas online</li>
                  <li>• Pagos seguros</li>
                  <li>• Perfil en red social</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border-2 border-primary">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Tours & Actividades</h3>
                <p className="text-3xl font-bold text-primary mb-2">10-15%</p>
                <p className="text-sm text-gray-600">por reserva confirmada</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Calendario de tours</li>
                  <li>• Gestión de grupos</li>
                  <li>• Pagos automáticos</li>
                  <li>• Galería de fotos</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border-2 border-primary">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Restaurantes & Eventos</h3>
                <p className="text-3xl font-bold text-primary mb-2">5-10%</p>
                <p className="text-sm text-gray-600">por reserva confirmada</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• Sistema de reservas de mesas</li>
                  <li>• Menú digital</li>
                  <li>• Gestión de eventos</li>
                  <li>• Publicaciones sociales</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Qué incluye */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Todo incluido sin costo extra
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              'Perfil profesional de negocio',
              'Sistema completo de reservas online',
              'Procesamiento seguro de pagos',
              'Red social integrada para publicaciones',
              'Panel de gestión y estadísticas',
              'Soporte técnico en español',
              'Actualizaciones y mejoras continuas',
              'Sin límite de fotos o publicaciones',
              'Acceso a datos del mercado turístico',
              'App móvil (próximamente)',
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-1">
                  <Check className="text-green-600" size={16} />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparación */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Compara con otras plataformas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left font-semibold">Característica</th>
                  <th className="p-4 text-center font-semibold text-primary">TuDestino.pe</th>
                  <th className="p-4 text-center font-semibold text-gray-500">Otras plataformas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-4">Costo de registro</td>
                  <td className="p-4 text-center text-green-600 font-semibold">Gratis</td>
                  <td className="p-4 text-center text-gray-500">$50-500/mes</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4">Comisión por reserva</td>
                  <td className="p-4 text-center text-primary font-semibold">5-15%</td>
                  <td className="p-4 text-center text-gray-500">15-30%</td>
                </tr>
                <tr>
                  <td className="p-4">Red social integrada</td>
                  <td className="p-4 text-center text-green-600">✓ Incluida</td>
                  <td className="p-4 text-center text-gray-400">✗ No</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-4">Datos del mercado</td>
                  <td className="p-4 text-center text-green-600">✓ Incluido</td>
                  <td className="p-4 text-center text-gray-500">$100+/mes</td>
                </tr>
                <tr>
                  <td className="p-4">Soporte en español</td>
                  <td className="p-4 text-center text-green-600">✓ Siempre</td>
                  <td className="p-4 text-center text-gray-400">Limitado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Ejemplo de costos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Ejemplo de costos reales
          </h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-3">Ejemplo: Hotel con 10 habitaciones</h3>
            <div className="space-y-2 text-gray-700">
              <p>• Precio promedio por noche: S/ 150</p>
              <p>• Reservas mensuales a través de TuDestino.pe: 50</p>
              <p>• Ingresos brutos mensuales: S/ 7,500</p>
              <p>• Comisión TuDestino.pe (10%): <strong>S/ 750</strong></p>
              <p className="text-lg font-bold text-green-600 pt-2">
                • Ingresos netos: S/ 6,750
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Sin TuDestino.pe: Costo de otras plataformas (20% comisión + $200/mes suscripción) = S/ 2,300
            </p>
            <p className="text-lg font-bold text-primary mt-2">
              Ahorro con TuDestino.pe: S/ 1,550/mes
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Preguntas frecuentes sobre precios
          </h2>
          <div className="space-y-4">
            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-semibold cursor-pointer">
                ¿Cuándo se cobra la comisión?
              </summary>
              <p className="mt-2 text-gray-600">
                La comisión se descuenta automáticamente cuando procesamos el pago de una reserva
                confirmada. Tú recibes el monto neto directamente en tu cuenta bancaria.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-semibold cursor-pointer">
                ¿Hay costos adicionales?
              </summary>
              <p className="mt-2 text-gray-600">
                No. No hay costos de registro, suscripción mensual ni tarifas ocultas.
                Solo pagas comisión por reservas exitosas.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-semibold cursor-pointer">
                ¿Puedo cancelar mi cuenta en cualquier momento?
              </summary>
              <p className="mt-2 text-gray-600">
                Sí, puedes pausar o cancelar tu cuenta cuando quieras sin penalización.
                Solo asegúrate de cumplir con las reservas ya confirmadas.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-semibold cursor-pointer">
                ¿Cómo recibo mis pagos?
              </summary>
              <p className="mt-2 text-gray-600">
                Los pagos se transfieren directamente a tu cuenta bancaria en Perú.
                El tiempo de transferencia varía según el tipo de servicio (24-48 horas después
                de la confirmación del servicio).
              </p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#ffb547' }}>¿Listo para empezar?</h2>
          <p className="mb-6 opacity-90">
            Registra tu negocio gratis y empieza a recibir reservas hoy mismo
          </p>
          <a
            href="/host"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Registrar mi negocio gratis
          </a>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
