import { useState } from 'react';
import { Bed, Users, Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { BED_TYPE_LABELS, ROOM_AMENITY_LABELS } from '@tudestino/shared';

function RoomSelector({ rooms, selectedRoomId, onSelectRoom, multiSelect = false, selectedRoomIds = [] }) {
  const [expandedRoomId, setExpandedRoomId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalRoomId, setModalRoomId] = useState(null);

  const getBedsSummary = (beds) => {
    if (!beds || beds.length === 0) return 'Sin información de camas';
    return beds.map(bed => `${bed.count} ${BED_TYPE_LABELS[bed.type] || bed.type}`).join(', ');
  };

  const getAmenitiesCount = (amenities) => {
    return amenities ? amenities.length : 0;
  };

  const handleShowDetails = (roomId) => {
    setModalRoomId(roomId);
    setShowDetailsModal(true);
  };

  const modalRoom = showDetailsModal ? rooms.find(r => r.id === modalRoomId) : null;

  return (
    <div className="space-y-4" data-room-selector>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {multiSelect ? 'Selecciona habitaciones' : 'Selecciona una habitación'}
        </h3>
        {multiSelect && selectedRoomIds.length > 0 && (
          <span className="text-sm text-gray-600">
            {selectedRoomIds.length} habitación{selectedRoomIds.length > 1 ? 'es' : ''} seleccionada{selectedRoomIds.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rooms.map((room) => {
          const isSelected = multiSelect
            ? selectedRoomIds.includes(room.id)
            : selectedRoomId === room.id;
          const isExpanded = expandedRoomId === room.id;
          const price = parseFloat(room.pricePerNight);

          return (
            <div
              key={room.id}
              className={`
                border-2 rounded-xl transition-all cursor-pointer
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div
                onClick={() => onSelectRoom(room.id)}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-4">
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
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{room.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users size={16} />
                            {room.guestCapacity} huéspedes
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed size={16} />
                            {room.beds?.reduce((sum, bed) => sum + bed.count, 0) || 0} camas
                          </span>
                        </div>
                      </div>

                      {/* Checkbox de selección */}
                      <div className="flex-shrink-0">
                        <div
                          className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center
                            ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}
                          `}
                        >
                          {isSelected && <Check size={16} className="text-white" />}
                        </div>
                      </div>
                    </div>

                    {/* Resumen de camas */}
                    <p className="text-xs text-gray-500 mb-2">{getBedsSummary(room.beds)}</p>

                    {/* Precio y botones */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-900">
                          S/{price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-600">/noche</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowDetails(room.id);
                          }}
                          className="text-xs text-primary hover:text-primary-dark font-medium underline"
                        >
                          Ver detalles
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRoomId(isExpanded ? null : room.id);
                          }}
                          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              Ocultar <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              Servicios <ChevronDown size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección expandible con servicios */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t pt-3 bg-gray-50">
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">
                    Servicios de esta habitación ({getAmenitiesCount(room.amenities)})
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

      {/* Modal de detalles completos */}
      {showDetailsModal && modalRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{modalRoom.name}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Galería de imágenes */}
            {modalRoom.images && modalRoom.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 p-6">
                {modalRoom.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${modalRoom.name} - ${index + 1}`}
                    className={`
                      w-full object-cover rounded-lg
                      ${index === 0 ? 'col-span-2 h-64' : 'h-40'}
                    `}
                  />
                ))}
                {modalRoom.images.length > 4 && (
                  <div className="col-span-2 text-center text-sm text-gray-600">
                    +{modalRoom.images.length - 4} fotos más
                  </div>
                )}
              </div>
            )}

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users size={24} className="mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Capacidad</p>
                  <p className="font-semibold">{modalRoom.guestCapacity} huéspedes</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed size={24} className="mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600">Camas</p>
                  <p className="font-semibold">
                    {modalRoom.beds?.reduce((sum, bed) => sum + bed.count, 0) || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-gray-600">Precio</p>
                  <p className="text-2xl font-bold text-primary">
                    S/{parseFloat(modalRoom.pricePerNight).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">por noche</p>
                </div>
              </div>

              {/* Configuración de camas */}
              {modalRoom.beds && modalRoom.beds.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Configuración de camas
                  </h3>
                  <div className="space-y-2">
                    {modalRoom.beds.map((bed, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Bed size={20} className="text-gray-600" />
                          <span className="font-medium">
                            {BED_TYPE_LABELS[bed.type] || bed.type}
                          </span>
                        </div>
                        <span className="text-gray-600">× {bed.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servicios */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Servicios incluidos ({getAmenitiesCount(modalRoom.amenities)})
                </h3>
                {modalRoom.amenities && modalRoom.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {modalRoom.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Check size={18} className="text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {ROOM_AMENITY_LABELS[amenity] || amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay servicios específicos listados para esta habitación</p>
                )}
              </div>

              {/* Botón de selección */}
              <button
                onClick={() => {
                  onSelectRoom(modalRoom.id);
                  setShowDetailsModal(false);
                }}
                className={`
                  w-full py-4 rounded-xl font-semibold text-white transition
                  ${selectedRoomId === modalRoom.id
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-primary hover:bg-primary-dark'
                  }
                `}
              >
                {selectedRoomId === modalRoom.id
                  ? '✓ Habitación seleccionada'
                  : 'Seleccionar esta habitación'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomSelector;
