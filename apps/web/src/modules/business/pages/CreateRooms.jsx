import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const roomAmenities = [
  { value: 'tv', label: 'TV', icon: '📺' },
  { value: 'wifi', label: 'WiFi', icon: '📶' },
  { value: 'air_conditioning', label: 'Aire acondicionado', icon: '❄️' },
  { value: 'heating', label: 'Calefacción', icon: '🔥' },
  { value: 'private_bathroom', label: 'Baño privado', icon: '🚿' },
  { value: 'balcony', label: 'Balcón', icon: '🪟' },
  { value: 'minibar', label: 'Minibar', icon: '🍷' },
  { value: 'safe_box', label: 'Caja fuerte', icon: '🔒' },
  { value: 'coffee_maker', label: 'Cafetera', icon: '☕' },
  { value: 'refrigerator', label: 'Refrigerador', icon: '🧊' },
  { value: 'microwave', label: 'Microondas', icon: '📟' },
  { value: 'jacuzzi_tub', label: 'Jacuzzi', icon: '🛁' },
  { value: 'room_service', label: 'Servicio a cuarto', icon: '🛎️' },
  { value: 'daily_cleaning', label: 'Limpieza diaria', icon: '🧹' },
];

const bedTypes = [
  { value: 'king_bed', label: 'Cama King', icon: '🛏️', capacity: 2 },
  { value: 'queen_bed', label: 'Cama Queen', icon: '🛏️', capacity: 2 },
  { value: 'double_bed', label: 'Cama Doble', icon: '🛏️', capacity: 2 },
  { value: 'twin_beds', label: 'Camas Individuales', icon: '🛏️🛏️', capacity: 2 },
  { value: 'single_bed', label: 'Cama Individual', icon: '🛏️', capacity: 1 },
];

function CreateRooms() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessId } = useParams();
  const propertyData = location.state?.propertyData || {};

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState({
    name: '',
    type: 'double',
    quantity: 1,
    capacity: 2,
    beds: [],
    pricePerNight: 0,
    amenities: [],
    description: '',
    photos: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentRoom({
      ...currentRoom,
      [name]: value,
    });
  };

  const handleAmenityToggle = (amenity) => {
    const amenities = currentRoom.amenities.includes(amenity)
      ? currentRoom.amenities.filter(a => a !== amenity)
      : [...currentRoom.amenities, amenity];
    setCurrentRoom({ ...currentRoom, amenities });
  };

  const handleBedAdd = (bedType) => {
    const bed = bedTypes.find(b => b.value === bedType);
    setCurrentRoom({
      ...currentRoom,
      beds: [...currentRoom.beds, { type: bedType, quantity: 1 }],
    });
  };

  const handleBedRemove = (index) => {
    setCurrentRoom({
      ...currentRoom,
      beds: currentRoom.beds.filter((_, i) => i !== index),
    });
  };

  const handleAddRoom = () => {
    if (!currentRoom.name || !currentRoom.pricePerNight) {
      alert('Por favor completa el nombre y precio');
      return;
    }

    if (isEditing) {
      const updatedRooms = [...rooms];
      updatedRooms[editIndex] = currentRoom;
      setRooms(updatedRooms);
      setIsEditing(false);
      setEditIndex(null);
    } else {
      setRooms([...rooms, currentRoom]);
    }

    // Reset form
    setCurrentRoom({
      name: '',
      type: 'double',
      quantity: 1,
      capacity: 2,
      beds: [],
      pricePerNight: 0,
      amenities: [],
      description: '',
      photos: [],
    });
  };

  const handleEditRoom = (index) => {
    setCurrentRoom(rooms[index]);
    setIsEditing(true);
    setEditIndex(index);
  };

  const handleDeleteRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    if (rooms.length === 0) {
      alert('Debes agregar al menos una habitación');
      return;
    }

    const completeData = {
      ...propertyData,
      rooms: rooms,
    };

    console.log('Datos completos:', completeData);

    // TODO: Enviar a la API
    // const response = await api.post(`/businesses/${businessId}/properties`, completeData);

    alert('¡Propiedad creada exitosamente!');
    navigate(`/business/${businessId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agregar Habitaciones</h1>
          <p className="text-gray-600 mt-2">
            Define los tipos de habitación que ofreces
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de Habitación */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-bold">
                {isEditing ? 'Editar Habitación' : 'Nueva Habitación'}
              </h2>

              {/* Nombre y Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={currentRoom.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Ej: Habitación Doble Superior"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    name="type"
                    value={currentRoom.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  >
                    <option value="single">Individual</option>
                    <option value="double">Doble</option>
                    <option value="triple">Triple</option>
                    <option value="suite">Suite</option>
                    <option value="family">Familiar</option>
                  </select>
                </div>
              </div>

              {/* Cantidad y Capacidad */}
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad (huéspedes)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={currentRoom.capacity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Precio */}
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

              {/* Camas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipos de cama
                </label>
                <div className="space-y-2 mb-3">
                  {currentRoom.beds.map((bed, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <span className="flex-1">
                        {bedTypes.find(b => b.value === bed.type)?.label}
                      </span>
                      <button
                        onClick={() => handleBedRemove(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBedAdd(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="">+ Agregar cama</option>
                  {bedTypes.map((bed) => (
                    <option key={bed.value} value={bed.value}>
                      {bed.icon} {bed.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicios de la Habitación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Servicios de la habitación
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
                  Descripción
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

              {/* Botón Agregar */}
              <button
                onClick={handleAddRoom}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark font-medium"
              >
                {isEditing ? 'Actualizar Habitación' : '+ Agregar Habitación'}
              </button>
            </div>
          </div>

          {/* Lista de Habitaciones Agregadas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">
                Habitaciones ({rooms.length})
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
                      className="border rounded-lg p-3 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-bold">{room.name}</div>
                          <div className="text-sm text-gray-600">
                            {room.quantity} habitación(es) • {room.capacity} huéspedes
                          </div>
                          <div className="text-lg font-bold text-primary mt-1">
                            S/. {room.pricePerNight}/noche
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditRoom(index)}
                          className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(index)}
                          className="flex-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {rooms.length > 0 && (
                <button
                  onClick={handleSubmitAll}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  Finalizar y Publicar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRooms;
