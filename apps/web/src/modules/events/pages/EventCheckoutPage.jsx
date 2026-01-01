import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Lock, Calendar, Clock, MapPin, ArrowLeft, Check, Ticket, User, Mail, Phone } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

function EventCheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('culqi');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhone: '',
    specialRequests: ''
  });

  useEffect(() => {
    // Verificar si hay usuario autenticado
    if (!user) {
      navigate('/login?redirect=/events/checkout');
      return;
    }

    // Obtener datos de registro de sessionStorage
    const pending = sessionStorage.getItem('pendingEventRegistration');
    if (!pending) {
      navigate('/events');
      return;
    }

    const data = JSON.parse(pending);
    setCheckoutData(data);

    // Pre-llenar formulario con datos del usuario
    setFormData({
      attendeeName: user.name || user.username || '',
      attendeeEmail: user.email || '',
      attendeePhone: user.phone || '',
      specialRequests: ''
    });
  }, [user, navigate]);

  const processRegistration = async (paymentData) => {
    try {
      setProcessingPayment(true);

      const token = localStorage.getItem('token');

      // Crear una registración por cada ticket seleccionado
      for (const ticket of checkoutData.tickets) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/events/${checkoutData.eventId}/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              eventId: checkoutData.eventId,
              ticketId: ticket.id,
              quantity: ticket.quantity,
              attendeeName: formData.attendeeName,
              attendeeEmail: formData.attendeeEmail,
              attendeePhone: formData.attendeePhone || null,
              specialRequests: formData.specialRequests || null,
              totalAmount: ticket.currentPrice * ticket.quantity,
              currency: 'PEN',
              paymentStatus: paymentData.paymentMethod === 'free' ? 'paid' : 'pending',
              paymentMethod: paymentData.paymentMethod,
              transactionId: paymentData.transactionId || null
            })
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al registrarse');
        }
      }

      setPaymentSuccess(true);
      sessionStorage.removeItem('pendingEventRegistration');

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate(`/events/${checkoutData.eventId}`);
      }, 3000);

    } catch (error) {
      console.error('Error al procesar registro:', error);
      alert('Error al procesar el registro: ' + error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayWithCulqi = async () => {
    if (!checkoutData) return;

    // Si el total es 0 (tickets gratis), registrar directamente
    if (checkoutData.total === 0) {
      await processRegistration({
        paymentMethod: 'free'
      });
      return;
    }

    // Verificar si Culqi está cargado
    if (typeof window.Culqi === 'undefined') {
      alert('El sistema de pagos no está disponible. Por favor recarga la página.');
      return;
    }

    const publicKey = import.meta.env.VITE_CULQI_PUBLIC_KEY;
    if (!publicKey || publicKey === 'pk_test_your_key_here') {
      alert('Sistema de pagos no configurado. Por favor contacta con soporte.');
      return;
    }

    setProcessingPayment(true);

    try {
      window.Culqi.publicKey = publicKey;

      window.Culqi.settings({
        title: 'TuDestino - Registro a Evento',
        currency: 'PEN',
        amount: Math.round(checkoutData.total * 100),
        order: `EVENT-${Date.now()}`,
        description: `Registro a ${checkoutData.eventData.name}`,
      });

      window.culqi = function () {
        if (window.Culqi.token) {
          processRegistration({
            paymentMethod: 'culqi',
            transactionId: window.Culqi.token.id,
          });
        } else if (window.Culqi.error) {
          console.error('Error Culqi:', window.Culqi.error);
          alert('Error en el pago: ' + window.Culqi.error.user_message);
          setProcessingPayment(false);
        }
      };

      window.Culqi.open();
    } catch (error) {
      console.error('Error al iniciar Culqi:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Registro exitoso!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu registro ha sido confirmado. Recibirás un email con los detalles y tu código QR.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirigiendo...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/events/${checkoutData.eventId}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-4"
          >
            <ArrowLeft size={20} />
            Volver al evento
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout de Evento</h1>
          <p className="text-gray-600 mt-1">Completa tu registro al evento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del evento */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Información del evento</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">{checkoutData.eventData.name}</h3>

                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={18} className="text-primary" />
                  <span>{formatDate(checkoutData.eventData.eventDate)}</span>
                </div>

                {checkoutData.eventData.startTime && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={18} className="text-primary" />
                    <span>{formatTime(checkoutData.eventData.startTime)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={18} className="text-primary" />
                  <span>{checkoutData.eventData.location}</span>
                </div>
              </div>
            </div>

            {/* Información del asistente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Información del asistente</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-1" />
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.attendeeName}
                    onChange={(e) => setFormData({ ...formData, attendeeName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.attendeeEmail}
                    onChange={(e) => setFormData({ ...formData, attendeeEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={formData.attendeePhone}
                    onChange={(e) => setFormData({ ...formData, attendeePhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solicitudes especiales (opcional)
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: Necesito silla de ruedas, tengo alergias alimentarias, etc."
                  />
                </div>
              </div>
            </div>

            {/* Método de pago */}
            {checkoutData.total > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💳 Método de pago</h2>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-primary rounded-lg cursor-pointer bg-primary/5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="culqi"
                      checked={paymentMethod === 'culqi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="mr-2 text-primary" size={20} />
                    <span className="font-medium">Tarjeta de Crédito/Débito (Culqi)</span>
                  </label>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Lock className="text-blue-600 mt-0.5" size={16} />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Pago seguro</p>
                        <p className="text-blue-700">Tus datos están protegidos con encriptación SSL</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Resumen del pedido</h2>

              <div className="space-y-3 mb-4">
                {checkoutData.tickets.map((ticket, index) => (
                  <div key={index} className="flex justify-between items-start pb-3 border-b border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ticket.name}</p>
                      <p className="text-sm text-gray-600">
                        {ticket.quantity} x S/ {ticket.currentPrice.toFixed(2)}
                      </p>
                      {ticket.activePhase && (
                        <p className="text-xs text-green-600 font-medium">
                          {ticket.activePhase.name}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">
                      S/ {(ticket.quantity * ticket.currentPrice).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-300 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    S/ {checkoutData.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {checkoutData.tickets.reduce((sum, t) => sum + t.quantity, 0)} ticket(s)
                </p>
              </div>

              <button
                onClick={handlePayWithCulqi}
                disabled={processingPayment || !formData.attendeeName || !formData.attendeeEmail}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : checkoutData.total === 0 ? (
                  <>
                    <Check size={18} />
                    Confirmar registro gratis
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Pagar S/ {checkoutData.total.toFixed(2)}
                  </>
                )}
              </button>

              {(!formData.attendeeName || !formData.attendeeEmail) && (
                <p className="text-xs text-red-600 text-center mt-3">
                  Completa los campos requeridos
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCheckoutPage;
