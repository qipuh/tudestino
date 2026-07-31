import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ruta esperada del service account (no confundir con google-services.json,
// que es config de cliente Android - esto es la credencial de servidor
// para poder ENVIAR pushes, generada en Firebase Console > Project Settings
// > Service Accounts > Generate new private key).
const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, '../../firebase-service-account.json');

let messaging = null;

export const initFirebaseAdmin = async () => {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.log('ℹ️  Firebase Admin no inicializado: falta firebase-service-account.json (push notifications deshabilitadas)');
    return;
  }

  try {
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    const { getMessaging } = await import('firebase-admin/messaging');
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

    const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });

    messaging = getMessaging(app);
    console.log('✅ Firebase Admin inicializado (push notifications habilitadas)');
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error.message);
  }
};

/**
 * Envía un push a un usuario. Silencioso si Firebase no está configurado
 * o si el usuario no tiene fcmToken (nunca abrió la app en un dispositivo
 * con permisos concedidos) - nunca debe tumbar el flujo que la llama.
 */
export const sendPushNotification = async (fcmToken, { title, message, data = {} }) => {
  if (!messaging || !fcmToken) return;

  try {
    await messaging.send({
      token: fcmToken,
      notification: { title, body: message },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
    });
  } catch (error) {
    console.error('Error enviando push notification:', error.message);
  }
};
