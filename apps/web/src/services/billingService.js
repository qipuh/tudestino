import api from './api';

export const createInvoice = async ({ bookingId, extraLineItems, taxRate }) => {
  const response = await api.post('/billing/invoices', { bookingId, extraLineItems, taxRate });
  return response.data;
};

export const getInvoice = async (id) => {
  const response = await api.get(`/billing/invoices/${id}`);
  return response.data;
};

export const listInvoices = async (businessId, filters = {}) => {
  const response = await api.get(`/billing/business/${businessId}/invoices`, { params: filters });
  return response.data;
};

export const getGuestLedger = async (bookingId) => {
  const response = await api.get(`/billing/bookings/${bookingId}/ledger`);
  return response.data;
};

export const addPayment = async (invoiceId, { method, amount, reference }) => {
  const response = await api.post(`/billing/invoices/${invoiceId}/payments`, { method, amount, reference });
  return response.data;
};

export const issueRefund = async (invoiceId, { method, amount, reason }) => {
  const response = await api.post(`/billing/invoices/${invoiceId}/refunds`, { method, amount, reason });
  return response.data;
};

export const getCurrentCashRegister = async (businessId) => {
  const response = await api.get(`/billing/business/${businessId}/cash-register`);
  return response.data;
};

export const openCashRegister = async (businessId, openingFloat) => {
  const response = await api.post('/billing/cash-registers', { businessId, openingFloat });
  return response.data;
};

export const closeCashRegister = async (registerId, { countedCash, notes }) => {
  const response = await api.post(`/billing/cash-registers/${registerId}/close`, { countedCash, notes });
  return response.data;
};
