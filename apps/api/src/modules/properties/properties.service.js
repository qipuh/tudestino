import { Property, Room } from './property.model.sequelize.js';
import User from '../users/user.model-mysql.js';
import { AppError } from '../../middleware/errorHandler.js';

class PropertiesService {
  async createProperty(hostId, propertyData) {
    const property = await Property.create({
      ...propertyData,
      hostId: hostId,
    });
    return property;
  }

  async getProperties(filters = {}) {
    const { page = 1, limit = 20, ...queryFilters } = filters;
    const offset = (page - 1) * limit;

    const properties = await Property.findAll({
      where: { status: 'published', ...queryFilters },
      offset,
      limit,
      include: [
        {
          model: Room,
          as: 'rooms',
        },
        // Descomentar cuando User esté configurado con Sequelize
        // {
        //   model: User,
        //   as: 'host',
        //   attributes: ['id', 'name', 'avatar', 'hostRating']
        // }
      ]
    });

    return properties;
  }

  async getPropertyById(propertyId) {
    const property = await Property.findByPk(propertyId, {
      include: [
        {
          model: Room,
          as: 'rooms',
        },
        // Descomentar cuando User esté configurado con Sequelize
        // {
        //   model: User,
        //   as: 'host',
        //   attributes: ['id', 'name', 'avatar', 'hostRating']
        // }
      ]
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    return property;
  }

  async updateProperty(propertyId, hostId, updateData) {
    const property = await Property.findOne({
      where: { id: propertyId, hostId: hostId }
    });

    if (!property) {
      throw new AppError('Property not found or unauthorized', 404);
    }

    await property.update(updateData);
    return property;
  }

  async deleteProperty(propertyId, hostId) {
    const property = await Property.findOne({
      where: { id: propertyId, hostId: hostId }
    });

    if (!property) {
      throw new AppError('Property not found or unauthorized', 404);
    }

    await property.destroy();
    return true;
  }
}

export const propertiesService = new PropertiesService();
