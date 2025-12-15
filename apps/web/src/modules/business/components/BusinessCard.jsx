import { Link } from 'react-router-dom';

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

function BusinessCard({ business, onDelete }) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition bg-white">
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">
          {businessTypeIcons[business.businessType] || businessTypeIcons.other}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[business.status]}`}>
          {statusLabels[business.status]}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-2">{business.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {business.description || 'Sin descripción'}
      </p>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        {business.address?.city && (
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{business.address.city}, {business.address.country || 'Perú'}</span>
          </div>
        )}
        {business.contactPhone && (
          <div className="flex items-center gap-2">
            <span>📞</span>
            <span>{business.contactPhone}</span>
          </div>
        )}
        {business.followersCount !== undefined && (
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>{business.followersCount} seguidores</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          to={`/business/${business.id}`}
          className="flex-1 text-center bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition font-medium"
        >
          Ver Detalle
        </Link>
        <Link
          to={`/business/${business.id}/services`}
          className="flex-1 text-center border border-primary text-primary py-2 px-4 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Servicios
        </Link>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(business.id)}
          className="w-full mt-2 text-red-600 hover:text-red-800 text-sm font-medium py-2"
        >
          Eliminar negocio
        </button>
      )}
    </div>
  );
}

export default BusinessCard;
