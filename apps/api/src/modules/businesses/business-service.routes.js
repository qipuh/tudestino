import express from 'express';
import businessServiceController from './business-service.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Rutas públicas
 */

// Obtener un servicio específico por ID
router.get('/services/:serviceId', businessServiceController.getServiceById);

// Obtener servicios de un negocio
router.get('/:businessId/services', businessServiceController.getServicesByBusiness);

/**
 * Rutas protegidas (requieren autenticación)
 */

// Aplicar middleware de autenticación a las rutas protegidas de servicios
router.use(authenticate);

// Crear servicio para un negocio
router.post('/:businessId/services', businessServiceController.createService);

// Actualizar servicio
router.put('/services/:serviceId', businessServiceController.updateService);

// Eliminar servicio
router.delete('/services/:serviceId', businessServiceController.deleteService);

// Reordenar servicios
router.post('/:businessId/services/reorder', businessServiceController.reorderServices);

// Cambiar estado de servicio (activar/desactivar)
router.patch('/services/:serviceId/toggle', businessServiceController.toggleServiceStatus);

export default router;
