import { useState } from 'react';
import { Calendar, Clock, Users, Phone, Mail, MessageSquare } from 'lucide-react';

function ReservationForm({ restaurant, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    reservationDate: '',
    reservationTime: '',
    numberOfPeople: 2,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    specialRequests: '',
    tablePreference: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reservationDate) {
      newErrors.reservationDate = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.reservationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.reservationDate = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.reservationTime) {
      newErrors.reservationTime = 'La hora es requerida';
    }

    if (!formData.numberOfPeople || formData.numberOfPeople < 1) {
      newErrors.numberOfPeople = 'Debe ingresar al menos 1 persona';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre es requerido';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'El teléfono es requerido';
    } else if (!/^\d{9,}$/.test(formData.customerPhone.replace(/[\s-]/g, ''))) {
      newErrors.customerPhone = 'Ingrese un teléfono válido';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Ingrese un email válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...formData, restaurantId: restaurant.id });
    }
  };

  // Generar opciones de tiempo cada 30 minutos
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 23; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 23 && minute === 30) break;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          Reserva en {restaurant.name}
        </h3>
        <p className="text-sm text-blue-700">
          {restaurant.address}, {restaurant.city}
        </p>
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-2" />
            Fecha de Reserva *
          </label>
          <input
            type="date"
            name="reservationDate"
            value={formData.reservationDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.reservationDate ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.reservationDate && (
            <p className="text-red-500 text-sm mt-1">{errors.reservationDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock size={16} className="inline mr-2" />
            Hora *
          </label>
          <select
            name="reservationTime"
            value={formData.reservationTime}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.reservationTime ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Seleccionar hora</option>
            {generateTimeOptions().map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {errors.reservationTime && (
            <p className="text-red-500 text-sm mt-1">{errors.reservationTime}</p>
          )}
        </div>
      </div>

      {/* Número de personas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users size={16} className="inline mr-2" />
          Número de Personas *
        </label>
        <input
          type="number"
          name="numberOfPeople"
          value={formData.numberOfPeople}
          onChange={handleChange}
          min="1"
          max={restaurant.capacity || 20}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.numberOfPeople && (
          <p className="text-red-500 text-sm mt-1">{errors.numberOfPeople}</p>
        )}
      </div>

      {/* Información del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Ej: Juan Pérez"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.customerName ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone size={16} className="inline mr-2" />
            Teléfono *
          </label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="987654321"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.customerPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.customerPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail size={16} className="inline mr-2" />
          Email (opcional)
        </label>
        <input
          type="email"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.customerEmail ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.customerEmail && (
          <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
        )}
      </div>

      {/* Preferencia de mesa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferencia de Mesa
        </label>
        <select
          name="tablePreference"
          value={formData.tablePreference}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Sin preferencia</option>
          <option value="ventana">Junto a la ventana</option>
          <option value="terraza">Terraza</option>
          <option value="interior">Interior</option>
          <option value="privado">Área privada</option>
        </select>
      </div>

      {/* Solicitudes especiales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MessageSquare size={16} className="inline mr-2" />
          Solicitudes Especiales
        </label>
        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows="3"
          placeholder="Ej: Cumpleaños, alergias alimentarias, necesidades especiales..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Confirmar Reserva
        </button>
      </div>
    </form>
  );
}

export default ReservationForm;
