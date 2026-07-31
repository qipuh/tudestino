import Offer from './offer.model.js';

export const getByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const offers = await Offer.findAll({ where: { businessId } });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { code, title, discountType, discountValue, validFrom, validUntil } = req.body;
    const offer = await Offer.create({
      businessId,
      code,
      title,
      discountType,
      discountValue,
      validFrom,
      validUntil
    });
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    await offer.update(req.body);
    res.json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const delete_ = async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    await offer.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const offer = await Offer.findOne({ where: { code } });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
