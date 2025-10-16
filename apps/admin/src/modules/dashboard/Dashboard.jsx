import { Users, Home, Calendar, DollarSign } from 'lucide-react';

function Dashboard() {
  const stats = [
    { label: 'Total Usuarios', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { label: 'Propiedades', value: '567', icon: Home, color: 'bg-green-500' },
    { label: 'Reservas Activas', value: '89', icon: Calendar, color: 'bg-purple-500' },
    { label: 'Ingresos Mes', value: '$12,345', icon: DollarSign, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        {/* TODO: Agregar tabla de actividad reciente */}
      </div>
    </div>
  );
}

export default Dashboard;
