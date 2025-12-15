const serviceTypeIcons = {
  property: '🏠',
  restaurant: '🍽️',
  entertainment: '🎭',
  events: '🎉',
  tours: '🗺️',
  transport: '🚗',
  spa: '💆',
  other: '📦',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-800',
  inactive: 'bg-gray-100 text-gray-600',
  under_maintenance: 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  active: 'Activo',
  draft: 'Borrador',
  inactive: 'Inactivo',
  under_maintenance: 'En mantenimiento',
};

function ServiceCard({ service, onEdit, onDelete }) {
  return (
    <div className="border rounded-lg p-5 hover:shadow-md transition bg-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">
          {serviceTypeIcons[service.serviceType] || serviceTypeIcons.other}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[service.status]}`}>
          {statusLabels[service.status]}
        </span>
      </div>

      <h4 className="text-lg font-bold mb-2">{service.name}</h4>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {service.description || 'Sin descripción'}
      </p>

      <div className="text-xs text-gray-500 mb-4">
        Tipo: <span className="font-medium">{service.serviceType}</span>
      </div>

      {service.settings && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
          <div className="font-medium mb-1">Configuración:</div>
          {service.serviceType === 'property' ? (
            <div className="text-sm text-gray-700 space-y-1">
              {service.settings.roomName && (
                <div>Habitación: <span className="font-medium">{service.settings.roomName}</span></div>
              )}
              {service.settings.bedType && (
                <div>Cama: <span className="font-medium">{service.settings.bedType}</span></div>
              )}
              {service.settings.bedCount !== undefined && (
                <div>Cantidad de camas: <span className="font-medium">{service.settings.bedCount}</span></div>
              )}
              {service.settings.occupancy !== undefined && (
                <div>Ocupación máxima: <span className="font-medium">{service.settings.occupancy}</span></div>
              )}
              <div className="flex flex-wrap gap-2 mt-1">
                {(service.settings.amenities || []).map((a) => (
                  <span key={a} className="text-xs bg-white border px-2 py-1 rounded">{a}</span>
                ))}
              </div>
            </div>
          ) : (
            <pre className="text-gray-600 overflow-x-auto text-xs">
              {JSON.stringify(service.settings, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(service)}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition text-sm font-medium"
          >
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(service.id)}
            className="flex-1 border border-red-500 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition text-sm font-medium"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

export default ServiceCard;
