import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const accommodationTypes = [
  { value: 'hotel', label: 'Hotel', icon: '🏨', description: 'Hotel tradicional' },
  { value: 'hostel', label: 'Hostal/Albergue', icon: '🏠', description: 'Alojamiento económico compartido' },
  { value: 'apartment', label: 'Apartamento', icon: '🏢', description: 'Departamento completo' },
  { value: 'house', label: 'Casa', icon: '🏡', description: 'Casa completa' },
  { value: 'villa', label: 'Villa', icon: '🏘️', description: 'Villa de lujo' },
  { value: 'cabin', label: 'Cabaña', icon: '🛖', description: 'Cabaña rústica' },
  { value: 'room', label: 'Habitación', icon: '🚪', description: 'Habitación individual' },
  { value: 'bed_and_breakfast', label: 'B&B', icon: '☕', description: 'Bed & Breakfast' },
  { value: 'resort', label: 'Resort', icon: '🏖️', description: 'Complejo turístico' },
  { value: 'guesthouse', label: 'Casa de Huéspedes', icon: '🏘️', description: 'Hospedaje familiar' },
];

const propertyAmenities = [
  { value: 'wifi', label: 'WiFi', icon: '📶' },
  { value: 'parking', label: 'Estacionamiento', icon: '🅿️' },
  { value: 'swimming_pool', label: 'Piscina', icon: '🏊' },
  { value: 'restaurant', label: 'Restaurante', icon: '🍽️' },
  { value: 'bar', label: 'Bar', icon: '🍷' },
  { value: 'gym', label: 'Gimnasio', icon: '💪' },
  { value: 'spa', label: 'Spa', icon: '💆' },
  { value: 'laundry', label: 'Lavandería', icon: '🧺' },
  { value: 'airport_shuttle', label: 'Traslado aeropuerto', icon: '✈️' },
  { value: 'elevator', label: 'Ascensor', icon: '🛗' },
  { value: 'room_service', label: 'Servicio a la habitación', icon: '🛎️' },
  { value: 'business_center', label: 'Centro de negocios', icon: '💼' },
  { value: 'meeting_rooms', label: 'Salas de reuniones', icon: '👥' },
];

