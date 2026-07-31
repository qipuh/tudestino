import Service from './service.model.js';

export const getServicesByBusiness = async (businessId, filters = {}) => {
  const where = { businessId };
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;

  return Service.findAll({ where });
};

export const createService = async (data) => {
  return Service.create(data);
};

export const updateService = async (id, data) => {
  const service = await Service.findByPk(id);
  if (!service) return null;
  return service.update(data);
};

export const deleteService = async (id) => {
  const service = await Service.findByPk(id);
  if (!service) return false;
  await service.destroy();
  return true;
};

export const getServiceById = async (id) => {
  return Service.findByPk(id);
};
