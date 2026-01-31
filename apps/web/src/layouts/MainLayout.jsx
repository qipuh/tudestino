import { Outlet, useLocation } from 'react-router-dom';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { useSidebar } from '../contexts/SidebarContext';

function MainLayout() {
  const { sidebarOpen, sidebarVisible } = useSidebar();
  const location = useLocation();

  // Ocultar footer en páginas de búsqueda (porque tienen su propio layout full-screen)
  const hideFooter = location.pathname === '/search' || location.pathname.startsWith('/search?');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
