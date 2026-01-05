import Tour from './tour.model.js';
import Business from '../businesses/business.model.js';
import { Op } from 'sequelize';

class TourService {
  /**
   * Crear un nuevo tour
   */
  async createTour(businessId, ownerId, tourData) {
    // Verificar que el negocio existe y pertenece al usuario
    const business = await Business.findOne({
      where: { id: businessId, ownerId }
    });

    if (!business) {
      throw new Error('Negocio no encontrado o no tienes permisos');
    }

    // Generar código único si no se proporciona
    if (!tourData.tourCode) {
      tourData.tourCode = `TOUR-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    }

    // Generar slug si no se proporciona
    if (!tourData.slug) {
      tourData.slug = this.generateSlug(tourData.name);
    }

    // Crear el tour
    const tour = await Tour.create({
      ...tourData,
      businessId
    });

    return tour;
  }

  /**
   * Obtener todos los tours de un negocio
   */
  async getToursByBusiness(businessId, ownerId = null) {
    const whereConditions = { businessId };

    // Si no es el dueño, solo mostrar tours activos
    if (ownerId) {
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });
      if (!business) {
        whereConditions.status = 'active';
      }
    } else {
      whereConditions.status = 'active';
    }

    const tours = await Tour.findAll({
      where: whereConditions,
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'slug', 'logo']
      }],
      order: [['createdAt', 'DESC']]
    });

    return tours;
  }

  /**
   * Obtener un tour por ID
   */
  async getTourById(tourId) {
    const tour = await Tour.findByPk(tourId, {
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'slug', 'logo', 'contactPhone', 'contactEmail']
      }]
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    return tour;
  }

  /**
   * Obtener un tour por slug
   */
  async getTourBySlug(slug) {
    const tour = await Tour.findOne({
      where: { slug, status: 'active' },
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'slug', 'logo', 'contactPhone', 'contactEmail']
      }]
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    return tour;
  }

  /**
   * Actualizar un tour
   */
  async updateTour(tourId, ownerId, updateData) {
    const tour = await Tour.findByPk(tourId, {
      include: [{
        model: Business,
        as: 'business'
      }]
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    if (tour.business.ownerId !== ownerId) {
      throw new Error('No tienes permisos para actualizar este tour');
    }

    // Si se actualiza el nombre, regenerar slug
    if (updateData.name && updateData.name !== tour.name) {
      updateData.slug = this.generateSlug(updateData.name);
    }

    await tour.update(updateData);

    return tour;
  }

  /**
   * Eliminar un tour
   */
  async deleteTour(tourId, ownerId) {
    const tour = await Tour.findByPk(tourId, {
      include: [{
        model: Business,
        as: 'business'
      }]
    });

    if (!tour) {
      throw new Error('Tour no encontrado');
    }

    if (tour.business.ownerId !== ownerId) {
      throw new Error('No tienes permisos para eliminar este tour');
    }

    await tour.destroy();

    return { message: 'Tour eliminado exitosamente' };
  }

  /**
   * Buscar tours
   */
  async searchTours(filters) {
    const {
      category,
      destination,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      serviceType,
      difficulty,
      season,
      page = 1,
      limit = 20
    } = filters;

    const whereConditions = {
      status: 'active'
    };

    if (category && category !== 'all') {
      whereConditions.category = category;
    }

    if (destination) {
      whereConditions[Op.or] = [
        { mainDestination: { [Op.like]: `%${destination}%` } },
        { secondaryDestinations: { [Op.like]: `%${destination}%` } }
      ];
    }

    if (minPrice) {
      whereConditions.basePricePerPerson = { [Op.gte]: parseFloat(minPrice) };
    }

    if (maxPrice) {
      if (whereConditions.basePricePerPerson) {
        whereConditions.basePricePerPerson[Op.lte] = parseFloat(maxPrice);
      } else {
        whereConditions.basePricePerPerson = { [Op.lte]: parseFloat(maxPrice) };
      }
    }

    if (serviceType) {
      whereConditions.serviceType = serviceType;
    }

    if (difficulty) {
      whereConditions.difficultyLevel = difficulty;
    }

    if (season && season !== 'all_year') {
      whereConditions.season = season;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: tours } = await Tour.findAndCountAll({
      where: whereConditions,
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'slug', 'logo']
      }],
      limit: limitNum,
      offset,
      order: [['ratingAverage', 'DESC'], ['reviewCount', 'DESC']]
    });

    return {
      tours,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum)
      }
    };
  }

  /**
   * Generar slug único
   */
  generateSlug(name) {
    const baseSlug = name
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${baseSlug}-${Date.now()}`;
  }
}

export default new TourService();
