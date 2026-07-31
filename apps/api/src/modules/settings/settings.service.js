import Setting from './setting.model.js';

export const getSetting = async (key, fallback = null) => {
  const row = await Setting.findByPk(key);
  if (row && row.value) return row.value;
  return fallback;
};

export const setSetting = async (key, value) => {
  await Setting.upsert({ key, value });
};

const mask = (value) => {
  if (!value) return null;
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 8)}${'•'.repeat(8)}${value.slice(-4)}`;
};

export const getPaymentSettings = async () => {
  const culqiPublicKey = await getSetting('culqi_public_key', process.env.CULQI_PUBLIC_KEY || null);
  const culqiSecretKey = await getSetting('culqi_secret_key', process.env.CULQI_SECRET_KEY || null);

  return {
    culqiPublicKey,
    culqiSecretKeyMasked: mask(culqiSecretKey),
    culqiSecretKeyConfigured: !!culqiSecretKey,
  };
};

export const updatePaymentSettings = async ({ culqiPublicKey, culqiSecretKey }) => {
  if (culqiPublicKey !== undefined) {
    await setSetting('culqi_public_key', culqiPublicKey);
  }
  // El secret solo se actualiza si mandan un valor nuevo - así el admin no
  // tiene que repegarlo cada vez que solo quiere cambiar la llave pública.
  if (culqiSecretKey) {
    await setSetting('culqi_secret_key', culqiSecretKey);
  }
  return getPaymentSettings();
};

/**
 * Llave secreta real para usar al momento de cobrar - nunca se expone al
 * cliente (a diferencia de getPaymentSettings, que enmascara el secreto).
 */
export const getCulqiSecretKey = async () => {
  return getSetting('culqi_secret_key', process.env.CULQI_SECRET_KEY || null);
};

export const getCulqiPublicKey = async () => {
  return getSetting('culqi_public_key', process.env.CULQI_PUBLIC_KEY || null);
};

// accommodationType es un ENUM fijo en la tabla hotel_properties (no una
// tabla aparte) - cambiar los valores en sí requeriría una migración de
// esquema. Lo que SÍ es seguro editar sin tocar el ENUM es la etiqueta
// visible y si el tipo está habilitado para elegir al crear una propiedad.
const DEFAULT_ACCOMMODATION_TYPES = {
  apartment: { label: 'Apartamento', enabled: true },
  hotel: { label: 'Hotel', enabled: true },
  motel: { label: 'Motel', enabled: true },
  hostel: { label: 'Hostal', enabled: true },
  room: { label: 'Habitación', enabled: true },
  house: { label: 'Casa', enabled: true },
  villa: { label: 'Villa', enabled: true },
  cabin: { label: 'Cabaña', enabled: true },
  resort: { label: 'Resort', enabled: true },
  bed_and_breakfast: { label: 'Bed & Breakfast', enabled: true },
  guesthouse: { label: 'Casa de huéspedes', enabled: true },
};

export const getAccommodationTypes = async () => {
  const raw = await getSetting('accommodation_types', null);
  if (!raw) return DEFAULT_ACCOMMODATION_TYPES;

  try {
    const saved = JSON.parse(raw);
    // Merge con los defaults - si se agrega un valor nuevo al ENUM en el
    // futuro, aparece igual aunque no esté guardado todavía.
    return { ...DEFAULT_ACCOMMODATION_TYPES, ...saved };
  } catch {
    return DEFAULT_ACCOMMODATION_TYPES;
  }
};

export const updateAccommodationTypes = async (types) => {
  await setSetting('accommodation_types', JSON.stringify(types));
  return getAccommodationTypes();
};

// ==================== EMAIL (SMTP) ====================

export const getEmailSettings = async () => {
  const [smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, fromName, supportEmail] = await Promise.all([
    getSetting('smtp_host', process.env.SMTP_HOST || null),
    getSetting('smtp_port', process.env.SMTP_PORT || '587'),
    getSetting('smtp_user', process.env.SMTP_USER || null),
    getSetting('smtp_pass', process.env.SMTP_PASS || null),
    getSetting('email_from', process.env.EMAIL_FROM || null),
    getSetting('email_from_name', process.env.EMAIL_FROM_NAME || 'TuDestino'),
    getSetting('support_email', process.env.EMAIL_FROM || 'soporte@tudestino.pe'),
  ]);

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPassMasked: mask(smtpPass),
    smtpPassConfigured: !!smtpPass,
    fromEmail,
    fromName,
    supportEmail,
  };
};

export const updateEmailSettings = async ({ smtpHost, smtpPort, smtpUser, smtpPass, fromEmail, fromName, supportEmail }) => {
  if (smtpHost !== undefined) await setSetting('smtp_host', smtpHost);
  if (smtpPort !== undefined) await setSetting('smtp_port', String(smtpPort));
  if (smtpUser !== undefined) await setSetting('smtp_user', smtpUser);
  if (smtpPass) await setSetting('smtp_pass', smtpPass);
  if (fromEmail !== undefined) await setSetting('email_from', fromEmail);
  if (fromName !== undefined) await setSetting('email_from_name', fromName);
  if (supportEmail !== undefined) await setSetting('support_email', supportEmail);
  return getEmailSettings();
};

/**
 * Config real (sin enmascarar) para armar el transporter de nodemailer -
 * solo se usa server-side al enviar correos.
 */
export const getEmailTransportConfig = async () => {
  const [host, port, user, pass, fromEmail, fromName] = await Promise.all([
    getSetting('smtp_host', process.env.SMTP_HOST || null),
    getSetting('smtp_port', process.env.SMTP_PORT || '587'),
    getSetting('smtp_user', process.env.SMTP_USER || null),
    getSetting('smtp_pass', process.env.SMTP_PASS || null),
    getSetting('email_from', process.env.EMAIL_FROM || null),
    getSetting('email_from_name', process.env.EMAIL_FROM_NAME || 'TuDestino'),
  ]);

  return { host, port: parseInt(port) || 587, user, pass, fromEmail: fromEmail || user, fromName };
};

// ==================== WHATSAPP ====================

export const getWhatsAppSettings = async () => {
  const [factilizaToken, factilizaInstance, supportPhone] = await Promise.all([
    getSetting('factiliza_token', process.env.FACTILIZA_TOKEN || null),
    getSetting('factiliza_instance', process.env.FACTILIZA_INSTANCE || null),
    getSetting('support_phone', '+51999999999'),
  ]);

  return {
    factilizaTokenMasked: mask(factilizaToken),
    factilizaTokenConfigured: !!factilizaToken,
    factilizaInstance,
    supportPhone,
  };
};

export const updateWhatsAppSettings = async ({ factilizaToken, factilizaInstance, supportPhone }) => {
  if (factilizaToken) await setSetting('factiliza_token', factilizaToken);
  if (factilizaInstance !== undefined) await setSetting('factiliza_instance', factilizaInstance);
  if (supportPhone !== undefined) await setSetting('support_phone', supportPhone);
  return getWhatsAppSettings();
};

export const getFactilizaConfig = async () => {
  const [token, instance] = await Promise.all([
    getSetting('factiliza_token', process.env.FACTILIZA_TOKEN || null),
    getSetting('factiliza_instance', process.env.FACTILIZA_INSTANCE || null),
  ]);
  return { token, instance };
};

// ==================== RUTEO (OpenRouteService) ====================

export const getRoutingSettings = async () => {
  const orsApiKey = await getSetting('ors_api_key', process.env.ORS_API_KEY || null);
  return {
    orsApiKeyMasked: mask(orsApiKey),
    orsApiKeyConfigured: !!orsApiKey,
  };
};

export const updateRoutingSettings = async ({ orsApiKey }) => {
  if (orsApiKey) await setSetting('ors_api_key', orsApiKey);
  return getRoutingSettings();
};

/**
 * Llave real de ORS - nunca se expone al cliente (el móvil solo llama a
 * nuestros propios endpoints /api/routing/*, nunca a ORS directo).
 */
export const getOrsApiKey = async () => {
  return getSetting('ors_api_key', process.env.ORS_API_KEY || null);
};

// Pública - web/mobile la usan para mostrar contacto de soporte real en
// vez de tenerlo hardcodeado en el código cliente.
export const getSupportContact = async () => {
  const [supportEmail, supportPhone] = await Promise.all([
    getSetting('support_email', process.env.EMAIL_FROM || 'soporte@tudestino.pe'),
    getSetting('support_phone', '+51999999999'),
  ]);
  return { supportEmail, supportPhone };
};
