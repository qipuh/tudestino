import express from 'express';
import { getLocation, searchBusinesses, getLocationSuggestions, searchAll } from './search.controller.js';

const router = express.Router();

// GET /api/search/location - Obtener ubicación del usuario por IP
router.get('/location', getLocation);

// GET /api/search/all - Búsqueda unificada de todos los tipos de negocios
router.get('/all', searchAll);

// GET /api/search/businesses - Búsqueda de negocios
router.get('/businesses', searchBusinesses);

// GET /api/search/suggestions - Autocompletado de ubicaciones
router.get('/suggestions', getLocationSuggestions);

export default router;
