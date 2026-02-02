import User from '../modules/users/user.model-mysql.js';
import { AppError } from './errorHandler.js';

/**
 * Fecha desde la cual la verificación de identidad es obligatoria
 * Usuarios creados antes de esta fecha NO requieren verificación (grandfathering)
 * Usuarios creados después de esta fecha SÍ requieren verificación
 */
const VERIFICATION_REQUIRED_FROM = new Date('2026-02-01');

/**
 * Middleware que requiere verificación de identidad
 * Solo aplica a usuarios nuevos (creados después de VERIFICATION_REQUIRED_FROM)
 * Los usuarios antiguos pueden usar la plataforma sin verificación
 */
export const requireVerifiedIdentity = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Obtener usuario de la base de datos
    const user = await User.findByPk(userId, {
      attributes: ['id', 'identityStatus', 'identityVerified', 'createdAt'],
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // GRANDFATHERING: Usuarios antiguos (pre-deploy) no requieren verificación
    if (new Date(user.createdAt) < VERIFICATION_REQUIRED_FROM) {
      return next();
    }

    // Usuarios nuevos (post-deploy): verificar identidad
    if (!user.identityVerified || user.identityStatus !== 'verified') {
      // Retornar error 403 con código específico para que el frontend lo maneje
      return res.status(403).json({
        success: false,
        code: 'IDENTITY_NOT_VERIFIED',
        message: 'Debes verificar tu identidad para realizar esta acción',
        data: {
          status: user.identityStatus,
          isVerified: user.identityVerified,
        },
      });
    }

    // Usuario verificado, continuar
    next();
  } catch (error) {
    console.error('Error en requireVerifiedIdentity:', error);
    next(error);
  }
};

/**
 * Middleware opcional de verificación
 * No bloquea, solo añade información de verificación a req
 */
export const checkVerificationStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'identityStatus', 'identityVerified', 'createdAt'],
    });

    if (user) {
      const isOldUser = new Date(user.createdAt) < VERIFICATION_REQUIRED_FROM;
      req.verificationInfo = {
        status: user.identityStatus,
        isVerified: user.identityVerified,
        requiresVerification: !isOldUser,
      };
    }

    next();
  } catch (error) {
    console.error('Error en checkVerificationStatus:', error);
    // No bloquear en caso de error
    next();
  }
};

export default {
  requireVerifiedIdentity,
  checkVerificationStatus,
};
