export const validateCreateBusiness = (data) => {
  const errors = {};
  if (!data.name || data.name.length < 3) errors.name = 'Name required, min 3 chars';
  if (!data.slug) errors.slug = 'Slug required';
  if (!data.businessType) errors.businessType = 'Business type required';
  if (!data.ownerId) errors.ownerId = 'Owner ID required';
  return Object.keys(errors).length > 0 ? errors : null;
};
