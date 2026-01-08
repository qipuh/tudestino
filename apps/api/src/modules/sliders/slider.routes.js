import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import sliderController from './slider.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { isAdmin } from '../../middleware/roles.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer para sliders
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../uploads/sliders/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slider-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
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
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Rutas públicas
router.get('/', sliderController.getSliders);

// Rutas protegidas (solo admin) - DEBEN IR ANTES de /:id
router.get('/admin/all', authenticate, isAdmin, sliderController.getAllSliders);
router.put('/order/update', authenticate, isAdmin, sliderController.updateOrder);

// Ruta con parámetro ID (debe ir al final)
router.get('/:id', sliderController.getSlider);
router.post('/', authenticate, isAdmin, upload.single('image'), sliderController.createSlider);
router.put('/:id', authenticate, isAdmin, upload.single('image'), sliderController.updateSlider);
router.delete('/:id', authenticate, isAdmin, sliderController.deleteSlider);

export default router;
