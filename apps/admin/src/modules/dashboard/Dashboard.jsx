import { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Eye,
  Link as LinkIcon,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Home
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api.config';
import api from '../../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    newPropertiesThisMonth: 0,
    growthUsers: 0,
    growthProperties: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, propertiesRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.STATS),
        api.get(API_ENDPOINTS.ADMIN.USERS_RECENT + '?limit=5'),
        api.get('/properties?limit=5&sort=createdAt:desc')
      ]);

      setStats(statsRes.data?.data || stats);
      setRecentUsers(usersRes.data?.data?.users || []);
      setRecentProperties(propertiesRes.data?.properties || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mb-2">
        {loading ? (
          <span className="inline-block w-20 h-8 bg-gray-200 animate-pulse rounded"></span>
        ) : (
          value
        )}
      </p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#2F509F] to-[#1e3a7a] rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta! 👋</h1>
        <p className="text-blue-100">
          Aquí está el resumen de tu plataforma. Todo funcionando perfectamente.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Usuarios"
          value={stats.totalUsers?.toLocaleString()}
          subtitle={`+${stats.newUsersThisMonth || 0} este mes`}
          trend={stats.growthUsers}
          color="text-[#2F509F]"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={Home}
          title="Propiedades Activas"
          value={stats.totalProperties?.toLocaleString()}
          subtitle={`+${stats.newPropertiesThisMonth || 0} este mes`}
          trend={stats.growthProperties}
          color="text-[#FFB547]"
          bgColor="bg-orange-50"
        />
        <StatCard
          icon={Calendar}
          title="Reservas Totales"
          value={stats.totalBookings?.toLocaleString()}
          subtitle="Todas las reservas"
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={DollarSign}
          title="Ingresos"
          value={`S/. ${(stats.totalRevenue || 0).toLocaleString()}`}
          subtitle="Total acumulado"
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2F509F]">Usuarios Recientes</h2>
            <a href="/users" className="text-sm text-[#FFB547] hover:text-[#2F509F] font-medium transition-colors">
              Ver todos →
            </a>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length > 0 ? (
              <>
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2F509F] to-[#1e3a7a] flex items-center justify-center text-white font-semibold text-lg">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-[#2F509F] cursor-pointer transition-colors" />
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay usuarios recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2F509F]">Propiedades Recientes</h2>
            <a href="/properties" className="text-sm text-[#FFB547] hover:text-[#2F509F] font-medium transition-colors">
              Ver todas →
            </a>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentProperties.length > 0 ? (
              <>
                {recentProperties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FFB547] to-[#ff9500] flex items-center justify-center text-white">
                        <Home className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{property.title || 'Sin título'}</p>
                        <p className="text-sm text-gray-500">
                          {property.city || 'Sin ubicación'}, {property.country || 'Perú'}
                        </p>
                      </div>
                    </div>
                    <LinkIcon className="w-5 h-5 text-gray-400 group-hover:text-[#FFB547] cursor-pointer transition-colors" />
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay propiedades recientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
