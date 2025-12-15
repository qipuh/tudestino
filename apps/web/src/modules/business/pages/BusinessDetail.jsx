import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useBusiness from '../hooks/useBusiness';

const businessTypeIcons = {
  hotel: '🏨',
  restaurant: '🍽️',
  entertainment: '🎭',
  events: '🎉',
  tours: '🗺️',
  transport: '🚗',
  spa: '💆',
  other: '🏢',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending_verification: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-600',
};

const statusLabels = {
  active: 'Activo',
  pending_verification: 'Verificación pendiente',
  draft: 'Borrador',
  suspended: 'Suspendido',
  inactive: 'Inactivo',
};

function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { business, loading, error, fetchBusiness, deleteBusiness } = useBusiness();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadBusiness();
    }
  }, [id]);

  const loadBusiness = async () => {
    await fetchBusiness(id);
  };

  const handleDelete = async () => {
    const result = await deleteBusiness(id);
    if (result.success) {
      navigate('/business/dashboard');
    }
  };

  if (loading && !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando negocio...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar negocio</h2>
          <p className="text-gray-600 mb-6">{error || 'Negocio no encontrado'}</p>
          <Link
            to="/business/dashboard"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/business/dashboard" className="text-primary hover:text-primary-dark">
            ← Volver al dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                {businessTypeIcons[business.businessType] || businessTypeIcons.other}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-gray-600 mt-1">{business.description}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[business.status]}`}>
              {statusLabels[business.status]}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              to={`/business/${business.id}/edit`}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
            >
              Editar Información
            </Link>
            <Link
              to={`/business/${business.id}/services`}
              className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-gray-50 font-medium"
            >
              Gestionar Servicios
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium"
            >
              Eliminar Negocio
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-gray-900">
              {business.servicesCount || 0}
            </div>
            <div className="text-sm text-gray-600">Servicios</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-blue-600">
              {business.followersCount || 0}
            </div>
            <div className="text-sm text-gray-600">Seguidores</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">📱</div>
            <div className="text-2xl font-bold text-purple-600">
              {business.postsCount || 0}
            </div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-yellow-600">
              {business.averageRating?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Rating promedio</div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Información de Contacto</h2>
            <div className="space-y-3">
              {business.contactPhone && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <div className="text-sm text-gray-600">Teléfono</div>
                    <div className="font-medium">{business.contactPhone}</div>
                  </div>
                </div>
              )}
              {business.contactEmail && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{business.contactEmail}</div>
                  </div>
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="text-sm text-gray-600">Sitio Web</div>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:text-primary-dark"
                    >
                      {business.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Ubicación</h2>
            {business.address && (
              <div className="space-y-2">
                {business.address.street && (
                  <p className="text-gray-700">{business.address.street}</p>
                )}
                <p className="text-gray-700">
                  {business.address.city}
                  {business.address.state && `, ${business.address.state}`}
                </p>
                <p className="text-gray-700">{business.address.country || 'Perú'}</p>
                {business.address.zipCode && (
                  <p className="text-gray-600 text-sm">CP: {business.address.zipCode}</p>
                )}
                {business.address.latitude && business.address.longitude && (
                  <p className="text-gray-600 text-sm">
                    📍 {business.address.latitude}, {business.address.longitude}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Social Media */}
          {business.socialMedia && Object.values(business.socialMedia).some(v => v) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Redes Sociales</h2>
              <div className="space-y-3">
                {business.socialMedia.facebook && (
                  <a
                    href={business.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-primary"
                  >
                    <span className="text-2xl">📘</span>
                    <span>Facebook</span>
                  </a>
                )}
                {business.socialMedia.instagram && (
                  <a
                    href={business.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-primary"
                  >
                    <span className="text-2xl">📷</span>
                    <span>Instagram</span>
                  </a>
                )}
                {business.socialMedia.twitter && (
                  <a
                    href={business.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-primary"
                  >
                    <span className="text-2xl">🐦</span>
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Información Adicional</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Slug:</span>
                <span className="font-medium">{business.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{business.businessType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado de verificación:</span>
                <span className="font-medium">{business.verificationStatus || 'unverified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Creado:</span>
                <span className="font-medium">
                  {new Date(business.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to={`/business/${business.id}/services`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">📦</span>
              <div>
                <div className="font-medium">Gestionar Servicios</div>
                <div className="text-sm text-gray-600">Añadir o editar servicios</div>
              </div>
            </Link>
            <Link
              to={`/business/${business.id}/posts`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">📱</span>
              <div>
                <div className="font-medium">Posts Sociales</div>
                <div className="text-sm text-gray-600">Publicar contenido</div>
              </div>
            </Link>
            <Link
              to={`/business/${business.id}/stats`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition"
            >
              <span className="text-3xl">📊</span>
              <div>
                <div className="font-medium">Estadísticas</div>
                <div className="text-sm text-gray-600">Ver métricas</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">¿Eliminar negocio?</h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Se eliminarán todos los servicios, posts y datos asociados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessDetail;
