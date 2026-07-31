import crypto from 'crypto';
import { createRequire } from 'module';
import { getEmailTransportConfig, getFactilizaConfig } from '../settings/settings.service.js';
const require = createRequire(import.meta.url);

class VerificationService {
  /**
   * Arma el transporter de nodemailer con la config guardada en el panel
   * admin (tabla settings), con las variables de entorno como respaldo.
   */
  async getTransporter() {
    const nodemailer = require('nodemailer');
    const config = await getEmailTransportConfig();

    const transporter = nodemailer.createTransport({
      host: config.host || 'smtp.gmail.com',
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    return { transporter, fromEmail: config.fromEmail, fromName: config.fromName };
  }

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
      const { transporter, fromEmail, fromName } = await this.getTransporter();

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
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
   * Envía email con el link para restablecer contraseña. Antes esto solo
   * se logueaba a consola (TODO nunca implementado) - "recuperación de
   * contraseña" no le llegaba nunca al usuario en producción.
   */
  async sendPasswordResetEmail(email, resetUrl, userName = '') {
    try {
      const { transporter, fromEmail, fromName } = await this.getTransporter();

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: 'Restablece tu contraseña - TuDestino',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🔐 Restablece tu contraseña</h1>
              </div>
              <div class="content">
                <p>Hola${userName ? ` ${userName}` : ''},</p>
                <p>Recibimos una solicitud para restablecer tu contraseña en TuDestino. Haz clic en el siguiente botón para continuar:</p>
                <p style="text-align: center;">
                  <a href="${resetUrl}" class="button">Restablecer contraseña</a>
                </p>
                <p style="color: #666; font-size: 13px;">Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este mensaje - tu contraseña seguirá siendo la misma.</p>
              </div>
              <div class="footer">
                <p>© 2026 TuDestino. Todos los derechos reservados.</p>
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('📧 Email de recuperación enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      throw new Error(`Error sending password reset email: ${error.message}`);
    }
  }

  /**
   * Envía código de verificación por WhatsApp usando API de Factiliza
   */
  async sendWhatsAppVerification(phone, code, userName = '') {
    try {
      const { token, instance: instanceName } = await getFactilizaConfig();

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

      console.log('📱 Factiliza response:', data);

      // La API de Factiliza retorna success:true o un mensaje de éxito
      if (data.success || data.message === 'Mensaje Enviado' || response.ok) {
        console.log('📱 WhatsApp enviado exitosamente a:', formattedPhone);
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
