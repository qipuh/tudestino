import * as billingService from './billing.service.js';

export const createInvoice = async (req, res) => {
  try {
    const { bookingId, extraLineItems, taxRate } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId es requerido' });
    }
    const invoice = await billingService.createInvoice({ bookingId, extraLineItems, taxRate }, req.user);
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const invoice = await billingService.getInvoice(req.params.id, req.user);
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const listInvoices = async (req, res) => {
  try {
    const { status, bookingId } = req.query;
    const invoices = await billingService.listInvoices(req.params.businessId, { status, bookingId }, req.user);
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const getGuestLedger = async (req, res) => {
  try {
    const ledger = await billingService.getGuestLedger(req.params.bookingId, req.user);
    res.json({ success: true, data: ledger });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const addPayment = async (req, res) => {
  try {
    const { method, amount, reference } = req.body;
    if (!method || amount == null) {
      return res.status(400).json({ success: false, message: 'method y amount son requeridos' });
    }
    const payment = await billingService.addPayment(
      { invoiceId: req.params.id, method, amount: Number(amount), reference },
      req.user
    );
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const issueRefund = async (req, res) => {
  try {
    const { method, amount, reason } = req.body;
    if (!method || amount == null) {
      return res.status(400).json({ success: false, message: 'method y amount son requeridos' });
    }
    const payment = await billingService.issueRefund(
      { invoiceId: req.params.id, method, amount: Number(amount), reason },
      req.user
    );
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const openCashRegister = async (req, res) => {
  try {
    const { businessId, openingFloat } = req.body;
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'businessId es requerido' });
    }
    const register = await billingService.openCashRegister({ businessId, openingFloat: Number(openingFloat) || 0 }, req.user);
    res.status(201).json({ success: true, data: register });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const closeCashRegister = async (req, res) => {
  try {
    const { countedCash, notes } = req.body;
    if (countedCash == null) {
      return res.status(400).json({ success: false, message: 'countedCash es requerido' });
    }
    const register = await billingService.closeCashRegister(req.params.id, { countedCash: Number(countedCash), notes }, req.user);
    res.json({ success: true, data: register });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const getCurrentCashRegister = async (req, res) => {
  try {
    const register = await billingService.getCurrentCashRegister(req.params.businessId, req.user);
    res.json({ success: true, data: register });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
