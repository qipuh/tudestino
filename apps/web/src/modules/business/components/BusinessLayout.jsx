import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Settings
} from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';

function BusinessLayout({ children, activeMenu }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
  }, [id]);

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

  const menuItems = [
    { to: `/business/${id}/manage`, label: 'Panel', icon: BarChart3, color: 'text-primary', key: 'manage' },
    { to: `/business/${id}/edit`, label: 'Editar Negocio', icon: Edit, color: 'text-primary', key: 'edit' },
    {
      to: `/business/${id}/services`,
      label: business.businessType === 'property' ? 'Habitaciones' : 'Servicios',
      icon: business.businessType === 'property' ? Home : Package,
      color: 'text-blue-600',
      key: 'services'
    },
    { to: `/business/${id}/reservations`, label: 'Reservas', icon: Calendar, color: 'text-green-600', key: 'reservations' },
    { to: `/business/${id}/posts`, label: 'Posts', icon: MessageSquare, color: 'text-purple-600', key: 'posts' },
    { to: `/business/${id}/analytics`, label: 'Estadísticas', icon: BarChart3, color: 'text-orange-600', key: 'analytics' },
    { to: `/business/${id}/settings`, label: 'Configuración', icon: Settings, color: 'text-gray-600', key: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header con información del negocio */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/business/dashboard')}
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

      {/* Menú de navegación */}
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
                  <Icon size={18} className={item.color} />
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

export default BusinessLayout;
