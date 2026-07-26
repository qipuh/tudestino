import { Property, Room } from './hotel-property.model.js';
import User from '../users/user.model-mysql.js';
import Business from '../businesses/business.model.js';
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
      attributes: [
        'id', 'hostId', 'accommodationType', 'multipleUnits', 'hotelName', 'hotelCategory',
        'propertyName', 'description', 'cancellationPolicy',
        'addressStreet', 'addressCity', 'addressState', 'addressCountry', 'addressZipCode',
        'addressLatitude', 'addressLongitude',
        'propertyAmenities', 'breakfastIncluded', 'parkingType', 'parkingDetails',
        'checkInTime', 'checkOutTime', 'childrenAllowed', 'petsAllowed', 'petFee', 'petFeePer',
        'additionalRules', 'status', 'ratingAverage', 'ratingCount', 'isActive',
        'createdAt', 'updatedAt'
      ],
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'email', 'avatar', 'bio', 'phone']
        },
        {
          model: Room,
          as: 'rooms',
          attributes: ['id', 'roomType', 'name', 'quantity', 'guestCapacity', 'beds', 'pricePerNight', 'amenities', 'view', 'mealPlan', 'description', 'images', 'isAvailable']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'logo', 'coverImage', 'slug']
        }
      ]
    });

    // Agregar campo image con path completo para el frontend
    return properties.map(p => {
      const plain = p.toJSON();
      const biz = plain.business || {};
      const filename = biz.coverImage || biz.logo || null;
      plain.image = filename ? `/uploads/business/${filename}` : null;
      return plain;
    });
  }

  async getPropertyById(propertyId) {
    const property = await Property.findByPk(propertyId, {
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'email', 'avatar', 'bio', 'phone']
        },
        {
          model: Room,
          as: 'rooms',
          attributes: ['id', 'roomType', 'name', 'quantity', 'guestCapacity', 'beds', 'pricePerNight', 'amenities', 'view', 'mealPlan', 'description', 'images', 'isAvailable']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'name', 'logo', 'coverImage', 'slug', 'ownerId', 'followersCount', 'address']
        }
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
