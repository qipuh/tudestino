import { useEffect } from 'react';
import UserAccountLayout from '../../../layouts/UserAccountLayout';
import { Heart, MapPin, Star } from 'lucide-react';
import { useSidebar } from '../../../contexts/SidebarContext';

function AccountFavorites() {
  const { setSidebarVisible } = useSidebar();

  // Disable sidebar on this page
  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  return (
    <UserAccountLayout activeMenu="favorites">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Favoritos</h1>
          <p className="text-gray-600 mt-1">
            Guarda tus lugares y experiencias favoritas para visitarlas más tarde
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button className="pb-3 px-1 border-b-2 border-primary text-primary font-medium">
              Alojamientos
            </button>
            <button className="pb-3 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
              Experiencias
            </button>
            <button className="pb-3 px-1 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
              Restaurantes
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-red-600" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes favoritos guardados
            </h3>
            <p className="text-gray-600 mb-6">
              Guarda tus lugares favoritos para encontrarlos fácilmente más tarde.
              Solo haz clic en el ícono de corazón cuando veas algo que te guste.
            </p>
            <a
              href="/search"
              className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Explorar Destinos
            </a>
          </div>
        </div>
      </div>
    </UserAccountLayout>
  );
}

export default AccountFavorites;
