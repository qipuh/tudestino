export const formatOffer = (offer) => {
  return {
    id: offer.id,
    businessId: offer.businessId,
    code: offer.code,
    title: offer.title,
    description: offer.description,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    validFrom: offer.validFrom,
    validUntil: offer.validUntil,
    isActive: offer.isActive,
    maxUses: offer.maxUses,
    usedCount: offer.usedCount,
    remainingUses: offer.maxUses ? offer.maxUses - offer.usedCount : null,
    createdAt: offer.createdAt
  };
};
