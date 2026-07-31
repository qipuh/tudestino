import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../middleware/errorHandler.js';
import User from '../users/user.model-mysql.js';
import verificationService from './verification.service.js';

class AuthService {
  async register(userData) {
    const { email, password, name, role, phone, country_code } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generar código de verificación
    const verificationCode = verificationService.generateCode();
    const verificationExpires = verificationService.getExpirationDate();

    // Crear usuario
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'guest',
      phone: phone || null,
      countryCode: country_code || null,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
      verificationStatus: 'pending',
    });

    // Enviar código de verificación por email
    try {
      await verificationService.sendEmailVerification(email, verificationCode, name);
    } catch (verificationError) {
      console.error('Error sending verification:', verificationError);
      // No lanzar error, el usuario se creó exitosamente
    }

    // Generar token (aunque no esté verificado, puede navegar)
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        emailVerified: false,
        verificationStatus: 'pending',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      message: 'Usuario creado. Por favor verifica tu email.',
    };
  }

  async login({ email, password }) {
    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generar token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        emailVerified: user.emailVerified,
        verificationStatus: user.verificationStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async verifyEmail(token) {
    // TODO: Implementar verificación de email
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email) {
    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return {
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
      };
    }

    // Generar token seguro usando crypto
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash del token para almacenar en BD
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Establecer expiración (1 hora)
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token y expiración en BD
    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: resetExpires,
    });

    // Crear URL de reset
    const resetUrl = `${process.env.WEB_URL}/reset-password?token=${resetToken}&email=${email}`;

    try {
      await verificationService.sendPasswordResetEmail(email, resetUrl, user.name);
    } catch (error) {
      // No revelar el fallo de envío al usuario (mismo mensaje genérico
      // de siempre) - pero sí dejarlo en el log para que un admin lo note.
      console.error('Error enviando email de recuperación:', error.message);
    }

    return {
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
    };
  }

  async resetPassword(data) {
    const { email, token, newPassword } = data;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Token inválido o expirado', 400);
    }

    // Verificar que tenga token de reset
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new AppError('Token inválido o expirado', 400);
    }

    // Verificar que no haya expirado
    if (new Date() > user.resetPasswordExpires) {
      throw new AppError('El token ha expirado', 400);
    }

    // Verificar token
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
      throw new AppError('Token inválido o expirado', 400);
    }

    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña y limpiar token
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return {
      message: 'Contraseña restablecida exitosamente',
    };
  }

  async sendEmailVerificationCode(email) {
    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Si ya está verificado
    if (user.emailVerified) {
      throw new AppError('El email ya está verificado', 400);
    }

    // Generar código
    const code = verificationService.generateCode();
    const expiresAt = verificationService.getExpirationDate();

    // Guardar código en la BD
    await user.update({
      emailVerificationCode: code,
      emailVerificationExpires: expiresAt,
    });

    await verificationService.sendEmailVerification(email, code, user.name);

    return {
      message: 'Código enviado exitosamente',
      expiresAt,
    };
  }

  async verifyEmailCode(email, code) {
    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar código
    const validation = verificationService.isCodeValid(
      code,
      user.emailVerificationCode,
      user.emailVerificationExpires
    );

    if (!validation.valid) {
      const messages = {
        NO_CODE: 'No hay código de verificación pendiente',
        EXPIRED: 'El código ha expirado',
        INVALID: 'Código inválido',
      };
      throw new AppError(messages[validation.reason] || 'Error de verificación', 400);
    }

    // Marcar como verificado
    await user.update({
      emailVerified: true,
      verificationStatus: 'email_verified',
      emailVerificationCode: null,
      emailVerificationExpires: null,
    });

    // Generar token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        emailVerified: true,
        verificationStatus: 'email_verified',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async sendPhoneVerificationCode(userId, phone) {
    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Generar código
    const code = verificationService.generateCode();
    const expiresAt = verificationService.getExpirationDate();

    // Guardar código en la BD
    await user.update({
      phone: phone,
      phone_verification_code: code,
      phone_verification_expires: expiresAt,
    });

    // Enviar SMS
    await verificationService.sendSMSVerification(phone, code);

    return {
      message: 'Código enviado exitosamente',
      expiresAt,
    };
  }

  async verifyPhoneCode(userId, code) {
    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar código
    const validation = verificationService.isCodeValid(
      code,
      user.phone_verification_code,
      user.phone_verification_expires
    );

    if (!validation.valid) {
      const messages = {
        NO_CODE: 'No hay código de verificación pendiente',
        EXPIRED: 'El código ha expirado',
        INVALID: 'Código inválido',
      };
      throw new AppError(messages[validation.reason] || 'Error de verificación', 400);
    }

    // Marcar como verificado
    await user.update({
      phone_verified: true,
      verification_status: 'phone_verified',
      phone_verification_code: null,
      phone_verification_expires: null,
    });

    return {
      user: {
        id: user.id,
        phone_verified: true,
        verification_status: 'phone_verified',
      },
    };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}

export const authService = new AuthService();
