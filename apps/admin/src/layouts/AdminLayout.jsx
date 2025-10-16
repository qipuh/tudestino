import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, Calendar, CheckCircle, Tag, Settings } from 'lucide-react';

function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Usuarios' },
    { path: '/properties', icon: Home, label: 'Propiedades' },
    { path: '/bookings', icon: Calendar, label: 'Reservas' },
    { path: '/verification', icon: CheckCircle, label: 'Verificaciones' },
    { path: '/accommodation-types', icon: Settings, label: 'Tipos de Alojamiento' },
    { path: '/promotions', icon: Tag, label: 'Promociones' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">TuDestino Admin</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 hover:bg-gray-700 transition ${
                  isActive ? 'bg-gray-700 border-l-4 border-blue-500' : ''
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-xl font-semibold">Panel de Administración</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin User</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
