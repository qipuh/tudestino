import crypto from 'crypto';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

class VerificationService {
  /**
   * Genera un código de verificación de 6 dígitos
   */
  generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Calcula la fecha de expiración (10 minutos desde ahora)
   */
  getExpirationDate() {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    return expiresAt;
  }

  /**
   * Envía código de verificación por email
   */
  async sendEmailVerification(email, code, userName = '') {
    try {
      // Usar require para cargar nodemailer (CommonJS)
      const nodemailer = require('nodemailer');

      // Configurar transporter de nodemailer
      const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: smtpPort,
        secure: smtpPort === 465, // true para puerto 465, false para otros
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'TuDestino'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verifica tu correo electrónico - TuDestino',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .code-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
              .code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎉 ¡Bienvenido a TuDestino!</h1>
              </div>
              <div class="content">
                <p>Hola${userName ? ` ${userName}` : ''},</p>
                <p>Gracias por registrarte en TuDestino. Para completar tu registro, por favor verifica tu correo electrónico usando el siguiente código:</p>

                <div class="code-box">
                  <div class="code">${code}</div>
                  <p style="margin: 10px 0 0 0; color: #666;">Este código expira en 10 minutos</p>
                </div>

                <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>

                <p style="margin-top: 30px;">
                  <strong>¿Por qué verificamos tu email?</strong><br>
                  Esto nos ayuda a mantener segura tu cuenta y asegurarnos de que eres tú.
                </p>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  Saludos,<br>
                  <strong>El equipo de TuDestino</strong>
                </p>
              </div>
              <div class="footer">
                <p>© 2025 TuDestino. Todos los derechos reservados.</p>
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('📧 Email enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw new Error(`Error sending verification email: ${error.message}`);
    }
  }

  /**
   * Envía código de verificación por WhatsApp usando API de Factiliza
   */
  async sendWhatsAppVerification(phone, code, userName = '') {
    try {
      const token = process.env.FACTILIZA_TOKEN;
      const instanceName = process.env.FACTILIZA_INSTANCE;

      if (!token || !instanceName) {
        throw new Error('Factiliza credentials not configured');
      }

      // Formatear número: asegurarse que tenga código de país (51 para Perú)
      let formattedPhone = phone.replace(/\D/g, ''); // Remover caracteres no numéricos
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      if (!formattedPhone.startsWith('51')) {
        formattedPhone = '51' + formattedPhone;
      }

      const message = `🎉 *¡Bienvenido a TuDestino!*\n\nHola${userName ? ` ${userName}` : ''},\n\nTu código de verificación es:\n\n*${code}*\n\n⏱️ Este código expira en 10 minutos.\n\nSi no solicitaste este código, puedes ignorar este mensaje.\n\n_TuDestino - Tu destino perfecto te espera_ 🌎`;

      const response = await fetch(`https://apiwsp.factiliza.com/v1/message/sendtext/${instanceName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: message
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('📱 WhatsApp enviado:', formattedPhone);
        return { success: true, message: 'WhatsApp enviado exitosamente' };
      } else {
        throw new Error(data.message || 'Error enviando WhatsApp');
      }
    } catch (error) {
      console.error('❌ Error enviando WhatsApp:', error);
      throw new Error(`Error sending WhatsApp verification: ${error.message}`);
    }
  }

  /**
   * Envía código de verificación por SMS (simulado por ahora)
   * En producción integrar con Twilio, AWS SNS, o similar
   */
  async sendSMSVerification(phone, code) {
    try {
      console.log(`📱 SMS simulado enviado a ${phone}: Tu código es ${code}`);

      // TODO: Integrar con servicio SMS real
      // Por ahora solo lo logueamos

      return { success: true, message: 'SMS enviado (simulado)' };
    } catch (error) {
      console.error('❌ Error enviando SMS:', error);
      throw new Error(`Error sending verification SMS: ${error.message}`);
    }
  }

  /**
   * Verifica si un código es válido
   */
  isCodeValid(code, storedCode, expiresAt) {
    if (!storedCode || !expiresAt) {
      return { valid: false, reason: 'NO_CODE' };
    }

    if (new Date() > new Date(expiresAt)) {
      return { valid: false, reason: 'EXPIRED' };
    }

    if (code !== storedCode) {
      return { valid: false, reason: 'INVALID' };
    }

    return { valid: true };
  }
}

export default new VerificationService();
