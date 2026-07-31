export const formatService = (service) => {
  return {
    id: service.id,
    businessId: service.businessId,
    name: service.name,
    type: service.type,
    description: service.description,
    price: service.price,
    status: service.status,
    settings: service.settings,
    createdAt: service.createdAt
  };
};
