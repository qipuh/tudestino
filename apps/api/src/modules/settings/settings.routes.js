import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { isAdmin } from '../../middleware/roles.js';
import {
  getPaymentSettings,
  updatePaymentSettings,
  getCulqiPublicKey,
  getAccommodationTypes,
  updateAccommodationTypes,
  getEmailSettings,
  updateEmailSettings,
  getWhatsAppSettings,
  updateWhatsAppSettings,
  getRoutingSettings,
  updateRoutingSettings,
  getSupportContact,
} from './settings.controller.js';

const router = express.Router();

// Públicas - web/mobile las necesitan en runtime, sin ser admin
router.get('/payment/culqi-public-key', getCulqiPublicKey);
router.get('/accommodation-types', getAccommodationTypes);
router.get('/support-contact', getSupportContact);

router.use(authenticate, isAdmin);

router.get('/payment', getPaymentSettings);
router.put('/payment', updatePaymentSettings);
router.put('/accommodation-types', updateAccommodationTypes);
router.get('/email', getEmailSettings);
router.put('/email', updateEmailSettings);
router.get('/whatsapp', getWhatsAppSettings);
router.put('/whatsapp', updateWhatsAppSettings);
router.get('/routing', getRoutingSettings);
router.put('/routing', updateRoutingSettings);

export default router;
