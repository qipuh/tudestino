import { Check, Users, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function TicketSelector({ tickets, onSelectTicket }) {
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleSelectTicket = (ticket) => {
    setSelectedTicketId(ticket.id);
    setQuantity(1);
  };

  const handleQuantityChange = (delta) => {
    const selectedTicket = tickets.find(t => t.id === selectedTicketId);
    if (!selectedTicket) return;

    const newQuantity = Math.max(
      selectedTicket.minQuantityPerOrder || 1,
      Math.min(
        quantity + delta,
        selectedTicket.maxQuantityPerOrder || 10,
        getAvailableQuantity(selectedTicket)
      )
    );

    setQuantity(newQuantity);
  };

  const handleContinue = () => {
    const selectedTicket = tickets.find(t => t.id === selectedTicketId);
    if (selectedTicket && onSelectTicket) {
      onSelectTicket(selectedTicket, quantity);
    }
  };

  const getAvailableQuantity = (ticket) => {
    if (!ticket.totalQuantity) return 999; // Ilimitado
    return ticket.totalQuantity - ticket.soldQuantity - ticket.reservedQuantity;
  };

  const isTicketAvailable = (ticket) => {
    if (ticket.status !== 'active') return false;

    const now = new Date();

    // Verificar fecha de inicio de ventas
    if (ticket.salesStartDate && new Date(ticket.salesStartDate) > now) {
      return false;
    }

    // Verificar fecha de fin de ventas
    if (ticket.salesEndDate && new Date(ticket.salesEndDate) < now) {
      return false;
    }

    // Verificar disponibilidad
    if (ticket.totalQuantity) {
      const available = getAvailableQuantity(ticket);
      if (available <= 0) return false;
    }

    return true;
  };

  const getTicketStatusMessage = (ticket) => {
    if (ticket.status === 'sold_out') return 'Agotado';
    if (ticket.status === 'paused') return 'Pausado';
    if (ticket.status === 'inactive') return 'No disponible';

    const now = new Date();

    if (ticket.salesStartDate && new Date(ticket.salesStartDate) > now) {
      return `Disponible desde ${format(new Date(ticket.salesStartDate), "d 'de' MMMM", { locale: es })}`;
    }

    if (ticket.salesEndDate && new Date(ticket.salesEndDate) < now) {
      return 'Ventas cerradas';
    }

    if (ticket.totalQuantity) {
      const available = getAvailableQuantity(ticket);
      if (available <= 0) return 'Agotado';
      if (available <= 10) return `Solo quedan ${available} disponibles`;
    }

    return null;
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;

  return (
    <div className="space-y-6">
      {/* Lista de tickets */}
      <div className="space-y-3">
        {tickets.map((ticket) => {
          const isAvailable = isTicketAvailable(ticket);
          const statusMessage = getTicketStatusMessage(ticket);
          const isSelected = selectedTicketId === ticket.id;

          return (
            <div
              key={ticket.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : isAvailable
                  ? 'border-gray-200 hover:border-primary/50 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
              onClick={() => isAvailable && handleSelectTicket(ticket)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg text-gray-900">
                      {ticket.name}
                    </h4>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </div>

                  {ticket.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {ticket.description}
                    </p>
                  )}

                  {/* Incluye */}
                  {ticket.includes && ticket.includes.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Incluye:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {ticket.includes.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Restricciones */}
                  {ticket.restrictions && ticket.restrictions.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Restricciones:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {ticket.restrictions.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle size={12} className="text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Estado */}
                  {statusMessage && (
                    <div className="flex items-center gap-2 text-sm">
                      {isAvailable ? (
                        <span className="text-orange-600 font-medium">{statusMessage}</span>
                      ) : (
                        <span className="text-red-600 font-medium">{statusMessage}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Precio */}
                <div className="text-right ml-4">
                  {ticket.isFree ? (
                    <div className="text-2xl font-bold text-green-600">
                      Gratis
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-900">
                        S/ {parseFloat(ticket.price).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        por entrada
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selector de cantidad y total */}
      {selectedTicket && (
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-primary">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Cantidad de entradas</p>
              <p className="text-xs text-gray-500">
                {selectedTicket.minQuantityPerOrder && `Mínimo: ${selectedTicket.minQuantityPerOrder}`}
                {selectedTicket.maxQuantityPerOrder && ` • Máximo: ${selectedTicket.maxQuantityPerOrder}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= (selectedTicket.minQuantityPerOrder || 1)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="text-xl font-bold w-12 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={
                  quantity >= (selectedTicket.maxQuantityPerOrder || 10) ||
                  quantity >= getAvailableQuantity(selectedTicket)
                }
                className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-300">
            <div>
              <p className="text-sm text-gray-600">Total a pagar</p>
              <p className="text-xs text-gray-500">{quantity} entrada(s)</p>
            </div>
            <div className="text-3xl font-bold text-primary">
              {selectedTicket.isFree ? 'Gratis' : `S/ ${totalPrice.toFixed(2)}`}
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full mt-4 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
          >
            Continuar con la inscripción
          </button>
        </div>
      )}

      {/* No hay tickets */}
      {tickets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay entradas disponibles en este momento.</p>
        </div>
      )}
    </div>
  );
}

export default TicketSelector;
