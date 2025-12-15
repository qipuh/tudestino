import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ImageUpload from '../../../components/ImageUpload';

const roomTypes = [
  { value: 'single', label: 'Individual', icon: '🛏️', defaultCapacity: 1 },
  { value: 'double', label: 'Doble', icon: '🛏️', defaultCapacity: 2 },
  { value: 'triple', label: 'Triple', icon: '🛏️', defaultCapacity: 3 },
  { value: 'quad', label: 'Cuádruple', icon: '🛏️', defaultCapacity: 4 },
  { value: 'suite', label: 'Suite', icon: '👑', defaultCapacity: 2 },
  { value: 'family', label: 'Familiar', icon: '👨‍👩‍👧‍👦', defaultCapacity: 4 },
];

const roomAmenities = [
  { value: 'tv', label: 'TV', icon: '📺' },
  { value: 'wifi', label: 'WiFi', icon: '📶' },
  { value: 'air_conditioning', label: 'Aire acondicionado', icon: '❄️' },
  { value: 'heating', label: 'Calefacción', icon: '🔥' },
  { value: 'private_bathroom', label: 'Baño privado', icon: '🚿' },
  { value: 'balcony', label: 'Balcón', icon: '🪟' },
  { value: 'minibar', label: 'Minibar', icon: '🍷' },
  { value: 'safe_box', label: 'Caja fuerte', icon: '🔒' },
  { value: 'jacuzzi_tub', label: 'Jacuzzi', icon: '🛁' },
];

function CreateRoomsSimplified() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessId } = useParams();
  const propertyData = location.state?.propertyData || {};

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState({
    type: 'double',
    quantity: 1,
    capacity: 2,
    pricePerNight: 0,
    amenities: ['tv', 'wifi', 'private_bathroom'],
    description: '',
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambia el tipo, actualizar capacidad por defecto
    if (name === 'type') {
      const selectedType = roomTypes.find(t => t.value === value);
      setCurrentRoom({
        ...currentRoom,
        type: value,
        capacity: selectedType?.defaultCapacity || 2,
      });
    } else {
      setCurrentRoom({
        ...currentRoom,
        [name]: value,
      });
    }
  };

  const handleAmenityToggle = (amenity) => {
    const amenities = currentRoom.amenities.includes(amenity)
      ? currentRoom.amenities.filter(a => a !== amenity)
      : [...currentRoom.amenities, amenity];
    setCurrentRoom({ ...currentRoom, amenities });
  };

  const handleRoomImagesChange = (images) => {
    setCurrentRoom({ ...currentRoom, images });
  };

  const handleAddRoom = () => {
    if (!currentRoom.pricePerNight) {
      alert('Por favor completa el precio de la habitación');
      return;
    }

    setRooms([...rooms, currentRoom]);

    // Reset form
    setCurrentRoom({
      type: 'double',
      quantity: 1,
      capacity: 2,
      pricePerNight: 0,
      amenities: ['tv', 'wifi', 'private_bathroom'],
      description: '',
      images: [],
    });
  };

  const handleDeleteRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    if (rooms.length === 0) {
      alert('Debes agregar al menos una habitación');
      return;
    }

    try {
      const completeData = {
        ...propertyData,
        rooms: rooms,
      };

      console.log('Datos completos para enviar:', completeData);

      // Enviar a la API
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/businesses/${businessId}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(completeData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la propiedad');
      }

      alert('¡Propiedad y habitaciones creadas exitosamente!');
      navigate(`/business/${businessId}`);
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agregar Habitaciones</h1>
          <p className="text-gray-600 mt-2">
            Define los tipos de habitación que ofreces en tu hotel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-bold">Nueva Habitación</h2>

              {/* Tipo de Habitación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de habitación *
                </label>
                <select
                  name="type"
                  value={currentRoom.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-lg"
                >
                  {roomTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Precio y Cantidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por noche (S/.) *
                  </label>
                  <input
                    type="number"
                    name="pricePerNight"
                    value={currentRoom.pricePerNight}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de habitaciones
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={currentRoom.quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Capacidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad por habitación (huéspedes)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={currentRoom.capacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Capacidad total: <span className="font-semibold text-primary">
                    {currentRoom.quantity * currentRoom.capacity} huéspedes
                  </span> ({currentRoom.quantity} habitación{currentRoom.quantity !== 1 ? 'es' : ''} × {currentRoom.capacity} huésped{currentRoom.capacity !== 1 ? 'es' : ''})
                </p>
              </div>

              {/* Características/Amenidades */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Características de la habitación
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roomAmenities.map((amenity) => (
                    <label
                      key={amenity.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                        currentRoom.amenities.includes(amenity.value)
                          ? 'border-primary bg-primary bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={currentRoom.amenities.includes(amenity.value)}
                        onChange={() => handleAmenityToggle(amenity.value)}
                        className="sr-only"
                      />
                      <span className="text-xl">{amenity.icon}</span>
                      <span className="text-sm">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  name="description"
                  value={currentRoom.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Describe la habitación..."
                />
              </div>

              {/* Fotografías */}
              <ImageUpload
                label="Fotografías de la habitación"
                multiple={true}
                maxFiles={5}
                currentImages={currentRoom.images}
                onImagesChange={handleRoomImagesChange}
                uploadType="rooms"
              />

              {/* Botón Agregar */}
              <button
                onClick={handleAddRoom}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark font-medium text-lg"
              >
                + Agregar esta Habitación
              </button>
            </div>
          </div>

          {/* Lista de Habitaciones Agregadas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">
                Habitaciones Agregadas ({rooms.length})
              </h2>

              {rooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🛏️</div>
                  <p className="text-sm">Aún no has agregado habitaciones</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {rooms.map((room, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-lg">
                            {roomTypes.find(t => t.value === room.type)?.icon}{' '}
                            {roomTypes.find(t => t.value === room.type)?.label}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {room.quantity} habitación(es) • {room.capacity} huéspedes
                          </div>
                          <div className="text-xl font-bold text-primary mt-2">
                            S/. {room.pricePerNight}/noche
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRoom(index)}
                        className="w-full mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {rooms.length > 0 && (
                <button
                  onClick={handleSubmitAll}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  ✓ Finalizar y Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomsSimplified;
