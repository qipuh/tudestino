import Business from './business.model.js';
import Service from '../services/service.model.js';
import Media from '../media/media.model.js';

export const getAll = async (req, res) => {
  try {
    const { type, districtId, rating, search, status } = req.query;
    const where = {};
    if (type) where.businessType = type;
    if (districtId) where.districtId = districtId;
    if (status) where.status = status;
    if (rating) where.ratingAverage = { [sequelize.Op.gte]: rating };
    if (search) where.name = { [sequelize.Op.like]: `%${search}%` };

    const businesses = await Business.findAll({
      where,
      include: [
        { model: Service, as: 'services' },
        { model: Media, as: 'media' }
      ],
      limit: 50
    });

    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id, {
      include: [
        { model: Service, as: 'services' },
        { model: Media, as: 'media' }
      ]
    });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { name, slug, businessType, ownerId, ...rest } = req.body;
    const business = await Business.create({
      name,
      slug,
      businessType,
      ownerId,
      ...rest
    });
    res.status(201).json(business);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });
    await business.update(req.body);
    res.json(business);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const delete_ = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });
    await business.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
