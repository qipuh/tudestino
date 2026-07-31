import * as settingsService from './settings.service.js';
import verificationService from '../auth/verification.service.js';

export const getPaymentSettings = async (req, res) => {
  try {
    const settings = await settingsService.getPaymentSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Endpoint público - la llave pública de Culqi está pensada para vivir en
// código cliente (web/mobile), no es un secreto.
export const getCulqiPublicKey = async (req, res) => {
  try {
    const culqiPublicKey = await settingsService.getCulqiPublicKey();
    res.json({ success: true, data: { culqiPublicKey } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentSettings = async (req, res) => {
  try {
    const { culqiPublicKey, culqiSecretKey } = req.body;
    const settings = await settingsService.updatePaymentSettings({ culqiPublicKey, culqiSecretKey });
    res.json({ success: true, message: 'Configuración de pagos actualizada', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Pública - la app/web necesitan las etiquetas y qué tipos están
// habilitados para mostrar el selector al crear una propiedad.
export const getAccommodationTypes = async (req, res) => {
  try {
    const types = await settingsService.getAccommodationTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAccommodationTypes = async (req, res) => {
  try {
    const types = await settingsService.updateAccommodationTypes(req.body.types);
    res.json({ success: true, message: 'Tipos de alojamiento actualizados', data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmailSettings = async (req, res) => {
  try {
    const settings = await settingsService.getEmailSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmailSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateEmailSettings(req.body);
    res.json({ success: true, message: 'Configuración de correo actualizada', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Envía un correo real con la config guardada (no simulado) - así el admin
// confirma que el SMTP realmente funciona en vez de confiar en un "guardado
// exitoso" que no prueba que las credenciales sirven.
export const sendTestEmail = async (req, res) => {
  try {
    const to = req.body?.to || req.user?.email;
    if (!to) {
      return res.status(400).json({ success: false, message: 'Falta el correo de destino' });
    }

    const { transporter, fromEmail, fromName } = await verificationService.getTransporter();

    if (!fromEmail) {
      return res.status(400).json({ success: false, message: 'Configura el SMTP antes de enviar una prueba' });
    }

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: 'Correo de prueba - TuDestino',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #034EA2;">✅ Configuración de correo funcionando</h2>
          <p>Este es un correo de prueba enviado desde el panel de administración de TuDestino.</p>
          <p style="color: #78716C; font-size: 13px;">Si recibiste este mensaje, el SMTP está correctamente configurado.</p>
        </div>
      `,
    });

    res.json({ success: true, message: `Correo de prueba enviado a ${to}`, messageId: info.messageId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWhatsAppSettings = async (req, res) => {
  try {
    const settings = await settingsService.getWhatsAppSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWhatsAppSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateWhatsAppSettings(req.body);
    res.json({ success: true, message: 'Configuración de WhatsApp actualizada', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoutingSettings = async (req, res) => {
  try {
    const settings = await settingsService.getRoutingSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoutingSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateRoutingSettings(req.body);
    res.json({ success: true, message: 'Configuración de ruteo actualizada', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Pública - para que web/mobile muestren contacto de soporte real
export const getSupportContact = async (req, res) => {
  try {
    const contact = await settingsService.getSupportContact();
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
