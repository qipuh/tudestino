import { useState } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, X } from 'lucide-react';
import { isMultiUnitType } from '@tudestino/shared';
import {
  ROOM_AMENITIES,
  ROOM_AMENITY_LABELS,
  AMENITY_CATEGORIES,
  AMENITY_CATEGORY_LABELS,
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  ROOM_TYPE_DESCRIPTIONS,
  BED_TYPES,
  BED_TYPE_LABELS,
} from '@tudestino/shared';

function RoomsStep({ formData, updateFormData }) {
  const [editingRoom, setEditingRoom] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [currentRoom, setCurrentRoom] = useState({
    roomType: ROOM_TYPES.DOUBLE,
    name: '',
    quantity: 1,
    guestCapacity: 2,
    beds: [{ type: BED_TYPES.DOUBLE, count: 1 }],
    pricePerNight: '',
    amenities: [],
    images: [],
  });

  const isMultiUnit = isMultiUnitType(formData.accommodationType);
  const isRoom = formData.accommodationType === 'room';
  const isPrivateUnit = ['apartment', 'house', 'villa', 'cabin', 'cottage'].includes(formData.accommodationType);

  const amenityCategories = {
    [AMENITY_CATEGORIES.GENERAL]: [
      ROOM_AMENITIES.COAT_RACK,
      ROOM_AMENITIES.FLAT_SCREEN_TV,
      ROOM_AMENITIES.AIR_CONDITIONING,
      ROOM_AMENITIES.BEDDING,
      ROOM_AMENITIES.DESK,
      ROOM_AMENITIES.ALARM_CLOCK,
      ROOM_AMENITIES.TOWELS,
      ROOM_AMENITIES.WARDROBE,
      ROOM_AMENITIES.HEATING,
      ROOM_AMENITIES.FAN,
      ROOM_AMENITIES.SAFE,
      ROOM_AMENITIES.GROUND_FLOOR,
    ],
    [AMENITY_CATEGORIES.VIEWS_OUTDOOR]: [
      ROOM_AMENITIES.BALCONY,
      ROOM_AMENITIES.TERRACE,
      ROOM_AMENITIES.VIEWS,
    ],
    [AMENITY_CATEGORIES.FOOD_DRINK]: [
      ROOM_AMENITIES.ELECTRIC_KETTLE,
      ROOM_AMENITIES.COFFEE_MACHINE,
      ROOM_AMENITIES.DINING_AREA,
      ROOM_AMENITIES.DINING_TABLE,
      ROOM_AMENITIES.MICROWAVE,
      ROOM_AMENITIES.MINIBAR,
      ROOM_AMENITIES.REFRIGERATOR,
    ],
    [AMENITY_CATEGORIES.BATHROOM]: [
      ROOM_AMENITIES.PRIVATE_BATHROOM,
      ROOM_AMENITIES.BATHTUB,
      ROOM_AMENITIES.SHOWER,
      ROOM_AMENITIES.HAIRDRYER,
      ROOM_AMENITIES.TOILETRIES,
    ],
  };

  // Bed types are now imported from shared constants

  const handleAddRoom = () => {
    if (!currentRoom.name || !currentRoom.pricePerNight) {
      alert('Por favor completa el nombre y precio de la habitación');
      return;
    }

    // Validación: Solo una habitación para tipo "room"
    if (isRoom && formData.rooms.length > 0 && editingRoom === null) {
      alert('Para tipo "Habitación" solo puedes configurar una habitación');
      return;
    }

    const rooms = formData.rooms || [];
    if (editingRoom !== null) {
      rooms[editingRoom] = currentRoom;
    } else {
      rooms.push({ ...currentRoom, id: Date.now() });
    }

    updateFormData({ rooms });
    resetRoomForm();
  };

  const handleDeleteRoom = (index) => {
    if (confirm('¿Estás seguro de eliminar esta habitación?')) {
      const rooms = formData.rooms.filter((_, i) => i !== index);
      updateFormData({ rooms });
    }
  };

  const handleEditRoom = (index) => {
    setCurrentRoom(formData.rooms[index]);
    setEditingRoom(index);
    setShowRoomForm(true);
  };

  const resetRoomForm = () => {
    setCurrentRoom({
      roomType: ROOM_TYPES.DOUBLE,
      name: '',
      quantity: 1,
      guestCapacity: 2,
      beds: [{ type: BED_TYPES.DOUBLE, count: 1 }],
      pricePerNight: '',
      amenities: [],
      images: [],
    });
    setEditingRoom(null);
    setShowRoomForm(false);
  };

  const handleAmenityToggle = (amenity) => {
    const amenities = currentRoom.amenities || [];
    const newAmenities = amenities.includes(amenity)
      ? amenities.filter((a) => a !== amenity)
      : [...amenities, amenity];
    setCurrentRoom({ ...currentRoom, amenities: newAmenities });
  };

  const handleBedChange = (index, field, value) => {
    const beds = [...currentRoom.beds];
    beds[index] = { ...beds[index], [field]: value };
    setCurrentRoom({ ...currentRoom, beds });
  };

  const handleAddBed = () => {
    setCurrentRoom({
      ...currentRoom,
      beds: [...currentRoom.beds, { type: 'single', count: 1 }],
    });
  };

  const handleRemoveBed = (index) => {
    const beds = currentRoom.beds.filter((_, i) => i !== index);
    setCurrentRoom({ ...currentRoom, beds: beds.length > 0 ? beds : [{ type: BED_TYPES.DOUBLE, count: 1 }] });
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    // In production, upload to server and get URLs
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setCurrentRoom({
      ...currentRoom,
      images: [...currentRoom.images, ...imageUrls],
    });
  };

  const handleImageRemove = (index) => {
    const images = currentRoom.images.filter((_, i) => i !== index);
    setCurrentRoom({ ...currentRoom, images });
  };

  // Auto-show form if no rooms exist and not multi-unit
  if (!isMultiUnit && formData.rooms.length === 0 && !showRoomForm) {
    setShowRoomForm(true);
  }

  return (
    <div className="space-y-6">
      {!isMultiUnit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            {isPrivateUnit
              ? 'ℹ️ Configura las habitaciones de tu alojamiento. El precio será por el alojamiento completo (no por habitación).'
              : 'ℹ️ Para este tipo de alojamiento, configura las características del espacio completo.'
            }
          </p>
        </div>
      )}

      {/* Lista de habitaciones */}
      {formData.rooms.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Habitaciones configuradas ({formData.rooms.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.rooms.map((room, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {room.name}
                      {room.quantity > 1 && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          × {room.quantity} habitaciones
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Hasta {room.guestCapacity} huéspedes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditRoom(index)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Tipo:</span> {ROOM_TYPE_LABELS[room.roomType]}
                  </p>
                  <p>
                    <span className="font-medium">Camas:</span>{' '}
                    {room.beds.map(bed => `${bed.count} ${BED_TYPE_LABELS[bed.type]}`).join(', ')}
                  </p>
                  <p>
                    <span className="font-medium">Precio:</span> ${room.pricePerNight}/noche
                  </p>
                  <p>
                    <span className="font-medium">Amenidades:</span> {room.amenities.length}
                  </p>
                  <p>
                    <span className="font-medium">Fotos:</span> {room.images.length}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón para agregar habitación */}
      {(isMultiUnit || isPrivateUnit || (isRoom && formData.rooms.length === 0)) && !showRoomForm && (
        <button
          onClick={() => setShowRoomForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          {formData.rooms.length === 0 ? 'Configurar habitación' : 'Agregar otra habitación'}
        </button>
      )}

      {/* Formulario de habitación */}
      {showRoomForm && (
        <div className="border-2 border-primary rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingRoom !== null ? 'Editar habitación' : 'Nueva habitación'}
            </h3>
            <button
              onClick={resetRoomForm}
              className="p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tipo de habitación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de habitación *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(ROOM_TYPES).map(([key, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCurrentRoom({ ...currentRoom, roomType: value })}
                  className={`p-3 border-2 rounded-lg text-left transition ${
                    currentRoom.roomType === value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <p className={`text-sm font-semibold ${
                    currentRoom.roomType === value ? 'text-primary' : 'text-gray-900'
                  }`}>
                    {ROOM_TYPE_LABELS[value]}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {ROOM_TYPE_DESCRIPTIONS[value]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la habitación *
              </label>
              <input
                type="text"
                value={currentRoom.name}
                onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                placeholder={isMultiUnit ? `Ej: ${ROOM_TYPE_LABELS[currentRoom.roomType]}` : "Ej: Departamento completo"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            {isMultiUnit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad *
                  <span className="block text-xs font-normal text-gray-500 mt-0.5">
                    ¿Cuántas de este tipo?
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={currentRoom.quantity || 1}
                  onChange={(e) => setCurrentRoom({ ...currentRoom, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(currentRoom.quantity || 1) > 1
                    ? `Se crearán ${currentRoom.quantity} habitaciones idénticas`
                    : '1 habitación con esta configuración'
                  }
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad (huéspedes) *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={currentRoom.guestCapacity}
                onChange={(e) => setCurrentRoom({ ...currentRoom, guestCapacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Camas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Configuración de camas *
            </label>
            <div className="space-y-3">
              {currentRoom.beds.map((bed, index) => (
                <div key={index} className="flex items-center gap-3">
                  <select
                    value={bed.type}
                    onChange={(e) => handleBedChange(index, 'type', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {Object.entries(BED_TYPES).map(([key, value]) => (
                      <option key={value} value={value}>
                        {BED_TYPE_LABELS[value]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bed.count}
                    onChange={(e) => handleBedChange(index, 'count', parseInt(e.target.value))}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {currentRoom.beds.length > 1 && (
                    <button
                      onClick={() => handleRemoveBed(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddBed}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={16} />
                Agregar tipo de cama
              </button>
            </div>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isPrivateUnit
                ? 'Precio por noche del alojamiento completo *'
                : 'Precio por noche *'
              }
              {isPrivateUnit && (
                <span className="block text-xs font-normal text-gray-500 mt-1">
                  Este es el precio total por rentar todo el alojamiento
                </span>
              )}
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentRoom.pricePerNight}
                onChange={(e) => setCurrentRoom({ ...currentRoom, pricePerNight: e.target.value })}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Amenidades por categoría */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              ¿Qué pueden usar los clientes en esta habitación?
            </h4>
            <div className="space-y-6">
              {Object.entries(amenityCategories).map(([category, amenities]) => (
                <div key={category}>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">
                    {AMENITY_CATEGORY_LABELS[category]}
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={currentRoom.amenities?.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-gray-700">
                          {ROOM_AMENITY_LABELS[amenity]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fotos de la habitación * (mínimo 3, máximo 10)
            </label>
            <div className="space-y-4">
              {currentRoom.images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {currentRoom.images.map((image, index) => (
                    <div key={index} className="relative aspect-square group">
                      <img
                        src={image}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleImageRemove(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {currentRoom.images.length < 10 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition">
                  <ImageIcon className="text-gray-400 mb-2" size={32} />
                  <span className="text-sm text-gray-600">
                    Haz clic para agregar fotos
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {currentRoom.images.length}/10 fotos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageAdd}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {currentRoom.images.length < 3 && (
              <p className="text-xs text-red-600 mt-2">
                Se requieren al menos 3 fotos para publicar la habitación
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              onClick={resetRoomForm}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddRoom}
              disabled={!currentRoom.name || !currentRoom.pricePerNight || currentRoom.images.length < 3}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingRoom !== null ? 'Guardar cambios' : 'Agregar habitación'}
            </button>
          </div>
        </div>
      )}

      {/* Warning si no hay habitaciones */}
      {formData.rooms.length === 0 && !showRoomForm && (
        <div className="text-center py-8 text-gray-500">
          <p>Aún no has configurado ninguna habitación</p>
          <p className="text-sm mt-1">Haz clic en el botón de arriba para comenzar</p>
        </div>
      )}
    </div>
  );
}

export default RoomsStep;