function CreateProperty() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Paso 1: Tipo de alojamiento
    accommodationType: 'hotel',

    // Paso 2: Datos básicos
    propertyName: '',
    description: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',

    // Servicios del establecimiento
    amenities: [],
    hasWifi: true,
    hasParking: false,
    parkingType: 'free',
    parkingPricePerDay: 0,
    hasSwimmingPool: false,
    hasRestaurant: false,
    hasGym: false,
    hasSpa: false,
    hasLaundry: false,
    hasAirportShuttle: false,
    hasElevator: false,

    // Mascotas
    petsAllowed: false,
    petFee: 0,
    petFeeType: 'per_night',

    // Desayuno
    breakfastIncluded: false,
    breakfastType: 'continental',
    breakfastPrice: 0,

    // Niños
    childrenAllowed: true,
    minimumAge: 0,

    // Fotos (para paso 2)
    photos: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAmenityToggle = (amenity) => {
    const amenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    setFormData({ ...formData, amenities });
  };

  const handleSubmitBasicData = async () => {
    // Aquí enviaremos los datos a la API para crear la propiedad
    console.log('Datos de la propiedad:', formData);

    // TODO: Llamar API para crear propiedad
    // const response = await api.post(`/businesses/${businessId}/properties`, formData);

    // Por ahora, ir al paso de habitaciones
    navigate(`/business/${businessId}/property/create-rooms`, {
      state: { propertyData: formData }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agregar Alojamiento</h1>
          <p className="text-gray-600 mt-2">
            Configura tu propiedad paso a paso
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className="text-xs text-center">Tipo de alojamiento</div>
            </div>
            <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-primary' : 'border-gray-200'}`}></div>
            <div className={`flex-1 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <div className="text-xs text-center">Datos básicos</div>
            </div>
            <div className={`flex-1 border-t-2 ${step >= 3 ? 'border-primary' : 'border-gray-200'}`}></div>
            <div className={`flex-1 ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <div className="text-xs text-center">Habitaciones</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* PASO 1: Tipo de Alojamiento */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Selecciona el tipo de alojamiento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accommodationTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.accommodationType === type.value
                        ? 'border-primary bg-primary bg-opacity-5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accommodationType"
                      value={type.value}
                      checked={formData.accommodationType === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-4xl">{type.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark font-medium"
              >
                Continuar
              </button>
            </div>
          )}

          {/* PASO 2: Datos Básicos */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Datos básicos del alojamiento</h2>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la propiedad *
                </label>
                <input
                  type="text"
                  name="propertyName"
                  value={formData.propertyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Ej: Hotel Paradise Cajamarca"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Describe tu alojamiento..."
                />
              </div>

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

              {/* Servicios del Establecimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Servicios del establecimiento
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propertyAmenities.map((amenity) => (
                    <label
                      key={amenity.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                        formData.amenities.includes(amenity.value)
                          ? 'border-primary bg-primary bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity.value)}
                        onChange={() => handleAmenityToggle(amenity.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl">{amenity.icon}</span>
                      <span className="text-sm font-medium">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Estacionamiento */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    name="hasParking"
                    checked={formData.hasParking}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="font-medium">¿Tiene estacionamiento?</span>
                </label>

                {formData.hasParking && (
                  <div className="ml-7 space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="parkingType"
                          value="free"
                          checked={formData.parkingType === 'free'}
                          onChange={handleChange}
                          className="text-primary focus:ring-primary"
                        />
                        <span>Gratuito</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="parkingType"
                          value="paid"
                          checked={formData.parkingType === 'paid'}
                          onChange={handleChange}
                          className="text-primary focus:ring-primary"
                        />
                        <span>De pago</span>
                      </label>
                    </div>
                    {formData.parkingType === 'paid' && (
                      <input
                        type="number"
                        name="parkingPricePerDay"
                        value={formData.parkingPricePerDay}
                        onChange={handleChange}
                        placeholder="Precio por día"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Mascotas */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    name="petsAllowed"
                    checked={formData.petsAllowed}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="font-medium">¿Se permiten mascotas?</span>
                </label>

                {formData.petsAllowed && (
                  <div className="ml-7 space-y-3">
                    <input
                      type="number"
                      name="petFee"
                      value={formData.petFee}
                      onChange={handleChange}
                      placeholder="Tarifa por mascota"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                    <select
                      name="petFeeType"
                      value={formData.petFeeType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="per_night">Por noche</option>
                      <option value="per_stay">Por estadía</option>
                      <option value="refundable_deposit">Depósito reembolsable</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Desayuno */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    name="breakfastIncluded"
                    checked={formData.breakfastIncluded}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="font-medium">¿Incluye desayuno?</span>
                </label>

                {formData.breakfastIncluded && (
                  <div className="ml-7 space-y-3">
                    <select
                      name="breakfastType"
                      value={formData.breakfastType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                      <option value="continental">Continental</option>
                      <option value="buffet">Buffet</option>
                      <option value="american">Americano</option>
                    </select>
                    <input
                      type="number"
                      name="breakfastPrice"
                      value={formData.breakfastPrice}
                      onChange={handleChange}
                      placeholder="Precio por persona (si no está incluido)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Niños */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    name="childrenAllowed"
                    checked={formData.childrenAllowed}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="font-medium">¿Se permiten niños?</span>
                </label>

                {formData.childrenAllowed && (
                  <div className="ml-7">
                    <input
                      type="number"
                      name="minimumAge"
                      value={formData.minimumAge}
                      onChange={handleChange}
                      placeholder="Edad mínima (0 = todas las edades)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSubmitBasicData}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
                >
                  Continuar a Habitaciones
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateProperty;
