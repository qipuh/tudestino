import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Ticket, Layers } from 'lucide-react';
import TicketPhaseManagement from './TicketPhaseManagement';

function TicketManagement({ eventId, canEdit = false }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    maxPerPurchase: '10',
    salesStartDate: '',
    salesEndDate: '',
    usesPhases: false,
  });
  const [expandedTicket, setExpandedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, [eventId]);

  const fetchTickets = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${eventId}/tickets`
      );
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = editingTicket
        ? `${import.meta.env.VITE_API_URL}/events/${eventId}/tickets/${editingTicket.id}`
        : `${import.meta.env.VITE_API_URL}/events/${eventId}/tickets`;

      const response = await fetch(url, {
        method: editingTicket ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          totalQuantity: parseInt(formData.quantity),
          maxQuantityPerOrder: parseInt(formData.maxPerPurchase),
          salesStartDate: formData.salesStartDate || null,
          salesEndDate: formData.salesEndDate || null,
          usesPhases: formData.usesPhases,
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar ticket');
      }

      // Recargar tickets
      await fetchTickets();

      // Resetear formulario
      setShowForm(false);
      setEditingTicket(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        maxPerPurchase: '10',
        salesStartDate: '',
        salesEndDate: '',
        usesPhases: false,
      });
    } catch (err) {
      alert(err.message || 'Error al guardar ticket');
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      description: ticket.description || '',
      price: (ticket.price || 0).toString(),
      quantity: (ticket.totalQuantity || ticket.quantity || 0).toString(),
      maxPerPurchase: (ticket.maxQuantityPerOrder || ticket.maxPerPurchase || 10).toString(),
      salesStartDate: ticket.salesStartDate || '',
      salesEndDate: ticket.salesEndDate || '',
      usesPhases: ticket.usesPhases || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (ticketId) => {
    if (!confirm('¿Estás seguro de eliminar este ticket?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/${eventId}/tickets/${ticketId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar ticket');
      }

      await fetchTickets();
    } catch (err) {
      alert(err.message || 'Error al eliminar ticket');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="text-center py-6">Cargando tickets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
        {canEdit && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus size={20} />
            Agregar Ticket
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && canEdit && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingTicket ? 'Editar Ticket' : 'Nuevo Ticket'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del ticket *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: Entrada General"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (S/.) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Describe qué incluye este ticket..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="usesPhases"
                  checked={formData.usesPhases}
                  onChange={(e) => setFormData({...formData, usesPhases: e.target.checked})}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-primary" />
                    <span className="font-medium text-gray-900">Usar sistema de fases</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Define múltiples fases de precio para este ticket (ej: Early Bird S/ 50, Fase 1 S/ 70, Fase 2 S/ 90)
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad disponible *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máx. por compra
                </label>
                <input
                  type="number"
                  name="maxPerPurchase"
                  value={formData.maxPerPurchase}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inicio de ventas
                </label>
                <input
                  type="datetime-local"
                  name="salesStartDate"
                  value={formData.salesStartDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fin de ventas
                </label>
                <input
                  type="datetime-local"
                  name="salesEndDate"
                  value={formData.salesEndDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                {editingTicket ? 'Actualizar' : 'Crear Ticket'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTicket(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
                      <Ticket className="text-primary" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{ticket.name}</h3>
                        {ticket.usesPhases && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Layers size={12} />
                            Con fases
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {ticket.isFree ? 'Gratis' : ticket.usesPhases ? 'Precio variable' : `S/ ${parseFloat(ticket.price || 0).toFixed(2)}`}
                      </p>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex gap-2">
                      {ticket.usesPhases && (
                        <button
                          onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                          className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-lg"
                          title="Ver fases"
                        >
                          <Layers size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(ticket)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {ticket.description && (
                  <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {ticket.soldQuantity || 0} / {ticket.totalQuantity || 'Ilimitado'} vendidos
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status === 'active' ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
              </div>

              {/* Phase Management - Collapsible */}
              {ticket.usesPhases && expandedTicket === ticket.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <TicketPhaseManagement
                    ticketId={ticket.id}
                    canEdit={canEdit}
                    onPhasesChange={(phases) => {
                      // Actualizar el ticket con las fases
                      console.log('Phases updated:', phases);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Ticket className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 mb-2">No hay tickets configurados</p>
          {canEdit && (
            <p className="text-sm text-gray-500">
              Crea tickets para que los usuarios puedan registrarse
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default TicketManagement;
