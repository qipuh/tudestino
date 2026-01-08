import { Link, useLocation } from 'react-router-dom';
import {
  User,
  Briefcase,
  Calendar,
  Ticket,
  MessageSquare,
  Heart,
  Settings,
  ExternalLink
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getImageUrl } from '../services/api';

function UserAccountLayout({ children, activeMenu }) {
  const { user } = useAuthStore();
  const location = useLocation();

  const allMenuItems = [
    { to: '/account', label: 'Mi Cuenta', icon: User, key: 'account', exact: true },
    { to: '/account/profile', label: 'Mi Perfil', icon: User, key: 'profile' },
    { to: '/account/businesses', label: 'Mis Negocios', icon: Briefcase, key: 'businesses', roles: ['business_owner', 'admin'] },
    { to: '/bookings', label: 'Mis Reservas', icon: Calendar, key: 'bookings' },
    { to: '/account/events', label: 'Mis Eventos', icon: Ticket, key: 'events' },
    { to: '/messages', label: 'Mensajes', icon: MessageSquare, key: 'messages' },
    { to: '/account/favorites', label: 'Favoritos', icon: Heart, key: 'favorites' },
  ];

  // Filtrar menú según rol del usuario
  const menuItems = allMenuItems.filter(item => {
    if (item.roles) {
      return item.roles.includes(user?.role);
    }
    return true;
  });

  // Determinar activeMenu basado en la ruta actual si no se proporciona
  const currentActiveMenu = activeMenu || menuItems.find(item => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  })?.key || 'account';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Debes iniciar sesión para acceder a esta página</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header con información del usuario */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {user.avatar ? (
              <img
                src={getImageUrl(user.avatar)}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                {user.username ? (
                  <a
                    href={`/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition shadow-lg hover:shadow-xl border border-white/30"
                  >
                    <ExternalLink size={16} />
                    Ver Mi Perfil Social
                  </a>
                ) : (
                  <Link
                    to="/account/profile"
                    className="flex items-center gap-2 text-sm font-semibold text-white bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg transition shadow-lg hover:shadow-xl"
                  >
                    <Settings size={16} />
                    Configura tu Perfil
                  </Link>
                )}
              </div>
              <p className="text-white/90 mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-3">
                {user.role && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm capitalize">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentActiveMenu === item.key;

              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                    isActive
                      ? 'bg-primary/10 border-b-2 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-600'} />
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido de la página */}
      <div className="container mx-auto px-4 mt-6">
        {children}
      </div>
    </div>
  );
}

export default UserAccountLayout;
