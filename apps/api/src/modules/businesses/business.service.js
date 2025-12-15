import Business from './business.model.js';
import BusinessService from './business-service.model.js';
import BusinessSocialPost from './business-social-post.model.js';
import { v4 as uuidv4 } from 'uuid';

class BusinessServiceClass {
  /**
   * Crear un nuevo negocio
   */
  async createBusiness(ownerId, businessData) {
    try {
      // Sanitize optional fields: convert empty strings to null to satisfy validators
      if (businessData.website === '') businessData.website = null;
      if (businessData.contactEmail === '') businessData.contactEmail = null;
      // Generar slug único si no se proporciona
      if (!businessData.slug) {
        businessData.slug = this.generateSlug(businessData.name);
      }

      // Verificar que el slug sea único
      const existingBusiness = await Business.findOne({
        where: { slug: businessData.slug }
      });

      if (existingBusiness) {
        throw new Error('El slug ya está en uso. Por favor elige otro nombre.');
      }

      const business = await Business.create({
        id: uuidv4(),
        ownerId,
        ...businessData
      });

      return business;
    } catch (error) {
      throw new Error(`Error al crear negocio: ${error.message}`);
    }
  }

  /**
   * Obtener un negocio por ID
   */
  async getBusinessById(businessId, includeRelations = false) {
    try {
      const options = {
        where: { id: businessId }
      };

      if (includeRelations) {
        options.include = [
          {
            model: BusinessService,
            as: 'services',
            where: { isActive: true },
            required: false
          },
          {
            model: BusinessSocialPost,
            as: 'posts',
            where: { isActive: true },
            required: false,
            limit: 10,
            order: [['createdAt', 'DESC']]
          }
        ];
      }

      const business = await Business.findOne(options);

      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      return business;
    } catch (error) {
      throw new Error(`Error al obtener negocio: ${error.message}`);
    }
  }

  /**
   * Obtener negocio por slug
   */
  async getBusinessBySlug(slug, includeRelations = false) {
    try {
      const options = {
        where: { slug, isActive: true }
      };

      if (includeRelations) {
        options.include = [
          {
            model: BusinessService,
            as: 'services',
            where: { isActive: true },
            required: false
          }
        ];
      }

      const business = await Business.findOne(options);

      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      return business;
    } catch (error) {
      throw new Error(`Error al obtener negocio: ${error.message}`);
    }
  }

  /**
   * Obtener todos los negocios de un usuario
   */
  async getBusinessesByOwner(ownerId) {
    try {
      const businesses = await Business.findAll({
        where: { ownerId },
        include: [
          {
            model: BusinessService,
            as: 'services',
            where: { isActive: true },
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return businesses;
    } catch (error) {
      throw new Error(`Error al obtener negocios del usuario: ${error.message}`);
    }
  }

  /**
   * Actualizar un negocio
   */
  async updateBusiness(businessId, ownerId, updateData) {
    try {
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        throw new Error('Negocio no encontrado o no tienes permisos para editarlo');
      }

      // Si se actualiza el slug, verificar que sea único
      if (updateData.slug && updateData.slug !== business.slug) {
        const existingBusiness = await Business.findOne({
          where: { slug: updateData.slug }
        });

        if (existingBusiness) {
          throw new Error('El slug ya está en uso. Por favor elige otro nombre.');
        }
      }

      await business.update(updateData);

      return business;
    } catch (error) {
      throw new Error(`Error al actualizar negocio: ${error.message}`);
    }
  }

  /**
   * Eliminar un negocio
   */
  async deleteBusiness(businessId, ownerId) {
    try {
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        throw new Error('Negocio no encontrado o no tienes permisos para eliminarlo');
      }

      await business.destroy();

      return { message: 'Negocio eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar negocio: ${error.message}`);
    }
  }

  /**
   * Buscar negocios
   */
  async searchBusinesses(filters = {}, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const where = { isActive: true };

      if (filters.businessType) {
        where.businessType = filters.businessType;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const { count, rows } = await Business.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: BusinessService,
            as: 'services',
            where: { isActive: true },
            required: false
          }
        ]
      });

      return {
        businesses: rows,
        total: count,
        page,
        pages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(`Error al buscar negocios: ${error.message}`);
    }
  }

  /**
   * Verificar un negocio (solo admin)
   */
  async verifyBusiness(businessId, verificationStatus) {
    try {
      const business = await Business.findByPk(businessId);

      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      await business.update({
        verificationStatus,
        status: verificationStatus === 'verified' ? 'active' : business.status
      });

      return business;
    } catch (error) {
      throw new Error(`Error al verificar negocio: ${error.message}`);
    }
  }

  /**
   * Incrementar contador de seguidores
   */
  async incrementFollowers(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      if (business) {
        await business.increment('followersCount');
      }
    } catch (error) {
      console.error('Error al incrementar seguidores:', error);
    }
  }

  /**
   * Decrementar contador de seguidores
   */
  async decrementFollowers(businessId) {
    try {
      const business = await Business.findByPk(businessId);
      if (business && business.followersCount > 0) {
        await business.decrement('followersCount');
      }
    } catch (error) {
      console.error('Error al decrementar seguidores:', error);
    }
  }

  /**
   * Generar slug único a partir del nombre
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Math.random().toString(36).substr(2, 6);
  }
}

export default new BusinessServiceClass();
