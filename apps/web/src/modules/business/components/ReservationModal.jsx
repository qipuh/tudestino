import { useState } from 'react';
import { X, Calendar, Clock, Users, MessageSquare, Plus, Minus } from 'lucide-react';
import api from '../../../services/api';

function ReservationModal({ business, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    reservationDate: '',
    reservationTime: '',
    numberOfPeople: 2,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const incrementPeople = () => {
    setFormData(prev => ({
      ...prev,
      numberOfPeople: Math.min(prev.numberOfPeople + 1, 100)
    }));
  };

  const decrementPeople = () => {
    setFormData(prev => ({
      ...prev,
      numberOfPeople: Math.max(prev.numberOfPeople - 1, 1)
    }));
  };

  const handlePeopleChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setFormData(prev => ({
      ...prev,
      numberOfPeople: Math.max(1, Math.min(value, 100))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post(`/businesses/${business.id}/reservations`, formData);

      if (response.success) {
        onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la reservación');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hacer Reservación</h2>
            <p className="text-gray-600 text-sm mt-1">{business.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={18} className="inline mr-2" />
              Fecha de reservación
            </label>
            <input
              type="date"
              name="reservationDate"
              value={formData.reservationDate}
              onChange={handleChange}
              min={today}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock size={18} className="inline mr-2" />
              Hora de reservación
            </label>
            <input
              type="time"
              name="reservationTime"
              value={formData.reservationTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Número de personas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={18} className="inline mr-2" />
              Número de personas
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementPeople}
                disabled={formData.numberOfPeople <= 1}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handlePeopleChange}
                min="1"
                max="100"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center font-medium text-lg"
              />
              <button
                type="button"
                onClick={incrementPeople}
                disabled={formData.numberOfPeople >= 100}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.numberOfPeople === 1 ? '1 persona' : `${formData.numberOfPeople} personas`}
            </p>
          </div>

          {/* Solicitudes especiales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={18} className="inline mr-2" />
              Solicitudes especiales (opcional)
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows={3}
              placeholder="Ej: Mesa junto a la ventana, silla para bebé, alergias alimentarias..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition disabled:opacity-50"
            >
              {loading ? 'Reservando...' : 'Confirmar Reservación'}
            </button>
          </div>

          {/* Información adicional */}
          <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
            <p>• Recibirás un código de confirmación por correo electrónico</p>
            <p>• El negocio confirmará tu reservación próximamente</p>
            <p>• Puedes cancelar tu reservación desde tu perfil</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationModal;
