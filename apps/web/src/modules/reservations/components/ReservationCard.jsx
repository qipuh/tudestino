import React from 'react';
import { Calendar, User, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReservationCard({ reservation, onStatusChange, onCancel }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700'
  };

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    refunded: 'bg-gray-100 text-gray-700',
    failed: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Reservación #{reservation.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-500">{new Date(reservation.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[reservation.status]}`}>
            {reservation.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[reservation.paymentStatus]}`}>
            {reservation.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Fecha */}
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-gray-400" />
          <div>
            <div className="text-sm text-gray-600">Fecha</div>
            <div className="font-medium">{new Date(reservation.reservationDate).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Personas */}
        <div className="flex items-center gap-3">
          <User size={20} className="text-gray-400" />
          <div>
            <div className="text-sm text-gray-600">Personas</div>
            <div className="font-medium">{reservation.numberOfPeople}</div>
          </div>
        </div>

        {/* Precio */}
        <div className="flex items-center gap-3">
          <DollarSign size={20} className="text-gray-400" />
          <div>
            <div className="text-sm text-gray-600">Total</div>
            <div className="font-medium">{reservation.currency} {reservation.totalPrice?.toFixed(2)}</div>
          </div>
        </div>

        {/* Tiempo */}
        {reservation.reservationTime && (
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-gray-400" />
            <div>
              <div className="text-sm text-gray-600">Hora</div>
              <div className="font-medium">{reservation.reservationTime}</div>
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      {reservation.metadata && (
        <div className="bg-gray-50 rounded p-3 mb-4 text-sm text-gray-600">
          {typeof reservation.metadata === 'string'
            ? reservation.metadata
            : JSON.stringify(reservation.metadata, null, 2)
          }
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2">
        {reservation.status === 'pending' && (
          <>
            <button
              onClick={() => onStatusChange(reservation.id, 'confirmed')}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Confirmar
            </button>
            <button
              onClick={() => onCancel(reservation.id)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Rechazar
            </button>
          </>
        )}
        {reservation.status === 'confirmed' && (
          <button
            onClick={() => onStatusChange(reservation.id, 'completed')}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Marcar Completa
          </button>
        )}
        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
          <button
            onClick={() => onCancel(reservation.id)}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
