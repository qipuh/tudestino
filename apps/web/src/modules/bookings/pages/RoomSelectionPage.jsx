import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, Edit2, Home, DollarSign, ChevronRight } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import { recommendRooms } from '../services/roomRecommendationService';
import { calculateBookingPrice } from '../services/bookingService';
import RoomQuantitySelector from '../components/RoomQuantitySelector';
import RoomRecommendation from '../components/RoomRecommendation';
import api from '../../../services/api';

function RoomSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState({});

  // Obtener parámetros de la URL (paso 1)
  const propertyId = searchParams.get('propertyId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = parseInt(searchParams.get('adults')) || 1;
  const children = parseInt(searchParams.get('children')) || 0;

  const totalGuests = adults + children;
  const rooms = property?.rooms || [];

  useEffect(() => {
    if (!propertyId || !checkIn || !checkOut) {
      navigate('/');
      return;
    }

    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const result = await api.get(`/properties/${propertyId}`);
      let propertyData = result;
      if (result.success && result.data) {
        propertyData = result.data;
      } else if (result.data) {
        propertyData = result.data;
      }
      setProperty(propertyData);
    } catch (error) {
      console.error('Error fetching property:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Calcular recomendaciones
  const recommendations = useMemo(() => {
    if (!rooms || rooms.length === 0 || adults === 0) {
      return [];
    }
    return recommendRooms(rooms, adults, children);
  }, [rooms, adults, children]);

  // Calcular totales
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
      parseFloat(property?.cleaningFee || 0)
    );
  }, [checkIn, checkOut, selectedRooms, property]);

  const handleSelectRecommendation = (recommendation) => {
    const roomSelection = {};
    recommendation.rooms.forEach(room => {
      const id = room.originalId || room.id;
      if (roomSelection[id]) {
        roomSelection[id]++;
      } else {
        roomSelection[id] = 1;
      }
    });
    setSelectedRooms(roomSelection);
  };

  const handleContinueToCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/room-selection?' + searchParams.toString());
      return;
    }

    // Validar que haya habitaciones seleccionadas
    if (getTotalRoomsSelected() === 0) {
      alert('Por favor selecciona al menos una habitación');
      return;
    }

    // Validar capacidad
    if (getTotalCapacity() < totalGuests) {
      alert(`Las habitaciones seleccionadas no tienen capacidad suficiente para ${totalGuests} huéspedes`);
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
      selectedRooms,
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const canProceed = getTotalRoomsSelected() > 0 && getTotalCapacity() >= totalGuests;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Propiedad no encontrada</h2>
          <Link to="/" className="text-primary hover:text-primary-dark">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/properties/${propertyId}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Volver a la propiedad</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Selecciona tus habitaciones</h1>
              <p className="text-sm text-gray-600">{property.propertyName || property.hotelName}</p>
            </div>
            <div className="w-32"></div> {/* Spacer para centrar */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal - Selección de habitaciones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recomendaciones */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <RoomRecommendation
                  recommendations={recommendations}
                  onSelectRecommendation={handleSelectRecommendation}
                />
              </div>
            )}

            {/* Selector de habitaciones */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <RoomQuantitySelector
                rooms={rooms}
                selectedRooms={selectedRooms}
                onRoomsChange={setSelectedRooms}
                maxGuests={totalGuests}
              />
            </div>
          </div>

          {/* Sidebar - Resumen de reserva (sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 sticky top-24">
              {/* Header del resumen */}
              <div className="bg-primary/10 p-4 border-b">
                <h3 className="font-bold text-gray-900 text-lg">Resumen de tu reserva</h3>
              </div>

              <div className="p-4 space-y-4">
                {/* Info de la propiedad */}
                <div className="pb-4 border-b">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Home size={18} className="text-primary" />
                    {property.propertyName || property.hotelName}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin size={14} />
                    {property.addressCity}, {property.addressCountry}
                  </p>
                </div>

                {/* Fechas y huéspedes */}
                <div className="space-y-3 pb-4 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Calendar size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fechas</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(checkIn)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(checkOut)}
                        </p>
                        <p className="text-xs text-primary font-medium mt-1">
                          {priceBreakdown?.nights} noche{priceBreakdown?.nights > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/properties/${propertyId}`}
                      className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                    >
                      <Edit2 size={12} />
                      Cambiar
                    </Link>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Users size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Huéspedes</p>
                        <p className="text-xs text-gray-600">
                          {adults} adulto{adults > 1 ? 's' : ''}
                          {children > 0 && `, ${children} niño${children > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/properties/${propertyId}`}
                      className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                    >
                      <Edit2 size={12} />
                      Cambiar
                    </Link>
                  </div>
                </div>

                {/* Habitaciones seleccionadas */}
                {getTotalRoomsSelected() > 0 && (
                  <div className="space-y-3 pb-4 border-b">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={18} className="text-primary" />
                      <p className="text-sm font-semibold text-gray-900">
                        Habitaciones ({getTotalRoomsSelected()})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(selectedRooms).map(([roomId, quantity]) => {
                        if (quantity === 0) return null;
                        const room = rooms.find(r => r.id === roomId);
                        if (!room) return null;
                        return (
                          <div key={roomId} className="bg-gray-50 rounded-lg p-3 border">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{room.name}</p>
                                <p className="text-xs text-gray-600">
                                  {quantity} × ${parseFloat(room.pricePerNight).toFixed(2)}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-primary">
                                ${(parseFloat(room.pricePerNight) * quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
                      Capacidad total: {getTotalCapacity()} huéspedes
                    </div>
                  </div>
                )}

                {/* Desglose de precio */}
                {priceBreakdown && getTotalRoomsSelected() > 0 && (
                  <div className="space-y-2 pb-4 border-b">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Desglose de precios</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          ${priceBreakdown.basePrice} × {priceBreakdown.nights} noche{priceBreakdown.nights > 1 ? 's' : ''}
                        </span>
                        <span className="font-medium">${priceBreakdown.subtotal.toFixed(2)}</span>
                      </div>
                      {priceBreakdown.cleaningFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Limpieza</span>
                          <span className="font-medium">${priceBreakdown.cleaningFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Servicio</span>
                        <span className="font-medium">${priceBreakdown.serviceFee.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total */}
                {priceBreakdown && getTotalRoomsSelected() > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      S/ {priceBreakdown.total.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Botón de continuar */}
                <button
                  onClick={handleContinueToCheckout}
                  disabled={!canProceed}
                  className={`
                    w-full py-4 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2
                    ${canProceed
                      ? 'bg-primary hover:opacity-90 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  Continuar al pago
                  <ChevronRight size={20} />
                </button>

                {!canProceed && getTotalRoomsSelected() === 0 && (
                  <p className="text-xs text-center text-amber-600">
                    Selecciona al menos una habitación
                  </p>
                )}

                {!canProceed && getTotalCapacity() < totalGuests && getTotalRoomsSelected() > 0 && (
                  <p className="text-xs text-center text-amber-600">
                    Necesitas más capacidad para {totalGuests} huéspedes
                  </p>
                )}

                <p className="text-xs text-center text-gray-600">
                  No se te cobrará todavía
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomSelectionPage;
