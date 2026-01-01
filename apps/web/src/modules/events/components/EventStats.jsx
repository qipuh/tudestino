import { Users, Ticket, DollarSign, TrendingUp, Eye, Share2 } from 'lucide-react';

function EventStats({ event, registrations = [], tickets = [] }) {
  // Calcular estadísticas
  const totalRegistrations = registrations.length;
  const totalTicketsSold = tickets.reduce((sum, ticket) => sum + (ticket.sold || 0), 0);
  const totalRevenue = tickets.reduce(
    (sum, ticket) => sum + (ticket.sold || 0) * ticket.price,
    0
  );
  const capacity = event.capacity || 0;
  const capacityPercentage = capacity > 0 ? (totalRegistrations / capacity) * 100 : 0;

  const stats = [
    {
      label: 'Registrados',
      value: totalRegistrations,
      icon: Users,
      color: 'blue',
      detail: capacity > 0 ? `${capacityPercentage.toFixed(0)}% de capacidad` : null
    },
    {
      label: 'Tickets Vendidos',
      value: totalTicketsSold,
      icon: Ticket,
      color: 'green',
      detail: tickets.length > 0 ? `${tickets.length} tipos` : null
    },
    {
      label: 'Ingresos',
      value: `S/. ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'purple',
      detail: totalTicketsSold > 0 ? `~S/. ${(totalRevenue / totalTicketsSold).toFixed(2)} promedio` : null
    },
    {
      label: 'Vistas',
      value: event.viewCount || 0,
      icon: Eye,
      color: 'orange',
      detail: null
    },
    {
      label: 'Compartidos',
      value: event.shareCount || 0,
      icon: Share2,
      color: 'pink',
      detail: null
    },
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Estadísticas del Evento</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp size={16} />
          <span>Actualizado en tiempo real</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const colors = colorClasses[stat.color];
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className={`bg-white border ${colors.border} rounded-lg p-6 hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 ${colors.bg} rounded-lg`}>
                  <Icon className={colors.text} size={24} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.detail && (
                  <p className="text-xs text-gray-500 mt-1">{stat.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Capacity Progress Bar */}
      {capacity > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Capacidad del Evento</h3>
            <span className="text-sm text-gray-600">
              {totalRegistrations} / {capacity}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                capacityPercentage >= 100
                  ? 'bg-red-500'
                  : capacityPercentage >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            {capacityPercentage >= 100
              ? '¡Evento lleno!'
              : capacityPercentage >= 75
              ? 'Quedan pocos lugares'
              : `${(capacity - totalRegistrations)} lugares disponibles`}
          </p>
        </div>
      )}

      {/* Tickets Breakdown */}
      {tickets.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ventas por Tipo de Ticket</h3>

          <div className="space-y-3">
            {tickets.map((ticket) => {
              const sold = ticket.sold || 0;
              const percentage = (sold / ticket.quantity) * 100;

              return (
                <div key={ticket.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{ticket.name}</span>
                    <span className="text-sm text-gray-600">
                      {sold} / {ticket.quantity} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventStats;
