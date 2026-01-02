import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useBusiness from '../../business/hooks/useBusiness';
import BusinessCard from '../../business/components/BusinessCard';
import UserAccountLayout from '../../../layouts/UserAccountLayout';

function AccountBusinesses() {
  const { businesses, loading, error, fetchMyBusinesses, deleteBusiness } = useBusiness();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    await fetchMyBusinesses();
  };

  const handleDelete = async (businessId) => {
    if (deleteConfirm !== businessId) {
      setDeleteConfirm(businessId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    const result = await deleteBusiness(businessId);
    if (result.success) {
      loadBusinesses();
      setDeleteConfirm(null);
    }
  };

  if (loading && businesses.length === 0) {
    return (
      <UserAccountLayout activeMenu="businesses">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando negocios...</p>
          </div>
        </div>
      </UserAccountLayout>
    );
  }

  return (
    <UserAccountLayout activeMenu="businesses">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Negocios</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus negocios y servicios desde aquí
            </p>
          </div>
          <Link
            to="/business/create"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Crear Negocio</span>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && businesses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              No tienes negocios registrados
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Crea tu primer negocio para empezar a ofrecer servicios y gestionar reservas
            </p>
            <Link
              to="/business/create"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Crear Mi Primer Negocio
            </Link>
          </div>
        )}

        {/* Business Grid */}
        {businesses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onDelete={deleteConfirm === business.id ? handleDelete : () => setDeleteConfirm(business.id)}
                />
              ))}
            </div>

            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">🏢</div>
                <div className="text-2xl font-bold text-gray-900">
                  {businesses.length}
                </div>
                <div className="text-sm text-gray-600">
                  {businesses.length === 1 ? 'Negocio' : 'Negocios'}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-green-600">
                  {businesses.filter(b => b.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Activos</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">⏳</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {businesses.filter(b => b.status === 'pending_verification').length}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-blue-600">
                  {businesses.reduce((sum, b) => sum + (b.followersCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Seguidores totales</div>
              </div>
            </div>
          </>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            💡 ¿Necesitas ayuda?
          </h3>
          <p className="text-blue-800 text-sm mb-4">
            Para cada negocio puedes agregar diferentes tipos de servicios: propiedades (habitaciones),
            restaurantes, eventos, entretenimiento, tours y más.
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/help/business" className="text-blue-600 hover:text-blue-800 font-medium">
              Ver guía →
            </Link>
            <Link to="/help/services" className="text-blue-600 hover:text-blue-800 font-medium">
              Tipos de servicios →
            </Link>
          </div>
        </div>
      </div>
    </UserAccountLayout>
  );
}

export default AccountBusinesses;
