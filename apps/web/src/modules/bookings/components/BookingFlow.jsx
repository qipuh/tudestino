import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import { calculateBookingPrice } from '../services/bookingService';
import { recommendRooms } from '../services/roomRecommendationService';
import GuestSelector from './GuestSelector';
import RoomQuantitySelector from './RoomQuantitySelector';
import RoomRecommendation from './RoomRecommendation';

/**
 * Flujo de reserva en 3 pasos
 * Paso 1: Fechas y huéspedes
 * Paso 2: Selección de habitaciones
 * Paso 3: Checkout y pago
 */
function BookingFlow({ property }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const rooms = property.rooms || [];
  const hasRooms = rooms.length > 0;

  // Paso 1: Fechas y huéspedes
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Paso 2: Habitaciones
  const [selectedRooms, setSelectedRooms] = useState({}); // { roomId: quantity }

  // UI States
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingField, setSelectingField] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const totalGuests = adults + children;

  // Calcular recomendaciones
  const recommendations = useMemo(() => {
    if (!hasRooms || rooms.length === 0 || adults === 0) {
      return [];
    }
    return recommendRooms(rooms, adults, children);
  }, [rooms, adults, children, hasRooms]);

  // Calcular totales de habitaciones seleccionadas
  const getTotalRoomsSelected = () => {
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

  // Calcular desglose de precio
  const priceBreakdown = useMemo(() => {
    if (!checkIn || !checkOut) return null;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return null;

    const basePrice = getTotalPrice();
    return calculateBookingPrice(
      basePrice,
      nights,
      parseFloat(property.cleaningFee || 0)
    );
  }, [checkIn, checkOut, selectedRooms, property.cleaningFee]);

  // Validaciones por paso
  const canProceedStep1 = checkIn && checkOut && adults > 0;
  const canProceedStep2 = getTotalRoomsSelected() > 0 && getTotalCapacity() >= totalGuests;

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

  const handleSelectRecommendation = (recommendation) => {
    // Convertir recomendación a formato de selectedRooms
    const roomSelection = {};
    recommendation.rooms.forEach(room => {
      if (roomSelection[room.originalId || room.id]) {
        roomSelection[room.originalId || room.id]++;
      } else {
        roomSelection[room.originalId || room.id] = 1;
      }
    });
    setSelectedRooms(roomSelection);
  };

  const handleContinueToCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/properties/' + property.id);
      return;
    }

    // Preparar datos de reserva
    const bookingData = {
      propertyId: property.id,
      hostId: property.hostId,
      checkIn,
      checkOut,
      adults,
      children,
      guests: totalGuests,
      selectedRooms, // { roomId: quantity }
      priceBreakdown,
      property: {
        id: property.id,
        propertyName: property.propertyName || property.hotelName,
        addressCity: property.addressCity,
        addressCountry: property.addressCountry,
      },
      rooms: Object.entries(selectedRooms).map(([roomId, quantity]) => {
        const room = rooms.find(r => r.id === roomId);
        return {
          id: roomId,
          name: room?.name,
          quantity,
          pricePerNight: room?.pricePerNight,
          guestCapacity: room?.guestCapacity,
        };
      }),
    };

    // Guardar en sessionStorage y navegar a checkout
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    navigate('/checkout');
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

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
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const steps = [
    { number: 1, label: 'Fechas y huéspedes', completed: canProceedStep1 },
    { number: 2, label: 'Habitaciones', completed: false },
    { number: 3, label: 'Pago', completed: false },
  ];

  return (
    <div className="border rounded-xl shadow-lg bg-white sticky top-24">
      {/* Progress Steps */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all
                    ${currentStep === step.number
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : step.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {step.completed ? <Check size={16} /> : step.number}
                </div>
                <span className={`text-xs mt-1 text-center ${currentStep === step.number ? 'font-semibold text-primary' : 'text-gray-600'}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {/* PASO 1: Fechas y Huéspedes */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">¿Cuándo deseas hospedarte?</h3>

            {/* Fechas */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-2">
                <div
                  className="p-3 border-r cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => {
                    setSelectingField('checkIn');
                    setShowCalendar(true);
                  }}
                >
                  <label className="text-xs font-semibold block mb-1 text-gray-700">CHECK-IN</label>
                  <div className="text-sm font-medium text-gray-900">
                    {checkIn ? formatDate(checkIn) : 'Seleccionar'}
                  </div>
                </div>
                <div
                  className="p-3 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => {
                    if (checkIn) {
                      setSelectingField('checkOut');
                      setShowCalendar(true);
                    }
                  }}
                >
                  <label className="text-xs font-semibold block mb-1 text-gray-700">CHECK-OUT</label>
                  <div className="text-sm font-medium text-gray-900">
                    {checkOut ? formatDate(checkOut) : 'Seleccionar'}
                  </div>
                </div>
              </div>
            </div>

            {/* Huéspedes */}
            <div className="border rounded-lg p-4">
              <label className="text-xs font-semibold block mb-3 text-gray-700">HUÉSPEDES</label>
              <GuestSelector
                adults={adults}
                children={children}
                onUpdate={({ adults: newAdults, children: newChildren }) => {
                  setAdults(newAdults);
                  setChildren(newChildren);
                }}
                maxGuests={100}
              />
            </div>

            {/* Resumen */}
            {checkIn && checkOut && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>{Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} noches</strong> para <strong>{totalGuests} huésped{totalGuests > 1 ? 'es' : ''}</strong>
                </p>
              </div>
            )}

            <button
              onClick={() => {
                if (!user) {
                  const params = new URLSearchParams({
                    propertyId: property.id,
                    checkIn,
                    checkOut,
                    adults: adults.toString(),
                    children: children.toString(),
                  });
                  navigate('/login?redirect=/room-selection?' + params.toString());
                  return;
                }

                // Navegar a la página de selección de habitaciones
                const params = new URLSearchParams({
                  propertyId: property.id,
                  checkIn,
                  checkOut,
                  adults: adults.toString(),
                  children: children.toString(),
                });
                navigate('/room-selection?' + params.toString());
              }}
              disabled={!canProceedStep1}
              className={`
                w-full py-3 rounded-lg font-semibold text-white transition-all
                ${canProceedStep1
                  ? 'bg-primary hover:bg-primary-dark'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              Continuar a selección de habitaciones
            </button>
          </div>
        )}

      </div>

      {/* Calendario Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectingField === 'checkIn' ? 'Fecha de entrada' : 'Fecha de salida'}
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
    </div>
  );
}

export default BookingFlow;
