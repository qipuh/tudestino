import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Home,
  Calendar,
  CheckCircle,
  Tag,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronLeft,
  Bell,
  Image,
  MapPin
} from 'lucide-react';
import useAuthStore from '../store/authStore';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { admin, logout } = useAuthStore();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Usuarios' },
    { path: '/properties', icon: Home, label: 'Propiedades' },
    { path: '/bookings', icon: Calendar, label: 'Reservas' },
    { path: '/verification', icon: CheckCircle, label: 'Verificaciones' },
    { path: '/accommodation-types', icon: Settings, label: 'Tipos de Alojamiento' },
    { path: '/promotions', icon: Tag, label: 'Promociones' },
    { path: '/sliders', icon: Image, label: 'Sliders' },
    { path: '/attractions', icon: MapPin, label: 'Atractivos Turísticos' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-[#2F509F] to-[#1e3a7a] text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <img
                src="/img/tudestino-logo.png"
                alt="TuDestino"
                className="h-8 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <img
                src="/img/2ico.png"
                alt="TD"
                className="h-8 w-8 object-contain"
              />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FFB547] text-[#2F509F] shadow-lg'
                    : 'hover:bg-white/10'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} className={sidebarOpen ? 'mr-3' : 'mx-auto'} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-[#FFB547] flex items-center justify-center text-[#2F509F] font-bold">
                  {admin?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-300 truncate">{admin?.email || ''}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={20} className="mx-auto" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-[#2F509F]">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Panel de Administración'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tu plataforma desde aquí
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFB547] rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <User size={20} className="text-[#2F509F]" />
                <span className="text-sm font-medium text-gray-700">{admin?.name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
