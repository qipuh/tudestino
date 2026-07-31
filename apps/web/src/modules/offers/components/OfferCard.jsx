import React from 'react';
import { Tag, Trash2, Edit, Copy } from 'lucide-react';

export default function OfferCard({ offer, onEdit, onDelete, onCopyCode }) {
  const discountDisplay = offer.discountType === 'percentage'
    ? `${offer.discountValue}%`
    : `${offer.discountValue}`;

  const isActive = new Date(offer.validUntil) > new Date() && offer.isActive;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(offer.code);
    onCopyCode?.();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{offer.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
              {offer.code}
            </code>
            <button
              onClick={handleCopyCode}
              className="p-1 hover:bg-gray-100 rounded"
              title="Copiar código"
            >
              <Copy size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {isActive ? 'Activa' : 'Vencida'}
        </span>
      </div>

      {offer.description && (
        <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded">
        <div>
          <div className="text-sm text-gray-600">Descuento</div>
          <div className="text-xl font-bold text-blue-600">
            {discountDisplay}{offer.discountType === 'percentage' ? '%' : ' S/'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Usos</div>
          <div className="text-xl font-bold">{offer.usedCount}/{offer.maxUses || '∞'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Válida hasta</div>
          <div className="text-sm font-medium">
            {new Date(offer.validUntil).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(offer.id)}
          className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-2"
        >
          <Edit size={16} />
          Editar
        </button>
        <button
          onClick={() => {
            if (window.confirm('¿Eliminar oferta?')) {
              onDelete(offer.id);
            }
          }}
          className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          Eliminar
        </button>
      </div>
    </div>
  );
}
