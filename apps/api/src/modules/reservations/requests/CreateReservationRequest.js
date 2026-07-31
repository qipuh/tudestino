export const validateCreateReservation = (data) => {
  const errors = {};
  if (!data.businessId) errors.businessId = 'Business ID required';
  if (!data.userId) errors.userId = 'User ID required';
  if (!data.reservationDate) errors.reservationDate = 'Date required';
  if (!data.numberOfPeople || data.numberOfPeople < 1) errors.numberOfPeople = 'Min 1 person';
  return Object.keys(errors).length > 0 ? errors : null;
};
