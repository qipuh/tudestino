import Offer from './offer.model.js';
import { Op } from 'sequelize';

export const getOffersByBusiness = async (businessId) => {
  return Offer.findAll({
    where: { businessId, isActive: true, validUntil: { [Op.gte]: new Date() } }
  });
};

export const createOffer = async (data) => {
  return Offer.create(data);
};

export const updateOffer = async (id, data) => {
  const offer = await Offer.findByPk(id);
  if (!offer) return null;
  return offer.update(data);
};

export const deleteOffer = async (id) => {
  const offer = await Offer.findByPk(id);
  if (!offer) return false;
  await offer.destroy();
  return true;
};

export const getOfferByCode = async (code) => {
  return Offer.findOne({
    where: {
      code,
      isActive: true,
      validUntil: { [Op.gte]: new Date() }
    }
  });
};

export const validateOffer = async (offerId) => {
  const offer = await Offer.findByPk(offerId);
  if (!offer) return { valid: false, reason: 'not_found' };
  if (!offer.isActive) return { valid: false, reason: 'inactive' };
  if (offer.validUntil < new Date()) return { valid: false, reason: 'expired' };
  if (offer.maxUses && offer.usedCount >= offer.maxUses) {
    return { valid: false, reason: 'max_uses_reached' };
  }
  return { valid: true };
};

export const applyDiscount = async (offerId, amount) => {
  const offer = await Offer.findByPk(offerId);
  if (!offer) return amount;

  if (offer.discountType === 'percentage') {
    return amount * (1 - offer.discountValue / 100);
  } else if (offer.discountType === 'fixed_amount') {
    return Math.max(0, amount - offer.discountValue);
  }
  return amount;
};
