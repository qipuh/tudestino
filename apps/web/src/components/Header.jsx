import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, Bell, MessageSquare, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { useSidebar } from '../contexts/SidebarContext';
import { getUnreadCount } from '../services/notificationService';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuthStore();
  const { sidebarOpen, sidebarVisible } = useSidebar();
  const navigate = useNavigate();

  // Cargar contador de notificaciones no leídas
  useEffect(() => {
    if (user) {
      loadUnreadCount();

      // Actualizar cada 30 segundos
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
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className="border-b border-gray-200 sticky top-0 bg-white z-50 transition-all duration-300"
      style={{
        marginRight: (sidebarVisible && sidebarOpen) ? '22rem' : '0'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img className="logo-td" src="/img/logo.svg" alt="TuDestino" />
          </Link>

          {/* Search Bar
          <div className="hidden md:flex items-center border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition">
            <button className="text-sm font-medium">Cualquier lugar</button>
            <div className="w-px h-6 bg-gray-300 mx-4" />
            <button className="text-sm font-medium">Cualquier semana</button>
            <div className="w-px h-6 bg-gray-300 mx-4" />
            <button className="text-sm text-gray-600">Añadir huéspedes</button>
            <button className="ml-3 bg-primary text-white rounded-full p-2">
              <Search size={16} />
            </button>
          </div> */}

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                {/* Botones visibles cuando NO está logueado */}
                <Link
                  to="/host"
                  className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-2 rounded-lg transition"
                >
                  Publica tu negocio
                </Link>
                <Link
                  to="/login"
                  className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-2 rounded-lg transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="hidden md:block text-sm font-semibold bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition shadow-sm"
                >
                  Registrarse
                </Link>

                {/* Mobile Menu - Solo para móviles */}
                <div className="md:hidden flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-medium text-sm shadow-sm hover:bg-primary-dark transition"
                  >
                    <User size={16} />
                    Iniciar
                  </Link>

                  {/* Menú adicional */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center gap-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition"
                    >
                      <Menu size={18} />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          to="/host"
                          className="block px-4 py-3 text-sm hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Publica tu negocio
                        </Link>
                        <Link
                          to="/help"
                          className="block px-4 py-3 text-sm hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Ayuda
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Logged in - Show direct links */}
                <Link
                  to="/account"
                  className="hidden md:flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                >
                  <User size={18} />
                  Mi cuenta
                </Link>
                <Link
                  to="/notifications"
                  className="hidden md:flex items-center gap-2 text-sm font-medium hover:bg-gray-100 p-2 rounded-lg transition relative"
                  title="Notificaciones"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/messages"
                  className="hidden md:flex items-center gap-2 text-sm font-medium hover:bg-gray-100 p-2 rounded-lg transition"
                  title="Mensajes"
                >
                  <MessageSquare size={18} />
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 text-sm font-medium hover:bg-gray-100 p-2 rounded-lg transition"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>

                {/* Mobile Menu */}
                <div className="md:hidden relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:shadow-md transition"
                  >
                    <Menu size={16} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mi Cuenta
                      </Link>
                      <Link
                        to="/notifications"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 relative"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center justify-between">
                          Notificaciones
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </Link>
                      <Link
                        to="/messages"
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mensajes
                      </Link>
                      <hr className="my-2" />
                      <button
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={handleLogout}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
