import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Calendar,
  Ticket,
  Send,
  Heart,
  Settings,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Home
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getImageUrl } from '../services/api';
import { getUnreadCount } from '../services/notificationService';

function UserAccountLayout({ children, activeMenu }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Cerrar barra lateral por defecto en móvil
    return window.innerWidth >= 768;
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar contador de notificaciones
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const allMenuItems = [
    { to: '/account', label: 'Mi Cuenta', icon: User, key: 'account', exact: true },
    { to: '/account/profile', label: 'Mi Perfil', icon: User, key: 'profile' },
    { to: '/account/businesses', label: 'Mis Negocios', icon: Briefcase, key: 'businesses', roles: ['business_owner', 'admin'] },
    { to: '/bookings', label: 'Mis Reservas', icon: Calendar, key: 'bookings' },
    { to: '/account/events', label: 'Mis Eventos', icon: Ticket, key: 'events' },
    { to: '/messages', label: 'Mensajes', icon: Send, key: 'messages' },
    { to: '/notifications', label: 'Notificaciones', icon: Bell, key: 'notifications', badge: true },
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
    <div className="min-h-screen bg-gray-50">
      {/* Barra lateral izquierda contraible */}
      <div
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
        style={{ backgroundColor: '#002c91' }}
      >
        <div className="flex flex-col h-full">
          {/* User info */}
          <div className="p-4 border-b border-white/20">
            {sidebarOpen ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-white truncate">{user.name}</h2>
                    <p className="text-xs text-white/70 truncate">{user.email}</p>
                    {user.role && (
                      <span className="inline-block mt-1 text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Home button */}
                  <Link
                    to="/"
                    className="flex items-center justify-center bg-white/20 hover:bg-white/30 p-2 rounded-lg transition flex-1"
                    title="Volver a TuDestino"
                  >
                    <Home size={18} className="text-white" />
                  </Link>

                  {/* Profile button */}
                  {user.username ? (
                    <a
                      href={`/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition flex-1"
                      title="Ver perfil"
                    >
                      <UserCircle size={18} className="text-white" />
                      <span className="text-xs text-white font-medium">Ver perfil</span>
                    </a>
                  ) : (
                    <Link
                      to="/account/profile"
                      className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg transition flex-1"
                      title="Configurar Perfil"
                    >
                      <Settings size={18} className="text-white" />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                {user.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-24 bg-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all z-50 border-2"
            style={{ borderColor: '#002c91' }}
          >
            {sidebarOpen ? (
              <ChevronLeft size={16} style={{ color: '#002c91' }} />
            ) : (
              <ChevronRight size={16} style={{ color: '#002c91' }} />
            )}
          </button>

          {/* Menu items */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentActiveMenu === item.key;

              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 transition-all relative ${
                    isActive
                      ? 'bg-white/20 border-l-4 border-white'
                      : 'hover:bg-white/10'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <div className="relative flex-shrink-0">
                    <Icon
                      size={20}
                      className={isActive ? 'text-white' : 'text-white/80'}
                    />
                    {item.badge && unreadCount > 0 && !sidebarOpen && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </div>
                  {sidebarOpen && (
                    <span className={`text-sm font-medium whitespace-nowrap flex-1 ${
                      isActive ? 'text-white' : 'text-white/90'
                    }`}>
                      {item.label}
                    </span>
                  )}
                  {item.badge && unreadCount > 0 && sidebarOpen && (
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Cerrar sesión */}
          <div className="border-t border-white/20">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/10 transition-all"
              title={!sidebarOpen ? 'Cerrar sesión' : ''}
            >
              <LogOut
                size={20}
                className="flex-shrink-0 text-white/80"
              />
              {sidebarOpen && (
                <span className="text-sm font-medium text-white/90">
                  Cerrar sesión
                </span>
              )}
            </button>
          </div>

          {/* Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t border-white/20">
              <p className="text-xs text-white/60 text-center">© 2026 TuDestino.pe</p>
              <p className="text-xs text-white/50 text-center mt-1">Adaptika S.A.C.S</p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div
        className={`transition-all duration-300 pt-6 pb-16 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <div className="container mx-auto px-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default UserAccountLayout;
