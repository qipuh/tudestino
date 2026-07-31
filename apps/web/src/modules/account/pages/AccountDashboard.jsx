import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Calendar, Ticket, MessageSquare, Heart, TrendingUp, Users, Star
} from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import UserAccountLayout from '../../../layouts/UserAccountLayout';
import api from '../../../services/api';
import useBusiness from '../../business/hooks/useBusiness';
import { useSidebar } from '../../../contexts/SidebarContext';

function AccountDashboard() {
  const { user } = useAuthStore();
  const { businesses, fetchMyBusinesses } = useBusiness();
  const { setSidebarVisible } = useSidebar();
  const [stats, setStats] = useState({
    bookings: 0,
    businesses: 0,
    events: 0,
    messages: 0,
    favorites: 0
  });
  const [loading, setLoading] = useState(true);

  // Disable sidebar on account page
  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar negocios
      await fetchMyBusinesses();

      // Cargar estadísticas de reservas
      try {
        const bookingsRes = await api.get('/bookings/my-bookings');
        setStats(prev => ({
          ...prev,
          bookings: bookingsRes.data?.length || 0
        }));
      } catch (error) {
        console.error('Error loading bookings:', error);
      }

      // Cargar eventos organizados (solo business_owner/admin)
      if (user?.role === 'business_owner' || user?.role === 'admin') {
        try {
          const eventsRes = await api.get('/events/organizer/my-events');
          setStats(prev => ({
            ...prev,
            events: eventsRes.data?.length || 0
          }));
        } catch (error) {
          console.error('Error loading events:', error);
        }
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businesses) {
      setStats(prev => ({
        ...prev,
        businesses: businesses.length
      }));
    }
  }, [businesses]);

  if (loading) {
    return (
      <UserAccountLayout activeMenu="account">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </UserAccountLayout>
    );
  }

  return (
    <UserAccountLayout activeMenu="account">
      <div>
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">¡Hola, {user.name}!</h1>
          <p className="text-gray-600 mt-1">Bienvenido a tu panel de control</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(user?.role === 'business_owner' || user?.role === 'admin') && (
            <Link
              to="/account/businesses"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                  <Briefcase className="text-blue-600" size={24} />
                </div>
                <TrendingUp className="text-gray-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.businesses}</div>
              <div className="text-sm text-gray-600">Negocios</div>
            </Link>
          )}

          <Link
            to="/bookings"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                <Calendar className="text-green-600" size={24} />
              </div>
              <TrendingUp className="text-gray-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.bookings}</div>
            <div className="text-sm text-gray-600">Reservas</div>
          </Link>

          {(user?.role === 'business_owner' || user?.role === 'admin') && (
            <Link
              to="/account/events"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                  <Ticket className="text-purple-600" size={24} />
                </div>
                <TrendingUp className="text-gray-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.events}</div>
              <div className="text-sm text-gray-600">Eventos</div>
            </Link>
          )}

          <Link
            to="/messages"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition">
                <MessageSquare className="text-orange-600" size={24} />
              </div>
              <TrendingUp className="text-gray-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.messages}</div>
            <div className="text-sm text-gray-600">Mensajes</div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Negocios - solo para business_owner/admin */}
          {(user?.role === 'business_owner' || user?.role === 'admin') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Mis Negocios</h2>
                <Link to="/account/businesses" className="text-primary hover:text-primary-dark text-sm font-medium">
                  Ver todos →
                </Link>
              </div>
              {businesses && businesses.length > 0 ? (
                <div className="space-y-3">
                  {businesses.slice(0, 3).map((business) => (
                    <Link
                      key={business.id}
                      to={`/business/${business.id}/manage`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Briefcase className="text-primary" size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{business.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{business.businessType}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto text-gray-300 mb-2" size={48} />
                  <p className="text-gray-500 text-sm mb-3">No tienes negocios</p>
                  <Link
                    to="/business/create"
                    className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm"
                  >
                    Crear Negocio
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Actividad Reciente */}
          <div className={`bg-white rounded-lg shadow-md p-6 ${(user?.role === 'business_owner' || user?.role === 'admin') ? '' : 'lg:col-span-2'}`}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="text-center py-8">
              <Users className="mx-auto text-gray-300 mb-2" size={48} />
              <p className="text-gray-500 text-sm">No hay actividad reciente</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-primary rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">¿Qué quieres hacer hoy?</h3>
          <p className="text-white/90 mb-4">Accede rápidamente a las funciones más utilizadas</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(user?.role === 'business_owner' || user?.role === 'admin') && (
              <Link
                to="/account/businesses"
                className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition"
              >
                <Briefcase className="mx-auto mb-2" size={24} />
                <div className="text-sm font-medium">Mis Negocios</div>
              </Link>
            )}
            <Link
              to="/bookings"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition"
            >
              <Calendar className="mx-auto mb-2" size={24} />
              <div className="text-sm font-medium">Reservas</div>
            </Link>
            <Link
              to="/messages"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition"
            >
              <MessageSquare className="mx-auto mb-2" size={24} />
              <div className="text-sm font-medium">Mensajes</div>
            </Link>
            <Link
              to="/account/profile"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition"
            >
              <Users className="mx-auto mb-2" size={24} />
              <div className="text-sm font-medium">Mi Perfil</div>
            </Link>
          </div>
        </div>
      </div>
    </UserAccountLayout>
  );
}

export default AccountDashboard;
