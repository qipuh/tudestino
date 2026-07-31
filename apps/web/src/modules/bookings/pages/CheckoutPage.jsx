import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Lock, Calendar, Users, Home, ArrowLeft, Check } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import useBookingStore from '../../../store/bookingStore';
import PayPalButton from '../components/PayPalButton';
import { chargeBookingWithCulqi } from '../services/paymentService';

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createBooking, loading } = useBookingStore();

  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('culqi'); // 'culqi' | 'paypal' | 'yape' | 'plin'
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPayPalButton, setShowPayPalButton] = useState(false);

  useEffect(() => {
    // Verificar si hay usuario autenticado
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    // Obtener datos de reserva de sessionStorage
    const pending = sessionStorage.getItem('pendingBooking');
    if (!pending) {
      navigate('/');
      return;
    }

    setBookingData(JSON.parse(pending));
  }, [user, navigate]);

  const handlePayWithCulqi = async () => {
    if (!bookingData) return;

    // Verificar si Culqi está cargado
    if (typeof window.Culqi === 'undefined') {
      alert('El sistema de pagos no está disponible. Por favor recarga la página.');
      return;
    }

    // Verificar si hay clave pública configurada
    const publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY;
    if (!publicKey || publicKey === 'pk_test_your_key_here') {
      alert('Sistema de pagos no configurado. Por favor contacta con soporte.');
      console.error('Culqi public key not configured in .env file');
      return;
    }

    setProcessingPayment(true);

    try {
      // Configurar Culqi
      window.Culqi.publicKey = publicKey;

      // Configuración de Culqi. OJO: "order" espera el ID de una Orden real
      // creada contra la API de Culqi (para Yape/PagoEfectivo con
      // expiración) - un string inventado como "BOOKING-123" hace que
      // Culqi.settings() falle su propia validación y el widget nunca
      // aparezca ("No ha ingresado la configuración o no es válida").
      // Sin "order", Culqi usa el flujo simple de token (tarjeta).
      window.Culqi.settings({
        title: 'TuDestino - Reserva de Alojamiento',
        currency: 'PEN',
        amount: Math.round(bookingData.priceBreakdown.total * 100), // Culqi usa centavos
        description: `Reserva en ${bookingData.property.propertyName || 'Propiedad'}`,
      });

      // Habilitar más métodos de pago dentro del mismo modal de Culqi
      // (tarjeta sigue siendo el único que procesamos como token simple;
      // yape/billetera/bancaMovil usan su propio flujo dentro del widget).
      window.Culqi.options({
        lang: 'auto',
        installments: true,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          bancaMovil: true,
          agente: true,
          billetera: true,
          cuotealo: false,
        },
      });

      // Callback cuando se obtiene el token
      window.culqi = function () {
        if (window.Culqi.token) {
          // Token generado exitosamente
          processBooking({
            paymentMethod: 'culqi',
            paymentToken: window.Culqi.token.id,
            tokenDetails: window.Culqi.token,
          });
        } else if (window.Culqi.error) {
          // Error en el pago
          console.error('Error Culqi:', window.Culqi.error);
          alert('Error en el pago: ' + window.Culqi.error.user_message);
          setProcessingPayment(false);
        }
      };

      // Abrir el formulario de Culqi
      window.Culqi.open();
    } catch (error) {
      console.error('Error al iniciar Culqi:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
      setProcessingPayment(false);
    }
  };

  const processBooking = async (paymentData) => {
    try {
      setProcessingPayment(true);

      // Crear la reserva en el backend (aún sin cobrar)
      const bookingPayload = {
        propertyId: bookingData.propertyId,
        hostId: bookingData.hostId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        adults: bookingData.adults,
        children: bookingData.children,
        basePrice: bookingData.priceBreakdown.subtotal,
        cleaningFee: bookingData.priceBreakdown.cleaningFee,
        serviceFee: bookingData.priceBreakdown.serviceFee,
        totalPrice: bookingData.priceBreakdown.total,
        rooms: bookingData.selectedRooms,
        paymentMethod: paymentData.paymentMethod || 'culqi',
      };

      const booking = await createBooking(bookingPayload);

      // El cargo real con Culqi solo se hace server-side, con la llave
      // secreta y verificando dueño de la reserva - nunca se marca "pagada"
      // solo porque el cliente lo diga. PayPal ya cobra en su propio SDK
      // (actions.order.capture), así que ese camino no pasa por Culqi.
      if (paymentData.paymentMethod === 'culqi') {
        const chargeResult = await chargeBookingWithCulqi(booking.id, paymentData.paymentToken);
        if (!chargeResult.success) {
          throw new Error(chargeResult.message || 'No se pudo procesar el pago');
        }
      }

      // Limpiar sessionStorage
      sessionStorage.removeItem('pendingBooking');

      // Marcar como exitoso
      setPaymentSuccess(true);
      setProcessingPayment(false);

      // Redirigir a mis reservas después de 3 segundos
      setTimeout(() => {
        navigate('/bookings');
      }, 3000);
    } catch (error) {
      console.error('Error al procesar la reserva:', error);
      const message = error.response?.data?.message || error.message || 'Error al procesar la reserva. Por favor contacta con soporte.';
      alert(message);
      setProcessingPayment(false);
    }
  };

  const handlePayPalSuccess = (paymentData) => {
    console.log('PayPal payment successful:', paymentData);
    processBooking({
      ...paymentData,
      paymentMethod: 'paypal',
    });
  };

  const handlePayPalError = (error) => {
    console.error('PayPal error:', error);
    alert('Error en el pago con PayPal: ' + (error.message || 'Error desconocido'));
    setProcessingPayment(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            ¡Reserva confirmada!
          </h1>
          <p className="text-gray-600 mb-6">
            Tu reserva ha sido procesada exitosamente. Recibirás un email de confirmación.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-900">
              <strong>Propiedad:</strong> {bookingData.property.propertyName}
            </p>
            <p className="text-sm text-blue-900 mt-1">
              <strong>Fechas:</strong> {formatDate(bookingData.checkIn)} - {formatDate(bookingData.checkOut)}
            </p>
          </div>
          <Link
            to="/bookings"
            className="block w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Ver mis reservas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/properties/${bookingData.propertyId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a la propiedad
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Confirma y paga</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Información de pago */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen de la reserva */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tu reserva</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">Fechas</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(bookingData.checkIn)} - {formatDate(bookingData.checkOut)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {bookingData.priceBreakdown.nights} noche{bookingData.priceBreakdown.nights > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">Huéspedes</p>
                    <p className="text-sm text-gray-600">
                      {bookingData.adults} adulto{bookingData.adults > 1 ? 's' : ''}
                      {bookingData.children > 0 && `, ${bookingData.children} niño${bookingData.children > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Home className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">Habitaciones</p>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      {bookingData.rooms.map((room, index) => (
                        <p key={index}>
                          {room.quantity}× {room.name}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="text-primary" size={20} />
                <h2 className="text-xl font-bold text-gray-900">Pago seguro</h2>
              </div>

              <div className="space-y-3">
                {/* Culqi (Tarjeta) */}
                <button
                  onClick={() => setPaymentMethod('culqi')}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all text-left
                    ${paymentMethod === 'culqi'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${paymentMethod === 'culqi' ? 'border-primary' : 'border-gray-300'}
                    `}>
                      {paymentMethod === 'culqi' && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <CreditCard className="text-gray-700" size={24} />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Tarjeta de crédito/débito</p>
                      <p className="text-xs text-gray-600">Visa, Mastercard, American Express</p>
                    </div>
                    <img
                      src="https://culqi.com/LogosCulqi/logo-culqi.png"
                      alt="Culqi"
                      className="h-6"
                    />
                  </div>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => {
                    setPaymentMethod('paypal');
                    setShowPayPalButton(true);
                  }}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all text-left
                    ${paymentMethod === 'paypal'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${paymentMethod === 'paypal' ? 'border-primary' : 'border-gray-300'}
                    `}>
                      {paymentMethod === 'paypal' && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">PayPal</p>
                      <p className="text-xs text-gray-600">Paga con tu cuenta de PayPal</p>
                    </div>
                    <svg className="h-6" viewBox="0 0 124 33" fill="none">
                      <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z" fill="#253B80"/>
                      <path d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z" fill="#179BD7"/>
                      <path d="M7.266 29.154l.523-3.322-1.165-.027H1.061L4.927 1.292a.316.316 0 0 1 .314-.268h9.38c3.114 0 5.263.648 6.385 1.927.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644l-.012.077v.676l.526.298a3.69 3.69 0 0 1 1.065.812c.45.513.741 1.165.864 1.938.127.795.085 1.741-.123 2.812-.24 1.232-.628 2.305-1.152 3.183a6.547 6.547 0 0 1-1.825 2c-.696.494-1.523.869-2.458 1.109-.906.236-1.939.355-3.072.355h-.73c-.522 0-1.029.188-1.427.525a2.21 2.21 0 0 0-.744 1.328l-.055.299-.924 5.855-.042.215c-.011.068-.03.102-.058.125a.155.155 0 0 1-.096.035H7.266z" fill="#253B80"/>
                      <path d="M23.048 7.667c-.028.179-.06.362-.096.55-1.237 6.351-5.469 8.545-10.874 8.545H9.326c-.661 0-1.218.48-1.321 1.132L6.596 26.83l-.399 2.533a.704.704 0 0 0 .695.814h4.881c.578 0 1.069-.42 1.16-.99l.048-.248.919-5.832.059-.32c.09-.572.582-.992 1.16-.992h.73c4.729 0 8.431-1.92 9.513-7.476.452-2.321.218-4.259-.978-5.622a4.667 4.667 0 0 0-1.336-1.03z" fill="#179BD7"/>
                      <path d="M21.754 7.151a9.757 9.757 0 0 0-1.203-.267 15.284 15.284 0 0 0-2.426-.177h-7.352a1.172 1.172 0 0 0-1.159.992L8.05 17.605l-.045.289a1.336 1.336 0 0 1 1.321-1.132h2.752c5.405 0 9.637-2.195 10.874-8.545.037-.188.068-.371.096-.55a6.594 6.594 0 0 0-1.017-.429 9.045 9.045 0 0 0-.277-.087z" fill="#222D65"/>
                      <path d="M9.614 7.699a1.169 1.169 0 0 1 1.159-.991h7.352c.871 0 1.684.057 2.426.177a9.757 9.757 0 0 1 1.481.353c.365.121.704.264 1.017.429.368-2.347-.003-3.945-1.272-5.392C20.378.682 17.853 0 14.622 0h-9.38c-.66 0-1.223.48-1.325 1.133L.01 25.898a.806.806 0 0 0 .795.932h5.791l1.454-9.225 1.564-9.906z" fill="#253B80"/>
                    </svg>
                  </div>
                </button>

                {/* Yape */}
                <button
                  onClick={() => setPaymentMethod('yape')}
                  disabled
                  className="w-full p-4 rounded-lg border-2 border-gray-200 text-left opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Yape</p>
                      <p className="text-xs text-gray-600">Próximamente disponible</p>
                    </div>
                  </div>
                </button>

                {/* Plin */}
                <button
                  onClick={() => setPaymentMethod('plin')}
                  disabled
                  className="w-full p-4 rounded-lg border-2 border-gray-200 text-left opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Plin</p>
                      <p className="text-xs text-gray-600">Próximamente disponible</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* PayPal Button Container */}
              {paymentMethod === 'paypal' && showPayPalButton && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <PayPalButton
                    amount={bookingData.priceBreakdown.total}
                    currency="USD"
                    onSuccess={handlePayPalSuccess}
                    onError={handlePayPalError}
                  />
                </div>
              )}

              {/* Info de seguridad */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  <Lock size={14} className="inline mr-1" />
                  Tus datos están protegidos con encriptación SSL de 256 bits
                </p>
              </div>
            </div>

            {/* Términos y condiciones */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p className="mb-2">
                Al hacer clic en "Pagar ahora", aceptas los{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de privacidad
                </Link>
                .
              </p>
              <p>
                También aceptas la política de cancelación del anfitrión.
              </p>
            </div>
          </div>

          {/* Sidebar - Resumen de precio */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 sticky top-24">
              {/* Imagen de la propiedad */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-2">
                  {bookingData.property.propertyName}
                </h3>
                <p className="text-sm text-gray-600">
                  {bookingData.property.addressCity}, {bookingData.property.addressCountry}
                </p>
              </div>

              {/* Desglose de precios */}
              <div className="border-t border-b py-4 mb-4 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3">Detalles del precio</h4>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    S/{bookingData.priceBreakdown.basePrice} × {bookingData.priceBreakdown.nights} noche{bookingData.priceBreakdown.nights > 1 ? 's' : ''}
                  </span>
                  <span className="font-medium text-gray-900">
                    S/{bookingData.priceBreakdown.subtotal.toFixed(2)}
                  </span>
                </div>

                {bookingData.priceBreakdown.cleaningFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tarifa de limpieza</span>
                    <span className="font-medium text-gray-900">
                      S/{bookingData.priceBreakdown.cleaningFee.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tarifa de servicio</span>
                  <span className="font-medium text-gray-900">
                    S/{bookingData.priceBreakdown.serviceFee.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary">
                  S/ {bookingData.priceBreakdown.total.toFixed(2)}
                </span>
              </div>

              {/* Botón de pago - Solo mostrar si NO es PayPal */}
              {paymentMethod !== 'paypal' && (
                <>
                  <button
                    onClick={handlePayWithCulqi}
                    disabled={processingPayment}
                    className={`
                      w-full py-4 rounded-lg font-bold text-white text-lg transition-all
                      ${processingPayment
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:opacity-90 shadow-lg hover:shadow-xl'
                      }
                    `}
                  >
                    {processingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </span>
                    ) : (
                      'Pagar ahora'
                    )}
                  </button>

                  <p className="text-xs text-center text-gray-600 mt-3">
                    No se te cobrará hasta confirmar el pago
                  </p>
                </>
              )}

              {/* Mensaje para PayPal */}
              {paymentMethod === 'paypal' && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Usa el botón de PayPal en la sección de métodos de pago
                  </p>
                  <p className="text-xs text-gray-500">
                    No se te cobrará hasta que confirmes en PayPal
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
