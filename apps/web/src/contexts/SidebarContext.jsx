import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  // Desktop (>= 768px): iniciar abierto, Mobile (< 768px): iniciar cerrado
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });
  const [sidebarVisible, setSidebarVisible] = useState(true); // Controls if sidebar is rendered - changed to true by default

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      sidebarVisible,
      setSidebarVisible
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
