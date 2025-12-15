import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  uploadImages,
} from './properties.controller.js';
import {
  registerProperty,
  updatePropertyFull,
  updatePropertyConfig,
  getPropertyFull,
} from './property.controller.register.js';
import {
  addRoom,
  updateRoom,
  deleteRoom,
  getRooms,
  getRoomById,
} from './room.controller.js';

const router = express.Router();

// RUTAS ESPECÍFICAS PRIMERO (antes de rutas con parámetros)

// Ruta pública: listar todas las propiedades
router.get('/', getProperties);

// Rutas protegidas con nombre específico (ANTES de /:id)
router.get('/my-properties', authenticate, authorize('host', 'admin', 'business_owner'), async (req, res) => {
  try {
    const { Property, Room } = await import('./property.model.sequelize.js');
    const properties = await Property.findAll({
      where: { hostId: req.user.id },
      include: [
        {
          model: Room,
          as: 'rooms',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Error fetching my properties:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Nueva ruta para registrar propiedad completa con habitaciones
router.post('/register', authenticate, authorize('host', 'admin', 'business_owner'), registerProperty);

router.post('/', authenticate, authorize('host', 'admin', 'business_owner'), createProperty);

// RUTAS CON PARÁMETROS AL FINAL
// Rutas para propiedad completa con habitaciones
router.get('/:id/full', getPropertyFull);
router.put('/:id/full', authenticate, authorize('host', 'admin'), updatePropertyFull);

// Rutas para gestión de habitaciones individuales
router.get('/:propertyId/rooms', getRooms);
router.get('/:propertyId/rooms/:roomId', getRoomById);
router.post('/:propertyId/rooms', authenticate, authorize('host', 'admin'), addRoom);
router.put('/:propertyId/rooms/:roomId', authenticate, authorize('host', 'admin'), updateRoom);
router.delete('/:propertyId/rooms/:roomId', authenticate, authorize('host', 'admin'), deleteRoom);

// Ruta pública: ver detalle de propiedad
router.get('/:id', getPropertyById);

// Rutas protegidas con parámetros
// Nueva ruta para actualizar solo configuración (sin tocar habitaciones)
router.put('/:id', authenticate, authorize('host', 'admin'), updatePropertyConfig);
router.delete('/:id', authenticate, authorize('host', 'admin'), deleteProperty);
router.post('/:id/images', authenticate, authorize('host', 'admin'), uploadImages);

export default router;
