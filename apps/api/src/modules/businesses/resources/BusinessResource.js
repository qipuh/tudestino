export const formatBusiness = (business) => {
  return {
    id: business.id,
    type: business.businessType,
    name: business.name,
    description: business.description,
    rating: business.ratingAverage,
    reviewCount: business.reviewCount,
    status: business.status,
    location: {
      district: business.district?.name,
      latitude: business.latitude,
      longitude: business.longitude
    },
    media: business.media?.map(m => ({ url: m.url, type: m.type })),
    services: business.services?.map(s => ({ id: s.id, name: s.name, type: s.type, price: s.price })),
    createdAt: business.createdAt
  };
};
