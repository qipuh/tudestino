import React, { useState, useEffect } from 'react';
import { BarChart3, Users, ShoppingCart, DollarSign, AlertCircle, Loader } from 'lucide-react';
import adminService from '../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, businessesData, paymentsData] = await Promise.all([
        adminService.getStats(),
        adminService.getBusinessesForVerification({ status: 'pending', limit: 5 }),
        adminService.getPayments({ limit: 10 })
      ]);

      setStats(statsData);
      setPendingBusinesses(Array.isArray(businessesData) ? businessesData : (businessesData.data || []));
      setRecentPayments(Array.isArray(paymentsData) ? paymentsData : (paymentsData.data || []));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Negocios</p>
                  <p className="text-3xl font-bold">{stats.totalBusinesses || 0}</p>
                </div>
                <ShoppingCart size={32} className="text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Usuarios Activos</p>
                  <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
                </div>
                <Users size={32} className="text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pagos Totales</p>
                  <p className="text-3xl font-bold">S/ {(stats.totalPayments || 0).toFixed(2)}</p>
                </div>
                <DollarSign size={32} className="text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Comisión Recolectada</p>
                  <p className="text-3xl font-bold">S/ {(stats.totalCommission || 0).toFixed(2)}</p>
                </div>
                <BarChart3 size={32} className="text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Pending Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Negocios Pendientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={24} className="text-orange-500" />
              <h2 className="text-xl font-bold">Negocios Pendientes ({pendingBusinesses.length})</h2>
            </div>

            {pendingBusinesses.length === 0 ? (
              <p className="text-gray-500">No hay negocios pendientes de verificación</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingBusinesses.map(business => (
                  <div key={business.id} className="border border-gray-200 rounded p-4 hover:shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{business.name}</h3>
                        <p className="text-sm text-gray-600">{business.businessType}</p>
                      </div>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                        Pendiente
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{business.description?.substring(0, 100)}...</p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                        Aprobar
                      </button>
                      <button className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagos Recientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={24} className="text-green-500" />
              <h2 className="text-xl font-bold">Pagos Recientes</h2>
            </div>

            {recentPayments.length === 0 ? (
              <p className="text-gray-500">No hay pagos recientes</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentPayments.map(payment => (
                  <div key={payment.id} className="border border-gray-200 rounded p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">
                        Reserva: {payment.reservationId?.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">S/ {payment.grossAmount?.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        payment.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium">
              Ver Todos Negocios
            </button>
            <button className="px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600 font-medium">
              Ver Todos Pagos
            </button>
            <button className="px-4 py-3 bg-purple-500 text-white rounded hover:bg-purple-600 font-medium">
              Procesar Payouts
            </button>
            <button className="px-4 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium">
              Gestionar Usuarios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
