export const validateCreatePayment = (data) => {
  const errors = {};
  if (!data.reservationId) errors.reservationId = 'Reservation ID required';
  if (!data.gatewayProvider) errors.gatewayProvider = 'Gateway provider required';
  if (!data.gatewayTransactionId) errors.gatewayTransactionId = 'Gateway TX ID required';
  if (!data.grossAmount || data.grossAmount <= 0) errors.grossAmount = 'Amount required, positive';
  return Object.keys(errors).length > 0 ? errors : null;
};
