import { Outlet, useLocation } from 'react-router-dom';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { useSidebar } from '../contexts/SidebarContext';

function MainLayout() {
  const { sidebarOpen, sidebarVisible } = useSidebar();
  const location = useLocation();

  // Ocultar header en páginas de administración (tienen su propio sistema de navegación)
  // Nota: /business/:id (vista pública) SÍ muestra header, solo se oculta en rutas de gestión
  const isBusinessManagement = location.pathname.match(/^\/business\/[^/]+\/(manage|edit|services|reservations|posts|analytics|settings|menu|spa-services|property|tours)/);
  const hideHeader = location.pathname.startsWith('/account') ||
                     isBusinessManagement ||
                     location.pathname.startsWith('/bookings') ||
                     location.pathname.startsWith('/messages') ||
                     location.pathname.startsWith('/notifications');

  // Ocultar footer en páginas de búsqueda y administración
  const hideFooter = location.pathname === '/search' ||
                     location.pathname.startsWith('/search?') ||
                     location.pathname.startsWith('/account') ||
                     isBusinessManagement ||
                     location.pathname.startsWith('/bookings') ||
                     location.pathname.startsWith('/messages') ||
                     location.pathname.startsWith('/notifications');

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <Header />}
      <main
        className="flex-1 transition-all duration-300"
        style={{
          marginRight: (sidebarVisible && sidebarOpen) ? '22rem' : '0'
        }}
      >
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default MainLayout;
