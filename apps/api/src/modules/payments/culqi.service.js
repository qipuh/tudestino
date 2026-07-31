import { getCulqiSecretKey } from '../settings/settings.service.js';

const CULQI_API_URL = 'https://api.culqi.com/v2';

/**
 * Crea un cargo en Culqi usando un token generado en el cliente
 * (checkout.js en web, o tokenización directa contra la API en mobile).
 * La llave secreta nunca sale del servidor - se lee de la tabla settings
 * (configurable desde el panel admin) con el .env como respaldo inicial.
 */
export const createCulqiCharge = async ({ token, amount, email, description, currency = 'PEN' }) => {
  const secretKey = await getCulqiSecretKey();

  if (!secretKey) {
    throw new Error('La pasarela de pago no está configurada. Contacta al administrador.');
  }

  const response = await fetch(`${CULQI_API_URL}/charges`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency_code: currency,
      email,
      source_id: token,
      description,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.user_message || data?.merchant_message || 'Error al procesar el pago con Culqi';
    throw new Error(message);
  }

  return data;
};
