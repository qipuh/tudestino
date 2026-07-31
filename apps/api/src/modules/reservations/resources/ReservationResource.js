export const formatReservation = (reservation) => {
  return {
    id: reservation.id,
    businessId: reservation.businessId,
    userId: reservation.userId,
    date: reservation.reservationDate,
    time: reservation.reservationTime,
    numberOfPeople: reservation.numberOfPeople,
    status: reservation.status,
    totalPrice: reservation.totalPrice,
    currency: reservation.currency,
    paymentStatus: reservation.paymentStatus,
    service: reservation.service ? { id: reservation.service.id, name: reservation.service.name } : null,
    metadata: reservation.metadata,
    createdAt: reservation.createdAt
  };
};
