import * as verificationService from './verification.service.js';

/**
 * Controlador de verificación de identidad
 */

/**
 * Subir documentos de identidad para verificación
 * POST /api/verification/identity/submit
 */
export const uploadIdentityDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, documentNumber } = req.body;

    // Validar que se hayan subido ambos archivos
    if (!req.files || !req.files.documentFront || !req.files.selfie) {
      return res.status(400).json({
        success: false,
        message: 'Debes subir tanto el documento de identidad como la selfie',
      });
    }

    // Validar tipo de documento
    const validDocumentTypes = ['DNI', 'Pasaporte', 'Carné de Extranjería', 'Licencia de Conducir'];
    if (!validDocumentTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de documento inválido',
      });
    }

    // Validar número de documento
    if (!documentNumber || documentNumber.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Número de documento inválido',
      });
    }

    const verificationData = {
      documentType,
      documentNumber: documentNumber.trim(),
      documentFrontPath: req.files.documentFront[0].filename,
      selfiePath: req.files.selfie[0].filename,
    };

    const result = await verificationService.submitIdentityVerification(userId, verificationData);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error en uploadIdentityDocuments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al procesar la solicitud de verificación',
    });
  }
};

/**
 * Obtener estado de verificación del usuario actual
 * GET /api/verification/identity/status
 */
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const status = await verificationService.getVerificationStatus(userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error en getVerificationStatus:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener el estado de verificación',
    });
  }
};

export default {
  uploadIdentityDocuments,
  getVerificationStatus,
};
