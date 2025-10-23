import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';

/**
 * Componente de botón de PayPal
 * Maneja la integración con PayPal SDK
 */
function PayPalButton({ amount, currency = 'USD', onSuccess, onError }) {
  const paypalRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId) {
      setError('PayPal no está configurado');
      setLoading(false);
      return;
    }

    // Verificar si PayPal SDK ya está cargado
    if (window.paypal) {
      renderPayPalButton();
      return;
    }

    // Cargar PayPal SDK dinámicamente
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.async = true;

    script.onload = () => {
      renderPayPalButton();
    };

    script.onerror = () => {
      setError('Error al cargar PayPal');
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Limpiar script si el componente se desmonta
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [amount, currency]);

  const renderPayPalButton = () => {
    if (!window.paypal || !paypalRef.current) return;

    // Limpiar botones anteriores
    paypalRef.current.innerHTML = '';

    window.paypal
      .Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 45,
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: currency,
                },
                description: 'Reserva de alojamiento en TuDestino',
              },
            ],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
            },
          });
        },
        onApprove: async (data, actions) => {
          try {
            const order = await actions.order.capture();
            console.log('PayPal payment successful:', order);

            if (onSuccess) {
              onSuccess({
                orderId: order.id,
                payerId: order.payer.payer_id,
                status: order.status,
                amount: order.purchase_units[0].amount.value,
                currency: order.purchase_units[0].amount.currency_code,
                paymentMethod: 'paypal',
              });
            }
          } catch (error) {
            console.error('Error capturing PayPal order:', error);
            if (onError) {
              onError(error);
            }
          }
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          if (onError) {
            onError(err);
          }
        },
        onCancel: () => {
          console.log('PayPal payment cancelled');
          if (onError) {
            onError({ message: 'Pago cancelado por el usuario' });
          }
        },
      })
      .render(paypalRef.current)
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error rendering PayPal button:', err);
        setError('Error al renderizar el botón de PayPal');
        setLoading(false);
      });
  };

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-gray-600">Cargando PayPal...</span>
        </div>
      )}
      <div ref={paypalRef} className={loading ? 'opacity-0' : 'opacity-100 transition-opacity'} />
    </div>
  );
}

export default PayPalButton;
