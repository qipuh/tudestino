import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { isAdmin } from '../../middleware/roles.js';
import { search, importPlaces } from './places.controller.js';

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/search', search);
router.post('/import', importPlaces);

export default router;
