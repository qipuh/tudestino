import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  Home,
  Edit,
  Settings,
  Eye,
  MessageSquare,
  TrendingUp,
  Package,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';
import StatsCard from '../components/StatsCard';
import QuickActionCard from '../components/QuickActionCard';
import ReservationList from '../components/ReservationList';
import ActivityFeed from '../components/ActivityFeed';

function BusinessManagementDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    reservations: 0,
    revenue: 0,
    followers: 0,
    rating: 0,
    rooms: 0,
    visits: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadBusinessData();
  }, [id]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);

      // Cargar datos del negocio
      const businessResponse = await api.get(`/businesses/${id}`);
      setBusiness(businessResponse.data);

      // Cargar estadísticas
      await loadStats();

      // Cargar reservas recientes
      await loadRecentReservations();

      // Cargar actividad reciente
      await loadRecentActivity();

    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Intentar cargar estadísticas reales
      const [propertyRes, reviewsRes] = await Promise.allSettled([
        api.get(`/businesses/${id}/properties`),
        api.get(`/businesses/${id}/reviews`)
      ]);

      const rooms = propertyRes.status === 'fulfilled' ? propertyRes.value.data?.rooms?.length || 0 : 0;
      const reviews = reviewsRes.status === 'fulfilled' ? reviewsRes.value.data : [];
      const avgRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

      setStats(prev => ({
        ...prev,
        rooms,
        rating: avgRating.toFixed(1),
        followers: reviews.length
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentReservations = async () => {
    try {
      // Intentar cargar reservas reales del negocio
      const response = await api.get(`/businesses/${id}/reservations`);
      setRecentReservations(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading reservations:', error);
      setRecentReservations([]);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Generar actividad reciente basada en datos reales
      const activities = [];

      if (business?.updatedAt) {
        activities.push({
          id: 'update-business',
          type: 'edit',
          description: 'Información del negocio actualizada',
          createdAt: business.updatedAt
        });
      }

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading activity:', error);
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
                  {stats.rating || 'N/A'}
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

      {/* Menú de acciones rápidas */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2">
            <Link
              to={`/business/${id}/edit`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition whitespace-nowrap"
            >
              <Edit size={18} className="text-primary" />
              <span className="text-sm font-medium text-gray-700">Editar Negocio</span>
            </Link>
            <Link
              to={`/business/${id}/services`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition whitespace-nowrap"
            >
              {business.businessType === 'property' ? <Home size={18} className="text-blue-600" /> : <Package size={18} className="text-blue-600" />}
              <span className="text-sm font-medium text-gray-700">
                {business.businessType === 'property' ? 'Habitaciones' : 'Servicios'}
              </span>
            </Link>
            <Link
              to={`/business/${id}/reservations`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition whitespace-nowrap"
            >
              <Calendar size={18} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Reservas</span>
            </Link>
            <Link
              to={`/business/${id}/posts`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition whitespace-nowrap"
            >
              <MessageSquare size={18} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Posts</span>
            </Link>
            <Link
              to={`/business/${id}/analytics`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition whitespace-nowrap"
            >
              <BarChart3 size={18} className="text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Estadísticas</span>
            </Link>
            <Link
              to={`/business/${id}/settings`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition whitespace-nowrap"
            >
              <Settings size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Configuración</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatsCard
            icon={Calendar}
            label="Reservas"
            value={stats.reservations}
            trend={0}
            color="primary"
          />
          <StatsCard
            icon={DollarSign}
            label="Ingresos"
            value={`S/ ${stats.revenue.toFixed(2)}`}
            trend={0}
            color="green"
          />
          <StatsCard
            icon={Users}
            label="Seguidores"
            value={stats.followers}
            color="blue"
          />
          <StatsCard
            icon={Star}
            label="Calificación"
            value={stats.rating}
            color="yellow"
          />
          <StatsCard
            icon={Package}
            label={business.businessType === 'property' ? 'Habitaciones' : 'Servicios'}
            value={stats.rooms}
            color="purple"
          />
          <StatsCard
            icon={Eye}
            label="Visitas"
            value={stats.visits}
            color="orange"
          />
        </div>

        {/* Contenido principal en dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Reservas y gráficos */}
          <div className="lg:col-span-2 space-y-6">
            <ReservationList
              reservations={recentReservations}
              title="Próximas Reservas"
            />

            {/* Placeholder para gráfico de tendencias */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Tendencia de Reservas</h3>
                <TrendingUp className="text-primary" size={24} />
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-400">Gráfico de tendencias próximamente</p>
              </div>
            </div>
          </div>

          {/* Columna derecha - Actividad */}
          <div className="space-y-6">
            <ActivityFeed
              activities={recentActivity}
              title="Actividad Reciente"
            />

            {/* Alertas/Notificaciones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Alertas</h3>
              <p className="text-gray-500 text-sm text-center py-4">
                No hay alertas pendientes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessManagementDashboard;
