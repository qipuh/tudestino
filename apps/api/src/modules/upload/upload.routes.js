import express from 'express';
import uploadController from './upload.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Todas las rutas de upload requieren autenticación
router.use(authenticate);

// Upload de imagen única
router.post('/:uploadType/single', (req, res, next) => {
  const handlers = uploadController.uploadSingle(req.params.uploadType);
  handlers[0](req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    handlers[1](req, res, next);
  });
});

// Upload de múltiples imágenes
router.post('/:uploadType/multiple', (req, res, next) => {
  const handlers = uploadController.uploadMultiple(req.params.uploadType);
  handlers[0](req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    handlers[1](req, res, next);
  });
});

// Eliminar imagen
router.delete('/:uploadType/:filename', uploadController.deleteImage);

export default router;
