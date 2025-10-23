import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useBookingStore from '../../../store/bookingStore';
import useAuthStore from '../../../store/authStore';
import { calculateBookingPrice } from '../services/bookingService';
import { recommendRooms } from '../services/roomRecommendationService';
import GuestSelector from './GuestSelector';
import RoomRecommendation from './RoomRecommendation';

function BookingCard({ property, preSelectedRoomId, selectedRoomIds = [], selectionMode = 'single' }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createBooking, checkAvailability, loading } = useBookingStore();

  // Determinar si la propiedad tiene habitaciones
  const rooms = property.rooms || [];
  const hasRooms = rooms.length > 0;

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Usar preSelectedRoomId o selectedRoomIds según el modo
  const selectedRoomId = selectionMode === 'single'
    ? (preSelectedRoomId || (hasRooms ? rooms[0]?.id : null))
    : null;
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingField, setSelectingField] = useState(null); // 'checkIn' | 'checkOut'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAvailable, setIsAvailable] = useState(true);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  // Calcular recomendaciones cuando cambien adults o children
  const recommendations = useMemo(() => {
    if (!hasRooms || rooms.length === 0 || adults === 0) {
      return [];
    }

    return recommendRooms(rooms, adults, children);
  }, [rooms, adults, children, hasRooms]);

  // Obtener el precio base según si hay habitaciones o no
  const getBasePrice = () => {
    if (hasRooms) {
      if (selectionMode === 'multiple' && selectedRoomIds.length > 0) {
        // Sumar precios de todas las habitaciones seleccionadas
        return selectedRoomIds.reduce((total, roomId) => {
          const room = rooms.find(r => r.id === roomId);
          return total + (room ? parseFloat(room.pricePerNight) : 0);
        }, 0);
      } else if (selectedRoomId) {
        const selectedRoom = rooms.find(r => r.id === selectedRoomId);
        return selectedRoom ? parseFloat(selectedRoom.pricePerNight) : 0;
      }
    }
    return parseFloat(property.basePrice || 0);
  };

  // Calcular precio cuando cambien las fechas o habitación seleccionada
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (nights > 0) {
        const basePrice = getBasePrice();
        const breakdown = calculateBookingPrice(
          basePrice,
          nights,
          parseFloat(property.cleaningFee || 0)
        );
        setPriceBreakdown(breakdown);
      }
    } else {
      setPriceBreakdown(null);
    }
  }, [checkIn, checkOut, selectedRoomId, selectedRoomIds, selectionMode, property.basePrice, property.cleaningFee]);

  // Verificar disponibilidad cuando cambien las fechas
  useEffect(() => {
    const verify = async () => {
      if (checkIn && checkOut) {
        try {
          console.log('🔍 Verificando disponibilidad:', { propertyId: property.id, checkIn, checkOut });
          const available = await checkAvailability(property.id, checkIn, checkOut);
          console.log('✅ Disponibilidad:', available);
          setIsAvailable(available);
        } catch (error) {
          console.error('❌ Error verificando disponibilidad:', error);
          // En caso de error, asumir que está disponible para no bloquear al usuario
          setIsAvailable(true);
        }
      } else {
        // Si no hay fechas seleccionadas, resetear a disponible
        setIsAvailable(true);
      }
    };
    verify();
  }, [checkIn, checkOut, property.id, checkAvailability]);

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];

    if (selectingField === 'checkIn') {
      setCheckIn(formattedDate);
      setCheckOut('');
      setSelectingField('checkOut');
    } else if (selectingField === 'checkOut') {
      if (new Date(formattedDate) > new Date(checkIn)) {
        setCheckOut(formattedDate);
        setShowCalendar(false);
        setSelectingField(null);
      }
    }
  };

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut || !isAvailable) {
      return;
    }

    // Validar selección de habitación si la propiedad tiene habitaciones
    if (hasRooms) {
      if (selectionMode === 'single' && !selectedRoomId) {
        alert('Por favor selecciona una habitación');
        return;
      }
      if (selectionMode === 'multiple' && selectedRoomIds.length === 0) {
        alert('Por favor selecciona al menos una habitación');
        return;
      }
    }

    try {
      // Validar que tenemos todos los datos necesarios
      if (!property.hostId) {
        throw new Error('La propiedad no tiene un host asignado');
      }

      const totalGuests = adults + children;

      const bookingData = {
        propertyId: property.id,
        hostId: property.hostId,
        checkIn,
        checkOut,
        guests: totalGuests,
        adults,
        children,
        basePrice: priceBreakdown.subtotal,
        cleaningFee: priceBreakdown.cleaningFee,
        serviceFee: priceBreakdown.serviceFee,
        totalPrice: priceBreakdown.total,
        ...(hasRooms && { roomId: selectedRoomId }), // Incluir roomId si hay habitaciones
      };

      console.log('📤 Enviando reserva:', bookingData);
      const result = await createBooking(bookingData);
      console.log('✅ Reserva creada:', result);
      navigate('/bookings');
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      console.error('Error details:', error.response?.data || error.message);

      // Mostrar mensaje más específico
      let errorMessage = 'Error al crear la reserva';
      if (error.response?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  const handleSelectRecommendation = (recommendation) => {
    // Esta función se llamaría desde PropertyDetail ya que necesitamos actualizar el selectedRoomId
    // Por ahora mostraremos un alert con la información
    const roomNames = recommendation.rooms.map(r => r.name).join(', ');
    alert(`Esta opción requiere: ${roomNames}\n\nPor favor selecciona estas habitaciones manualmente desde la sección "Habitaciones disponibles" arriba.`);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Días del mes anterior para completar la primera semana
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    return days;
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateInRange = (date) => {
    if (!checkIn || !checkOut) return false;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return date >= start && date <= end;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  // Obtener información de la habitación seleccionada
  const selectedRoom = hasRooms && selectedRoomId ? rooms.find(r => r.id === selectedRoomId) : null;
  const currentPrice = getBasePrice();
  const maxGuestsForRoom = selectedRoom ? selectedRoom.guestCapacity : (property.maxGuests || 10);

  return (
    <div className="border rounded-xl shadow-lg p-6 sticky top-24">
      {/* Precio */}
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-2xl font-bold">
          ${currentPrice > 0 ? currentPrice.toFixed(2) : '0.00'}
        </span>
        <span className="text-gray-600"> / noche</span>
      </div>

      {/* Habitación(es) seleccionada(s) */}
      {hasRooms && selectionMode === 'single' && selectedRoom && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Habitación seleccionada</span>
            <span className="text-xs text-gray-500">Cambia abajo</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{selectedRoom.name}</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Capacidad: {selectedRoom.guestCapacity} huéspedes</p>
            {selectedRoom.beds && selectedRoom.beds.length > 0 && (
              <p>• Camas: {selectedRoom.beds.map(b => `${b.count} ${b.type}`).join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Múltiples habitaciones seleccionadas */}
      {hasRooms && selectionMode === 'multiple' && selectedRoomIds.length > 0 && (
        <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {selectedRoomIds.length} habitación{selectedRoomIds.length > 1 ? 'es' : ''} seleccionada{selectedRoomIds.length > 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-500">Cambia abajo</span>
          </div>
          <div className="space-y-2">
            {selectedRoomIds.map(roomId => {
              const room = rooms.find(r => r.id === roomId);
              if (!room) return null;
              return (
                <div key={roomId} className="text-xs bg-white p-2 rounded border border-primary/20">
                  <p className="font-medium text-gray-900">{room.name}</p>
                  <p className="text-gray-600">
                    {room.guestCapacity} huéspedes · ${parseFloat(room.pricePerNight).toFixed(2)}/noche
                  </p>
                </div>
              );
            })}
            <p className="text-xs text-gray-600 mt-2">
              Capacidad total: {selectedRoomIds.reduce((total, roomId) => {
                const room = rooms.find(r => r.id === roomId);
                return total + (room ? room.guestCapacity : 0);
              }, 0)} huéspedes
            </p>
          </div>
        </div>
      )}

      {/* Mensaje si no hay habitación seleccionada */}
      {hasRooms && ((selectionMode === 'single' && !selectedRoomId) || (selectionMode === 'multiple' && selectedRoomIds.length === 0)) && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Por favor selecciona {selectionMode === 'multiple' ? 'las habitaciones' : 'una habitación'} abajo para continuar con la reserva
          </p>
        </div>
      )}

      {/* Formulario de reserva */}
      <div className="border rounded-lg">
        {/* Fechas */}
        <div className="grid grid-cols-2 border-b">
          <div
            className="p-3 border-r cursor-pointer hover:bg-gray-50"
            onClick={() => {
              setSelectingField('checkIn');
              setShowCalendar(true);
            }}
          >
            <label className="text-xs font-semibold block mb-1">CHECK-IN</label>
            <div className="text-sm">{checkIn ? formatDate(checkIn) : 'Añadir fecha'}</div>
          </div>
          <div
            className="p-3 cursor-pointer hover:bg-gray-50"
            onClick={() => {
              if (checkIn) {
                setSelectingField('checkOut');
                setShowCalendar(true);
              }
            }}
          >
            <label className="text-xs font-semibold block mb-1">CHECKOUT</label>
            <div className="text-sm">{checkOut ? formatDate(checkOut) : 'Añadir fecha'}</div>
          </div>
        </div>

        {/* Huéspedes */}
        <div className="p-3">
          <label className="text-xs font-semibold block mb-2">HUÉSPEDES</label>
          <GuestSelector
            adults={adults}
            children={children}
            onUpdate={({ adults: newAdults, children: newChildren }) => {
              setAdults(newAdults);
              setChildren(newChildren);
            }}
            maxGuests={maxGuestsForRoom}
          />
          {hasRooms && selectedRoom && (adults + children) > selectedRoom.guestCapacity && (
            <p className="text-xs text-red-600 mt-2">
              Esta habitación admite máximo {selectedRoom.guestCapacity} huéspedes
            </p>
          )}
        </div>
      </div>

      {/* Recomendaciones inteligentes */}
      {hasRooms && recommendations.length > 0 && (
        <RoomRecommendation
          recommendations={recommendations}
          onSelectRecommendation={handleSelectRecommendation}
        />
      )}

      {/* Calendario */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectingField === 'checkIn' ? 'Selecciona fecha de entrada' : 'Selecciona fecha de salida'}
              </h3>
              <button onClick={() => setShowCalendar(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Navegación del mes */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="font-semibold">
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </div>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((day, index) => {
                const disabled = isDateDisabled(day.date);
                const inRange = isDateInRange(day.date);
                const isCheckInDate = checkIn && day.date.toISOString().split('T')[0] === checkIn;
                const isCheckOutDate = checkOut && day.date.toISOString().split('T')[0] === checkOut;

                return (
                  <button
                    key={index}
                    onClick={() => !disabled && day.isCurrentMonth && handleDateSelect(day.date)}
                    disabled={disabled || !day.isCurrentMonth}
                    className={`
                      aspect-square p-2 text-sm rounded-full
                      ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                      ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                      ${inRange ? 'bg-primary bg-opacity-10' : ''}
                      ${isCheckInDate || isCheckOutDate ? 'bg-primary text-white hover:bg-primary' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de disponibilidad */}
      {checkIn && checkOut && !isAvailable && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Las fechas seleccionadas no están disponibles</p>
        </div>
      )}

      {/* Desglose de precio */}
      {priceBreakdown && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="underline">
              ${priceBreakdown.basePrice} × {priceBreakdown.nights} {priceBreakdown.nights === 1 ? 'noche' : 'noches'}
            </span>
            <span>${priceBreakdown.subtotal.toFixed(2)}</span>
          </div>
          {priceBreakdown.cleaningFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="underline">Tarifa de limpieza</span>
              <span>${priceBreakdown.cleaningFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="underline">Tarifa de servicio</span>
            <span>${priceBreakdown.serviceFee.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>${priceBreakdown.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Botón de reserva */}
      <button
        onClick={handleReserve}
        disabled={!checkIn || !checkOut || !isAvailable || loading}
        className={`
          w-full mt-6 py-3 rounded-lg font-semibold text-white
          ${!checkIn || !checkOut || !isAvailable || loading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-primary hover:bg-primary-dark'}
        `}
      >
        {loading ? 'Procesando...' : user ? 'Reservar' : 'Iniciar sesión para reservar'}
      </button>

      {user && (
        <p className="text-center text-sm text-gray-600 mt-3">No se te cobrará todavía</p>
      )}
    </div>
  );
}

export default BookingCard;
