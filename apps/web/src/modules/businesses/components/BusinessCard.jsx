import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone } from 'lucide-react';

export default function BusinessCard({ business, onDelete }) {
  const handleDelete = async () => {
    if (window.confirm('¿Eliminar este negocio?')) {
      await onDelete(business.id);
    }
  };

  const address = typeof business.address === 'string' ? JSON.parse(business.address) : business.address;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      {business.coverImage && (
        <img
          src={business.coverImage}
          alt={business.name}
          className="w-full h-40 object-cover rounded mb-4"
        />
      )}

      <h3 className="text-lg font-semibold mb-2">{business.name}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{business.description}</p>

      {/* Ubicación */}
      {address?.city && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <MapPin size={16} />
          <span>{address.city}, {address.country}</span>
        </div>
      )}

      {/* Rating */}
      {business.ratingAverage > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(business.ratingAverage) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({business.reviewCount})</span>
        </div>
      )}

      {/* Tipo */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
          {business.businessType}
        </span>
        <span className={`px-2 py-1 text-xs rounded font-medium ${
          business.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {business.status}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <Link
          to={`/businesses/${business.id}`}
          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 text-center"
        >
          Ver detalle
        </Link>
        <Link
          to={`/businesses/${business.id}/edit`}
          className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 text-center"
        >
          Editar
        </Link>
        <button
          onClick={handleDelete}
          className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
