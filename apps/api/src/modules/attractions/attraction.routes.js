import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import attractionController from './attraction.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { isAdmin } from '../../middleware/roles.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer para attractions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../uploads/attractions/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attraction-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Rutas públicas
router.get('/', attractionController.getAttractions);

// Rutas protegidas (solo admin) - DEBEN IR ANTES de /:id
router.get('/admin/all', authenticate, isAdmin, attractionController.getAllAttractions);

// Ruta con parámetro ID (debe ir al final)
router.get('/:id', attractionController.getAttraction);
router.post('/', authenticate, isAdmin, upload.single('coverImage'), attractionController.createAttraction);
router.put('/:id', authenticate, isAdmin, upload.single('coverImage'), attractionController.updateAttraction);
router.delete('/:id', authenticate, isAdmin, attractionController.deleteAttraction);

// Galería
router.post('/:id/gallery', authenticate, isAdmin, upload.array('images', 20), attractionController.uploadGalleryImages);
router.delete('/:id/gallery/:imageId', authenticate, isAdmin, attractionController.deleteGalleryImage);

// Tags
router.post('/:id/tags', authenticate, isAdmin, attractionController.addTag);
router.delete('/:id/tags/:tagId', authenticate, isAdmin, attractionController.removeTag);

export default router;
