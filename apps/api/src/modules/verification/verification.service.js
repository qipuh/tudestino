import User from '../users/user.model-mysql.js';
import Notification from '../notifications/notification.model.js';

/**
 * Servicio de verificación de identidad
 */

/**
 * Enviar solicitud de verificación de identidad
 */
export const submitIdentityVerification = async (userId, verificationData) => {
  try {
    const { documentType, documentNumber, documentFrontPath, selfiePath } = verificationData;

    // Actualizar usuario con datos de verificación
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si ya está verificado, no permitir nueva solicitud
    if (user.identityStatus === 'verified') {
      throw new Error('Tu identidad ya ha sido verificada');
    }

    // Actualizar datos de verificación
    await user.update({
      documentType,
      documentNumber,
      documentFrontPhoto: documentFrontPath,
      selfiePhoto: selfiePath,
      identityStatus: 'pending',
      identityVerified: false,
    });

    // Notificar a los admins
    await notifyAdminsNewVerification(userId);

    return {
      success: true,
      message: 'Solicitud de verificación enviada. Revisaremos tu documentación pronto.',
      status: 'pending',
    };
  } catch (error) {
    console.error('Error en submitIdentityVerification:', error);
    throw error;
  }
};

/**
 * Obtener estado de verificación del usuario
 */
export const getVerificationStatus = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'identityStatus',
        'identityVerified',
        'identityVerifiedAt',
        'documentType',
        'documentNumber',
        'createdAt',
      ],
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      userId: user.id,
      status: user.identityStatus,
      isVerified: user.identityVerified,
      verifiedAt: user.identityVerifiedAt,
      documentType: user.documentType,
      documentNumber: user.documentNumber,
      accountCreatedAt: user.createdAt,
    };
  } catch (error) {
    console.error('Error en getVerificationStatus:', error);
    throw error;
  }
};

/**
 * Notificar a todos los administradores sobre nueva solicitud de verificación
 */
export const notifyAdminsNewVerification = async (userId) => {
  try {
    // Buscar todos los usuarios con rol admin
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id'],
    });

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email'],
    });

    if (!user) return;

    // Crear notificación para cada admin
    const notifications = admins.map((admin) => ({
      userId: admin.id,
      actorId: userId,
      type: 'verification_pending',
      title: 'Nueva solicitud de verificación',
      message: `${user.name} (${user.email}) ha enviado una solicitud de verificación de identidad`,
      relatedId: userId,
      metadata: {
        userName: user.name,
        userEmail: user.email,
      },
    }));

    await Notification.bulkCreate(notifications);
  } catch (error) {
    console.error('Error en notifyAdminsNewVerification:', error);
    // No lanzar error para no bloquear el flujo principal
  }
};

/**
 * Aprobar verificación de identidad (solo admin)
 */
export const approveVerification = async (userId, adminId) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.identityStatus === 'verified') {
      throw new Error('Este usuario ya está verificado');
    }

    // Actualizar estado de verificación
    await user.update({
      identityStatus: 'verified',
      identityVerified: true,
      identityVerifiedAt: new Date(),
    });

    // Notificar al usuario que su verificación fue aprobada
    await Notification.create({
      userId,
      actorId: adminId,
      type: 'identity_verified',
      title: 'Identidad verificada',
      message: 'Tu identidad ha sido verificada exitosamente. Ahora puedes acceder a todas las funcionalidades de la plataforma.',
    });

    return {
      success: true,
      message: 'Verificación aprobada exitosamente',
    };
  } catch (error) {
    console.error('Error en approveVerification:', error);
    throw error;
  }
};

/**
 * Rechazar verificación de identidad (solo admin)
 */
export const rejectVerification = async (userId, adminId, reason) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizar estado de verificación
    await user.update({
      identityStatus: 'rejected',
      identityVerified: false,
    });

    // Notificar al usuario que su verificación fue rechazada
    await Notification.create({
      userId,
      actorId: adminId,
      type: 'identity_rejected',
      title: 'Verificación rechazada',
      message: `Tu solicitud de verificación ha sido rechazada. Razón: ${reason}`,
      metadata: {
        reason,
      },
    });

    return {
      success: true,
      message: 'Verificación rechazada',
    };
  } catch (error) {
    console.error('Error en rejectVerification:', error);
    throw error;
  }
};

/**
 * Obtener lista de verificaciones pendientes (solo admin)
 */
export const getPendingVerifications = async () => {
  try {
    const pendingUsers = await User.findAll({
      where: { identityStatus: 'pending' },
      attributes: [
        'id',
        'name',
        'email',
        'documentType',
        'documentNumber',
        'documentFrontPhoto',
        'selfiePhoto',
        'createdAt',
      ],
      order: [['createdAt', 'ASC']],
    });

    return pendingUsers;
  } catch (error) {
    console.error('Error en getPendingVerifications:', error);
    throw error;
  }
};

export default {
  submitIdentityVerification,
  getVerificationStatus,
  notifyAdminsNewVerification,
  approveVerification,
  rejectVerification,
  getPendingVerifications,
};
