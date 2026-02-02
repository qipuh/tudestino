import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  Package,
  Eye,
  TrendingUp
} from 'lucide-react';
import api from '../../../services/api';
import StatsCard from '../components/StatsCard';
import ReservationList from '../components/ReservationList';
import ActivityFeed from '../components/ActivityFeed';
import BusinessLayout from '../components/BusinessLayout';
import { useSidebar } from '../../../contexts/SidebarContext';

function BusinessManagementDashboard() {
  const { id } = useParams();
  const { setSidebarVisible } = useSidebar();
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

  // Disable sidebar on this page
  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

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
    <BusinessLayout activeMenu="manage">
      <div>
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
    </BusinessLayout>
  );
}

export default BusinessManagementDashboard;
