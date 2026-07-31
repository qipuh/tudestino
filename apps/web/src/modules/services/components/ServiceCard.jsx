import React from 'react';
import { DollarSign, Trash2, Edit } from 'lucide-react';

export default function ServiceCard({ service, onEdit, onDelete }) {
  const typeLabels = {
    amenity: 'Amenidad',
    food_item: 'Plato',
    addon: 'Complemento',
    activity: 'Actividad',
    ticket_type: 'Entrada',
    other: 'Otro'
  };

  const handleDelete = () => {
    if (window.confirm('¿Eliminar este servicio?')) {
      onDelete(service.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block mt-1">
            {typeLabels[service.type] || service.type}
          </span>
        </div>
        <span className={`px-2 py-1 rounded text-sm font-medium ${
          service.status === 'active'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {service.status}
        </span>
      </div>

      {service.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
      )}

      {service.price !== null && (
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-gray-400" />
          <span className="font-semibold">{service.price.toFixed(2)}</span>
        </div>
      )}

      {service.settings && (
        <div className="bg-gray-50 rounded p-2 mb-4 text-xs text-gray-600 max-h-24 overflow-auto">
          <pre>{JSON.stringify(service.settings, null, 2)}</pre>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(service.id)}
          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-2"
        >
          <Edit size={16} />
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          Eliminar
        </button>
      </div>
    </div>
  );
}
