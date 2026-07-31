export const validateCreateOffer = (data) => {
  const errors = {};
  if (!data.code || data.code.length < 2) errors.code = 'Code required';
  if (!data.title) errors.title = 'Title required';
  if (!data.discountType) errors.discountType = 'Discount type required';
  if (!data.discountValue || data.discountValue < 0) errors.discountValue = 'Discount value required';
  if (!data.validFrom || !data.validUntil) errors.dates = 'Dates required';
  return Object.keys(errors).length > 0 ? errors : null;
};
