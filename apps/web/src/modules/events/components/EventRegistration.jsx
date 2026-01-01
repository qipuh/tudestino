import { useState, useEffect } from 'react';
import { Check, Ticket, UserCheck, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

function EventRegistration({ eventId, eventData, tickets = [] }) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState({});
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  useEffect(() => {
    checkRegistration();
  }, [eventId, user]);

  const checkRegistration = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/user/registrations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const registrations = await response.json();
        const eventRegistration = registrations.find(r => r.eventId === eventId);
        if (eventRegistration) {
          setRegistered(true);
          setRegistrationData(eventRegistration);
        }
      }
    } catch (err) {
      console.error('Error checking registration:', err);
    }
  };

  const handleTicketQuantityChange = (ticketId, quantity) => {
    if (quantity <= 0) {
      const newSelected = { ...selectedTickets };
      delete newSelected[ticketId];
      setSelectedTickets(newSelected);
    } else {
      setSelectedTickets({
        ...selectedTickets,
        [ticketId]: quantity
      });
    }
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(selectedTickets).forEach(([ticketId, quantity]) => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        // Usar precio de fase activa si existe, de lo contrario precio base
        const activePhase = ticket.phases?.find(p => p.status === 'active');
        const currentPrice = activePhase ? parseFloat(activePhase.price) : parseFloat(ticket.price);
        total += currentPrice * quantity;
      }
    });
    return total;
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      // Guardar la selección y redirigir al login
      sessionStorage.setItem('pendingEventRegistration', JSON.stringify({
        eventId,
        eventData,
        selectedTickets,
        tickets: tickets.filter(t => selectedTickets[t.id])
      }));
      navigate('/login?redirect=/events/checkout');
      return;
    }

    if (Object.keys(selectedTickets).length === 0) {
      alert('Selecciona al menos un ticket');
      return;
    }

    // Preparar datos para el checkout
    const checkoutData = {
      eventId,
      eventData,
      selectedTickets,
      tickets: tickets.filter(t => selectedTickets[t.id]).map(ticket => {
        const activePhase = ticket.phases?.find(p => p.status === 'active');
        const currentPrice = activePhase ? parseFloat(activePhase.price) : parseFloat(ticket.price);

        return {
          ...ticket,
          quantity: selectedTickets[ticket.id],
          currentPrice,
          activePhase: activePhase ? {
            name: activePhase.name,
            price: activePhase.price
          } : null
        };
      }),
      total: calculateTotal()
    };

    // Guardar en sessionStorage y redirigir al checkout
    sessionStorage.setItem('pendingEventRegistration', JSON.stringify(checkoutData));
    navigate('/events/checkout');
  };

  if (registered) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-green-500 rounded-full">
            <UserCheck className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-green-900 text-sm">✅ Ya estás registrado</h3>
            <p className="text-xs text-green-700 mt-1">
              Confirmación enviada a tu email
            </p>
          </div>
        </div>

        {registrationData && registrationData.registrationCode && (
          <div className="mt-3 p-3 bg-white border border-green-300 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">🎫 Código de registro:</p>
            <p className="font-mono font-bold text-base text-gray-900">
              {registrationData.registrationCode}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Presenta este código el día del evento
            </p>
          </div>
        )}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <Ticket className="mx-auto text-gray-400 mb-3" size={40} />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Tickets no disponibles
        </p>
        <p className="text-xs text-gray-500">
          Los tickets aún no han sido publicados
        </p>
      </div>
    );
  }

  const total = calculateTotal();
  const hasSelection = Object.keys(selectedTickets).length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tickets disponibles</h3>

        <div className="space-y-2">
          {tickets.map((ticket) => {
            // Compatibilidad con nombres de campos del backend
            const totalQuantity = ticket.totalQuantity || ticket.quantity || 0;
            const soldQuantity = ticket.soldQuantity || ticket.sold || 0;
            const available = totalQuantity - soldQuantity;
            const isAvailable = available > 0 && ticket.status === 'active';
            const selectedQty = selectedTickets[ticket.id] || 0;

            // Obtener precio (puede venir de fase activa o del ticket base)
            const activePhase = ticket.phases?.find(p => p.status === 'active');
            const currentPrice = activePhase ? parseFloat(activePhase.price) : parseFloat(ticket.price);

            return (
              <div
                key={ticket.id}
                className={`border rounded-lg p-3 ${
                  isAvailable
                    ? 'border-gray-200 hover:border-primary transition bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  {/* Header con nombre y precio */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900">{ticket.name}</h4>
                      {ticket.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <span className="text-lg font-bold text-primary whitespace-nowrap">
                        S/ {currentPrice.toFixed(2)}
                      </span>
                      {activePhase && (
                        <span className="text-xs text-green-600 font-medium">
                          {activePhase.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer con disponibilidad y selector */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {isAvailable
                        ? `${available} disponibles`
                        : 'Agotado'}
                    </p>

                    {isAvailable ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTicketQuantityChange(ticket.id, selectedQty - 1)}
                          disabled={selectedQty === 0}
                          className="w-7 h-7 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{selectedQty}</span>
                        <button
                          onClick={() => handleTicketQuantityChange(ticket.id, selectedQty + 1)}
                          disabled={selectedQty >= Math.min(available, ticket.maxPerPurchase || 10)}
                          className="w-7 h-7 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">Agotado</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total y botón de registro */}
      {hasSelection && (
        <div className="border-t pt-4 mt-4">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total a pagar:</span>
              <span className="text-2xl font-bold text-primary">
                S/ {total.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)} ticket(s) seleccionado(s)
            </p>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <ShoppingCart size={18} />
            {!user ? 'Continuar al checkout' : 'Ir al pago'}
          </button>

          {!user && (
            <p className="text-xs text-gray-600 text-center mt-3">
              Serás redirigido al{' '}
              <span className="text-primary font-medium">checkout</span>
              {' '}para completar tu registro
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default EventRegistration;
