import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import {
  createInvoice,
  getInvoice,
  listInvoices,
  getGuestLedger,
  addPayment,
  issueRefund,
  openCashRegister,
  closeCashRegister,
  getCurrentCashRegister,
} from './billing.controller.js';

const router = express.Router();

router.use(authenticate, authorize('host', 'business_owner', 'admin'));

router.post('/invoices', createInvoice);
router.get('/invoices/:id', getInvoice);
router.post('/invoices/:id/payments', addPayment);
router.post('/invoices/:id/refunds', issueRefund);

router.get('/business/:businessId/invoices', listInvoices);
router.get('/business/:businessId/cash-register', getCurrentCashRegister);

router.get('/bookings/:bookingId/ledger', getGuestLedger);

router.post('/cash-registers', openCashRegister);
router.post('/cash-registers/:id/close', closeCashRegister);

export default router;
