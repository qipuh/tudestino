import { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import {
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  ROOM_TYPE_DESCRIPTIONS,
  BED_TYPES,
  BED_TYPE_LABELS,
  ROOM_AMENITIES,
  ROOM_AMENITY_LABELS,
  AMENITY_CATEGORIES,
  AMENITY_CATEGORY_LABELS,
} from '@tudestino/shared';

function RoomForm({ roomData, onChange, isMultiUnit = false }) {
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

  const handleAmenityToggle = (amenity) => {
    const amenities = roomData.amenities || [];
    const newAmenities = amenities.includes(amenity)
      ? amenities.filter((a) => a !== amenity)
      : [...amenities, amenity];
    onChange({ ...roomData, amenities: newAmenities });
  };

  const handleBedChange = (index, field, value) => {
    const beds = [...roomData.beds];
    beds[index] = { ...beds[index], [field]: value };
    onChange({ ...roomData, beds });
  };

  const handleAddBed = () => {
    onChange({
      ...roomData,
      beds: [...roomData.beds, { type: BED_TYPES.SINGLE, count: 1 }],
    });
  };

  const handleRemoveBed = (index) => {
    const beds = roomData.beds.filter((_, i) => i !== index);
    onChange({
      ...roomData,
      beds: beds.length > 0 ? beds : [{ type: BED_TYPES.DOUBLE, count: 1 }],
    });
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    // En producción, subir al servidor y obtener URLs
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    onChange({
      ...roomData,
      images: [...roomData.images, ...imageUrls],
    });
  };

  const handleImageRemove = (index) => {
    const images = roomData.images.filter((_, i) => i !== index);
    onChange({ ...roomData, images });
  };

  return (
    <div className="space-y-6">
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
              onClick={() => onChange({ ...roomData, roomType: value })}
              className={`p-3 border-2 rounded-lg text-left transition ${
                roomData.roomType === value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  roomData.roomType === value ? 'text-primary' : 'text-gray-900'
                }`}
              >
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
            value={roomData.name}
            onChange={(e) => onChange({ ...roomData, name: e.target.value })}
            placeholder={`Ej: ${ROOM_TYPE_LABELS[roomData.roomType]}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad de habitaciones *
            <span className="block text-xs font-normal text-gray-500 mt-1">
              ¿Cuántas habitaciones de este tipo tienes?
            </span>
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={roomData.quantity || 1}
            onChange={(e) => onChange({ ...roomData, quantity: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {roomData.quantity > 1
              ? `Se crearán ${roomData.quantity} habitaciones idénticas con esta configuración`
              : 'Solo se creará 1 habitación con esta configuración'
            }
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacidad (huéspedes) *
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={roomData.guestCapacity}
            onChange={(e) => onChange({ ...roomData, guestCapacity: parseInt(e.target.value) })}
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
          {roomData.beds.map((bed, index) => (
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
              {roomData.beds.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBed(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
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
          Precio por noche *
        </label>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={roomData.pricePerNight}
            onChange={(e) => onChange({ ...roomData, pricePerNight: e.target.value })}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Amenidades */}
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
                      checked={roomData.amenities?.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-gray-700">{ROOM_AMENITY_LABELS[amenity]}</span>
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
          {roomData.images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {roomData.images.map((image, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={image}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {roomData.images.length < 10 && (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition">
              <ImageIcon className="text-gray-400 mb-2" size={32} />
              <span className="text-sm text-gray-600">Haz clic para agregar fotos</span>
              <span className="text-xs text-gray-500 mt-1">
                {roomData.images.length}/10 fotos
              </span>
              <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
            </label>
          )}
        </div>
        {roomData.images.length < 3 && (
          <p className="text-xs text-red-600 mt-2">Se requieren al menos 3 fotos para publicar la habitación</p>
        )}
      </div>
    </div>
  );
}

export default RoomForm;
