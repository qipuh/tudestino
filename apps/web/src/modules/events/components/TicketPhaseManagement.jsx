import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import PropTypes from 'prop-types';

function TicketPhaseManagement({ ticketId, canEdit = false, onPhasesChange }) {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantityAvailable: '',
    startDate: '',
    endDate: '',
    displayOrder: 0
  });

  useEffect(() => {
    if (ticketId) {
      fetchPhases();
    }
  }, [ticketId]);

  const fetchPhases = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/tickets/${ticketId}/phases`
      );
      const data = await response.json();
      if (response.ok) {
        setPhases(data);
        if (onPhasesChange) onPhasesChange(data);
      }
    } catch (err) {
      console.error('Error loading phases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = editingPhase
        ? `${import.meta.env.VITE_API_URL}/events/tickets/${ticketId}/phases/${editingPhase.id}`
        : `${import.meta.env.VITE_API_URL}/events/tickets/${ticketId}/phases`;

      const response = await fetch(url, {
        method: editingPhase ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          quantityAvailable: formData.quantityAvailable ? parseInt(formData.quantityAvailable) : null,
          startDate: formData.startDate,
          endDate: formData.endDate,
          displayOrder: parseInt(formData.displayOrder)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar fase');
      }

      await fetchPhases();
      setShowForm(false);
      setEditingPhase(null);
      resetForm();
    } catch (err) {
      alert(err.message || 'Error al guardar fase');
    }
  };

  const handleEdit = (phase) => {
    setEditingPhase(phase);
    setFormData({
      name: phase.name,
      description: phase.description || '',
      price: (phase.price || 0).toString(),
      quantityAvailable: (phase.quantityAvailable || '').toString(),
      startDate: formatDateTimeForInput(phase.startDate),
      endDate: formatDateTimeForInput(phase.endDate),
      displayOrder: phase.displayOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (phaseId) => {
    if (!confirm('¿Estás seguro de eliminar esta fase?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/tickets/${ticketId}/phases/${phaseId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar fase');
      }

      await fetchPhases();
    } catch (err) {
      alert(err.message || 'Error al eliminar fase');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantityAvailable: '',
      startDate: '',
      endDate: '',
      displayOrder: 0
    });
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPhaseStatusBadge = (phase) => {
    const now = new Date();
    const start = new Date(phase.startDate);
    const end = new Date(phase.endDate);

    if (phase.status === 'sold_out') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Agotado</span>;
    }
    if (now < start) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Próximamente</span>;
    }
    if (now >= start && now <= end) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Activa</span>;
    }
    if (now > end) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Finalizada</span>;
    }
    return null;
  };

  if (loading) {
    return <div className="text-center py-6 text-sm text-gray-600">Cargando fases...</div>;
  }

  return (
    <div className="space-y-4 ml-8 mt-4 border-l-2 border-gray-200 pl-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Fases de Precio</h4>
        {canEdit && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
          >
            <Plus size={16} />
            Agregar Fase
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && canEdit && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-semibold mb-3">
            {editingPhase ? 'Editar Fase' : 'Nueva Fase'}
          </h5>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre de la fase *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Ej: Early Bird"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Precio (S/.) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Describe esta fase..."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cantidad disponible
                </label>
                <input
                  type="number"
                  name="quantityAvailable"
                  value={formData.quantityAvailable}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Ilimitado"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Orden de visualización
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha/hora inicio *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fecha/hora fin *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
              >
                {editingPhase ? 'Actualizar' : 'Crear Fase'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPhase(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Phases List */}
      {phases.length > 0 ? (
        <div className="space-y-3">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-gray-900">{phase.name}</h5>
                    {getPhaseStatusBadge(phase)}
                  </div>
                  {phase.description && (
                    <p className="text-xs text-gray-600">{phase.description}</p>
                  )}
                </div>

                {canEdit && (
                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={() => handleEdit(phase)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(phase.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <DollarSign size={14} className="text-green-600" />
                  <span className="font-bold text-green-700">S/ {parseFloat(phase.price).toFixed(2)}</span>
                </div>
                {phase.quantityAvailable && (
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Users size={14} className="text-gray-400" />
                    <span>{phase.soldQuantity || 0} / {phase.quantityAvailable}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                  <Calendar size={14} className="text-primary" />
                  <span>{formatDateTime(phase.startDate)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                  <Clock size={14} className="text-primary" />
                  <span>{formatDateTime(phase.endDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">No hay fases configuradas</p>
          {canEdit && (
            <p className="text-xs text-gray-500">
              Agrega fases para ofrecer precios progresivos
            </p>
          )}
        </div>
      )}
    </div>
  );
}

TicketPhaseManagement.propTypes = {
  ticketId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
  onPhasesChange: PropTypes.func
};

export default TicketPhaseManagement;
