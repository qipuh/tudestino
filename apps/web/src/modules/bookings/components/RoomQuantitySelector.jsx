import { useState } from 'react';
import { Bed, Users, Plus, Minus, ChevronDown, ChevronUp, Check, Info } from 'lucide-react';
import { BED_TYPE_LABELS, ROOM_AMENITY_LABELS } from '@tudestino/shared';

/**
 * Selector de habitaciones por cantidad
 * Similar a Booking.com - el usuario elige cuántas habitaciones de cada tipo quiere
 */
function RoomQuantitySelector({ rooms, selectedRooms, onRoomsChange, maxGuests }) {
  const [expandedRoomId, setExpandedRoomId] = useState(null);

  const getBedsSummary = (beds) => {
    if (!beds || beds.length === 0) return 'Sin información de camas';
    return beds.map(bed => `${bed.count} ${BED_TYPE_LABELS[bed.type] || bed.type}`).join(', ');
  };

  const handleQuantityChange = (roomId, change) => {
    const currentQuantity = selectedRooms[roomId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    // Verificar que no exceda la cantidad disponible
    const room = rooms.find(r => r.id === roomId);
    const maxQuantity = room?.quantity || 1;

    if (newQuantity <= maxQuantity) {
      onRoomsChange({
        ...selectedRooms,
        [roomId]: newQuantity
      });
    }
  };

  const getTotalRooms = () => {
    return Object.values(selectedRooms).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalCapacity = () => {
    return Object.entries(selectedRooms).reduce((total, [roomId, quantity]) => {
      const room = rooms.find(r => r.id === roomId);
      return total + (room ? room.guestCapacity * quantity : 0);
    }, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(selectedRooms).reduce((total, [roomId, quantity]) => {
      const room = rooms.find(r => r.id === roomId);
      return total + (room ? parseFloat(room.pricePerNight) * quantity : 0);
    }, 0);
  };

  const totalRooms = getTotalRooms();
  const totalCapacity = getTotalCapacity();
  const totalPrice = getTotalPrice();

  return (
    <div className="space-y-4" data-room-selector>
      {/* Header con resumen */}
      <div className="bg-primary/10 rounded-xl p-4 border-2 border-primary/20">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Selecciona tus habitaciones
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-gray-600 text-xs mb-1">Habitaciones</p>
            <p className="font-bold text-gray-900 text-lg">
              {totalRooms}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-gray-600 text-xs mb-1">Capacidad</p>
            <p className="font-bold text-gray-900 text-lg">
              {totalCapacity}
              {maxGuests && totalCapacity < maxGuests && (
                <span className="text-xs text-amber-600 ml-1">
                  / {maxGuests} necesarios
                </span>
              )}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-gray-600 text-xs mb-1">Total/noche</p>
            <p className="font-bold text-primary text-lg">
              S/ {totalPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de habitaciones */}
      <div className="space-y-3">
        {rooms.map((room) => {
          const isExpanded = expandedRoomId === room.id;
          const selectedQuantity = selectedRooms[room.id] || 0;
          const maxQuantity = room.quantity || 1;
          const price = parseFloat(room.pricePerNight);

          return (
            <div
              key={room.id}
              className={`
                border-2 rounded-xl overflow-hidden transition-all
                ${selectedQuantity > 0
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Imagen de la habitación */}
                  <div className="flex-shrink-0">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={room.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Bed size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Información principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{room.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Users size={16} />
                            {room.guestCapacity} huéspedes
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed size={16} />
                            {room.beds?.reduce((sum, bed) => sum + bed.count, 0) || 0} camas
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{getBedsSummary(room.beds)}</p>
                      </div>

                      {/* Precio */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-gray-900">
                          S/ {price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">/noche</div>
                      </div>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <button
                        onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                        className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            Ocultar detalles <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            Ver detalles <ChevronDown size={14} />
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-600">
                          {maxQuantity > 1 && `Disponibles: ${maxQuantity}`}
                        </span>
                        <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(room.id, -1)}
                            disabled={selectedQuantity === 0}
                            className="p-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Minus size={16} className="text-gray-700" />
                          </button>
                          <span className="text-lg font-semibold text-gray-900 w-8 text-center">
                            {selectedQuantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(room.id, 1)}
                            disabled={selectedQuantity >= maxQuantity}
                            className="p-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Plus size={16} className="text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal si hay habitaciones seleccionadas */}
                    {selectedQuantity > 0 && (
                      <div className="mt-2 pt-2 border-t border-primary/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {selectedQuantity} × ${price.toFixed(2)}
                          </span>
                          <span className="font-semibold text-primary">
                            ${(price * selectedQuantity).toFixed(2)} / noche
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección expandible con servicios */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3 mt-3">
                    Servicios de esta habitación
                  </h5>
                  {room.amenities && room.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {room.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check size={14} className="text-green-600 flex-shrink-0" />
                          <span className="truncate">{ROOM_AMENITY_LABELS[amenity] || amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay servicios específicos listados</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Advertencia si no alcanza la capacidad */}
      {maxGuests && totalCapacity < maxGuests && totalRooms > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-start gap-3">
          <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">
              Capacidad insuficiente
            </p>
            <p className="text-xs text-amber-800">
              Has seleccionado habitaciones con capacidad para {totalCapacity} huéspedes,
              pero necesitas {maxGuests}. Agrega más habitaciones.
            </p>
          </div>
        </div>
      )}

      {/* Mensaje de ayuda */}
      {totalRooms === 0 && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>¿Cómo funciona?</strong> Usa los botones + y - para seleccionar
            cuántas habitaciones de cada tipo necesitas. Por ejemplo: 2 dobles + 1 individual.
          </p>
        </div>
      )}
    </div>
  );
}

export default RoomQuantitySelector;
