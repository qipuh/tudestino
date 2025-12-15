import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function CreatePropertySimplified() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [formData, setFormData] = useState({
    checkInTime: '14:00',
    checkOutTime: '12:00',
    // Servicios básicos
    hasWifi: true,
    hasParking: false,
    hasSwimmingPool: false,
    hasRestaurant: false,
    // Mascotas
    petsAllowed: false,
    // Desayuno
    breakfastIncluded: false,
    // Niños
    childrenAllowed: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleContinue = () => {
    // Guardar datos básicos y continuar a habitaciones
    navigate(`/business/${businessId}/property/create-rooms`, {
      state: { propertyData: formData }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Hotel</h1>
          <p className="text-gray-600 mt-2">
            Configura los datos básicos de tu hotel antes de agregar habitaciones
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Check-in / Check-out */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Check-in
              </label>
              <input
                type="time"
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Check-out
              </label>
              <input
                type="time"
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Servicios Básicos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Servicios del hotel
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasWifi"
                  checked={formData.hasWifi}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span>📶 WiFi</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasParking"
                  checked={formData.hasParking}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span>🅿️ Estacionamiento</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasSwimmingPool"
                  checked={formData.hasSwimmingPool}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span>🏊 Piscina</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasRestaurant"
                  checked={formData.hasRestaurant}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span>🍽️ Restaurante</span>
              </label>
            </div>
          </div>

          {/* Políticas */}
          <div className="border-t pt-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="petsAllowed"
                checked={formData.petsAllowed}
                onChange={handleChange}
                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="font-medium">🐕 ¿Se permiten mascotas?</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="breakfastIncluded"
                checked={formData.breakfastIncluded}
                onChange={handleChange}
                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="font-medium">☕ ¿Desayuno incluido?</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="childrenAllowed"
                checked={formData.childrenAllowed}
                onChange={handleChange}
                className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="font-medium">👶 ¿Se permiten niños?</span>
            </label>
          </div>

          {/* Botón Continuar */}
          <button
            onClick={handleContinue}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark font-medium text-lg"
          >
            Continuar a Habitaciones →
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePropertySimplified;
