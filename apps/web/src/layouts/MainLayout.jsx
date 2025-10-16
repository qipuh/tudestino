import { Outlet } from 'react-router-dom';
import Header from '@components/Header';
import Footer from '@components/Footer';
import { useSidebar } from '../contexts/SidebarContext';

function MainLayout() {
  const { sidebarOpen, sidebarVisible } = useSidebar();

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
      <Footer />
    </div>
  );
}

export default MainLayout;
