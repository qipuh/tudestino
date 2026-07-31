import Service from './service.model.js';

export const getByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { type } = req.query;
    const where = { businessId };
    if (type) where.type = type;

    const services = await Service.findAll({ where });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { name, type, price, description, settings } = req.body;
    const service = await Service.create({
      businessId,
      name,
      type,
      price,
      description,
      settings
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    await service.update(req.body);
    res.json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const delete_ = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    await service.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
