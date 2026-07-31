import Business from './business.model.js';
import { Op } from 'sequelize';

export const getAllBusinesses = async (filters = {}) => {
  const where = {};
  if (filters.type) where.businessType = filters.type;
  if (filters.districtId) where.districtId = filters.districtId;
  if (filters.status) where.status = filters.status;
  if (filters.rating) where.ratingAverage = { [Op.gte]: filters.rating };
  if (filters.search) where.name = { [Op.like]: `%${filters.search}%` };

  return Business.findAll({
    where,
    limit: filters.limit || 50,
    offset: filters.offset || 0,
    include: [
      { association: 'services', attributes: ['id', 'name', 'price', 'type'] },
      { association: 'media', attributes: ['url', 'type'] }
    ]
  });
};

export const getBusinessById = async (id, includeRelations = true) => {
  const options = { include: [] };
  if (includeRelations) {
    options.include = [
      { association: 'services' },
      { association: 'media' },
      { association: 'profile' },
      { association: 'offers' }
    ];
  }
  return Business.findByPk(id, options);
};

export const createBusiness = async (data) => {
  return Business.create(data);
};

export const updateBusiness = async (id, data) => {
  const business = await Business.findByPk(id);
  if (!business) return null;
  return business.update(data);
};

export const deleteBusiness = async (id) => {
  const business = await Business.findByPk(id);
  if (!business) return false;
  await business.destroy();
  return true;
};

export const searchByLocation = async (lat, lng, radius = 10) => {
  return Business.findAll({
    where: {
      latitude: { [Op.between]: [lat - radius, lat + radius] },
      longitude: { [Op.between]: [lng - radius, lng + radius] }
    }
  });
};
