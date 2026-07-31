import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Star,
  Home,
  Edit,
  Package,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Map,
  Utensils,
  User,
  Briefcase,
  Ticket,
  Heart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Bell,
  LogOut,
  Send
} from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';
import useAuthStore from '../../../store/authStore';
import { getUnreadCount } from '../../../services/notificationService';

function BusinessLayout({ children, activeMenu }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountSidebarOpen, setAccountSidebarOpen] = useState(() => {
    // Cerrar barra lateral por defecto en móvil
    return window.innerWidth >= 768;
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadBusiness();
  }, [id]);

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

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/businesses/${id}`);
      setBusiness(response.data);
    } catch (error) {
      console.error('Error loading business:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No se encontró el negocio</p>
      </div>
    );
  }

  // Menu items de cuenta de usuario
  const allAccountMenuItems = [
    { to: '/account', label: 'Mi Cuenta', icon: User, key: 'account', exact: true },
    { to: '/account/profile', label: 'Mi Perfil', icon: User, key: 'profile' },
    { to: '/account/businesses', label: 'Mis Negocios', icon: Briefcase, key: 'businesses', roles: ['business_owner', 'admin'] },
    { to: '/bookings', label: 'Mis Reservas', icon: Calendar, key: 'bookings' },
    { to: '/account/events', label: 'Mis Eventos', icon: Ticket, key: 'events' },
    { to: '/messages', label: 'Mensajes', icon: Send, key: 'messages' },
    { to: '/notifications', label: 'Notificaciones', icon: Bell, key: 'notifications', badge: true },
    { to: '/account/favorites', label: 'Favoritos', icon: Heart, key: 'favorites' },
  ];

  const accountMenuItems = allAccountMenuItems.filter(item => {
    if (item.roles) {
      return item.roles.includes(user?.role);
    }
    return true;
  });

  const currentAccountMenu = accountMenuItems.find(item => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  })?.key || 'businesses';

  // Menu items de gestión de negocio
  const menuItems = [
    { to: `/business/${id}/manage`, label: 'Panel', icon: BarChart3, key: 'manage' },
    { to: `/business/${id}/edit`, label: 'Editar Negocio', icon: Edit, key: 'edit' },
    // Mostrar Tours solo para negocios tipo tour
    ...(business.businessType === 'tours' ? [
      { to: `/business/${id}/tours`, label: 'Tours', icon: Map, key: 'tours' }
    ] : []),
    // Mostrar Servicios/Habitaciones solo para hoteles y propiedades (no para restaurantes ni entretenimiento)
    ...(business.businessType === 'hotel' || business.businessType === 'property' ? [
      {
        to: `/business/${id}/services`,
        label: business.businessType === 'property' ? 'Habitaciones' : 'Servicios',
        icon: business.businessType === 'property' ? Home : Package,
        key: 'services'
      }
    ] : []),
    // Mostrar Menú solo para restaurantes y entretenimiento
    ...(business.businessType === 'restaurant' || business.businessType === 'entertainment' ? [
      { to: `/business/${id}/menu`, label: business.businessType === 'entertainment' ? 'Carta' : 'Menú', icon: Utensils, key: 'menu' }
    ] : []),
    { to: `/business/${id}/reservations`, label: 'Reservas', icon: Calendar, key: 'reservations' },
    { to: `/business/${id}/posts`, label: 'Posts', icon: MessageSquare, key: 'posts' },
    { to: `/business/${id}/analytics`, label: 'Estadísticas', icon: BarChart3, key: 'analytics' },
    { to: `/business/${id}/settings`, label: 'Configuración', icon: Settings, key: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra lateral izquierda - Menu de Cuenta */}
      <div
        className={`fixed left-0 top-0 h-screen z-30 ${
          accountSidebarOpen ? 'w-64' : 'w-16'
        }`}
        style={{ backgroundColor: '#034EA2' }}
      >
        <div className="flex flex-col h-full">
          {/* User info compacto */}
          <div className="p-4 border-b border-white/20">
            {accountSidebarOpen ? (
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-white/60 truncate">{user?.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                {user?.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setAccountSidebarOpen(!accountSidebarOpen)}
            className="absolute -right-3 top-20 bg-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all z-50 border-2"
            style={{ borderColor: '#034EA2' }}
          >
            {accountSidebarOpen ? (
              <ChevronLeft size={16} style={{ color: '#034EA2' }} />
            ) : (
              <ChevronRight size={16} style={{ color: '#034EA2' }} />
            )}
          </button>

          {/* Menu items de cuenta */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {accountMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentAccountMenu === item.key;

              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 relative ${
                    isActive
                      ? 'bg-white/20 border-l-4 border-white'
                      : 'hover:bg-white/10'
                  }`}
                  title={!accountSidebarOpen ? item.label : ''}
                >
                  <div className="relative flex-shrink-0">
                    <Icon
                      size={20}
                      className={isActive ? 'text-white' : 'text-white/80'}
                    />
                    {item.badge && unreadCount > 0 && !accountSidebarOpen && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </div>
                  {accountSidebarOpen && (
                    <span className={`text-sm font-medium whitespace-nowrap flex-1 ${
                      isActive ? 'text-white' : 'text-white/90'
                    }`}>
                      {item.label}
                    </span>
                  )}
                  {item.badge && unreadCount > 0 && accountSidebarOpen && (
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
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/10"
              title={!accountSidebarOpen ? 'Cerrar sesión' : ''}
            >
              <LogOut
                size={20}
                className="flex-shrink-0 text-white/80"
              />
              {accountSidebarOpen && (
                <span className="text-sm font-medium text-white/90">
                  Cerrar sesión
                </span>
              )}
            </button>
          </div>

          {/* Footer */}
          {accountSidebarOpen && (
            <div className="p-4 border-t border-white/20">
              <p className="text-xs text-white/60 text-center">© 2026 TuDestino.pe</p>
              <p className="text-xs text-white/50 text-center mt-1">Adaptika S.A.C.S</p>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal con margen izquierdo */}
      <div
        className={`${
          accountSidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        {/* Header con información del negocio */}
        <div className="bg-primary text-white">
          <div className="container mx-auto px-4 py-8">
            <button
              onClick={() => navigate('/account/businesses')}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition"
            >
              <ArrowLeft size={20} />
              Volver a mis negocios
            </button>

            <div className="flex items-start gap-6">
              {business.logo ? (
                <img
                  src={getImageUrl(business.logo, 'business')}
                  alt={business.name}
                  className="w-24 h-24 rounded-lg object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-white/20 flex items-center justify-center">
                  <Home size={40} />
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-white">{business.name}</h1>
                <p className="text-white/90 mb-3">{business.description}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {business.businessType}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Star size={14} fill="currentColor" />
                    {business.averageRating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>

              <Link
                to={`/business/${id}`}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Eye size={18} />
                Ver página pública
              </Link>
            </div>
          </div>
        </div>

        {/* Menú de navegación horizontal del negocio */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto gap-1 py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.key;

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
        <div className="container mx-auto px-4 mt-6 pb-16">
          {children}
        </div>
      </div>
    </div>
  );
}

export default BusinessLayout;
