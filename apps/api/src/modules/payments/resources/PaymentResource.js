export const formatPayment = (payment) => {
  return {
    id: payment.id,
    reservationId: payment.reservationId,
    businessId: payment.businessId,
    grossAmount: payment.grossAmount,
    currency: payment.currency,
    gatewayProvider: payment.gatewayProvider,
    platformFeePercent: payment.platformFeePercent,
    platformFeeAmount: payment.platformFeeAmount,
    businessNetAmount: payment.businessNetAmount,
    status: payment.status,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt
  };
};
