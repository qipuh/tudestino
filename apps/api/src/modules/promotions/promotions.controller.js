import Promotion from './promotion.model.js';

export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: promotions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPromotion = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, maxUses, validFrom, validUntil } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'code y discountValue son requeridos' });
    }

    const existing = await Promotion.findOne({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya existe un código promocional con ese nombre' });
    }

    const promotion = await Promotion.create({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue,
      maxUses: maxUses || null,
      validFrom: validFrom || null,
      validUntil: validUntil || null,
    });

    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Código promocional no encontrado' });
    }

    const { description, discountType, discountValue, maxUses, validFrom, validUntil, isActive } = req.body;

    await promotion.update({
      description: description !== undefined ? description : promotion.description,
      discountType: discountType || promotion.discountType,
      discountValue: discountValue !== undefined ? discountValue : promotion.discountValue,
      maxUses: maxUses !== undefined ? maxUses : promotion.maxUses,
      validFrom: validFrom !== undefined ? validFrom : promotion.validFrom,
      validUntil: validUntil !== undefined ? validUntil : promotion.validUntil,
      isActive: isActive !== undefined ? isActive : promotion.isActive,
    });

    res.json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByPk(req.params.id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Código promocional no encontrado' });
    }

    await promotion.destroy();
    res.json({ success: true, message: 'Código promocional eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
