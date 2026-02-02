import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../../middleware/auth.middleware.js';
import * as verificationController from './verification.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar storage para documentos de identidad
const identityStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = path.join(__dirname, '../../../uploads/identity');
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFilename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, sanitizedFilename);
  }
});

// File filter - solo imágenes
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Configurar multer para documentos de identidad
const uploadIdentity = multer({
  storage: identityStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: imageFilter,
});

// Rutas de verificación de identidad
router.post(
  '/identity/submit',
  authenticate,
  uploadIdentity.fields([
    { name: 'documentFront', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  verificationController.uploadIdentityDocuments
);

router.get(
  '/identity/status',
  authenticate,
  verificationController.getVerificationStatus
);

export default router;
