import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, User, Bell, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { useSidebar } from '../contexts/SidebarContext';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { sidebarOpen, sidebarVisible } = useSidebar();
  const navigate = useNavigate();

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
            <span className="text-2xl font-bold text-primary">
              <img className="logo-td" src="/img/tudestino-logo.png" alt="TuDestino Logo" />
            </span>
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
          <div className="flex items-center gap-4">
            {!user && (
              <Link to="/business_owner" className="hidden md:block text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-full">
                Pon tu espacio en TuDestino
              </Link>
            )}

            {user ? (
              <>
                {/* Logged in - Show direct links */}
                <Link
                  to="/account"
                  className="hidden md:flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                >
                  <User size={18} />
                  MI CUENTA
                </Link>
                <Link
                  to="/notifications"
                  className="hidden md:flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-lg transition relative"
                >
                  <Bell size={18} />
                  NOTIFICACIONES
                </Link>
                <Link
                  to="/messages"
                  className="hidden md:flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                >
                  <MessageSquare size={18} />
                  MENSAJES
                </Link>

                {/* Mobile/Small Menu with logout */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:shadow-md transition"
                  >
                    <Menu size={16} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                      <div className="md:hidden">
                        <Link
                          to="/account"
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Mi Cuenta
                        </Link>
                        <Link
                          to="/notifications"
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Notificaciones
                        </Link>
                        <Link
                          to="/messages"
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Mensajes
                        </Link>
                        <hr className="my-2" />
                      </div>
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
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:shadow-md transition"
                >
                  <Menu size={16} />
                  <User size={20} className="text-gray-600" />
                </button>

                {/* Dropdown Menu for non-logged users */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                      <Link
                        to="/login"
                        className="block px-4 py-3 text-sm font-medium hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Iniciar sesión
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-3 text-sm hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Registrarse
                      </Link>
                      <hr className="my-2" />
                      <Link
                        to="/business_owner"
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Pon tu espacio en TuDestino
                      </Link>
                      <Link
                        to="/help"
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Ayuda
                      </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
