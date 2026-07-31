export const validateCreateService = (data) => {
  const errors = {};
  if (!data.businessId) errors.businessId = 'Business ID required';
  if (!data.name || data.name.length < 2) errors.name = 'Name required, min 2 chars';
  if (!data.type) errors.type = 'Type required';
  if (data.price && data.price < 0) errors.price = 'Price must be positive';
  return Object.keys(errors).length > 0 ? errors : null;
};
