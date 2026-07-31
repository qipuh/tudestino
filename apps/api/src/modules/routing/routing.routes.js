import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import * as routingController from './routing.controller.js';

const router = express.Router();

// Autenticado - evita abuso anónimo de la cuota diaria compartida de ORS
// (2500 solicitudes/día entre geocoding y ruteo).
router.use(authenticate);

router.get('/geocode', routingController.geocode);
router.get('/directions', routingController.getDirections);

export default router;
