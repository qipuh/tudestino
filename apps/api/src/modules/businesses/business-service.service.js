import BusinessService from './business-service.model.js';
import Business from './business.model.js';
import { v4 as uuidv4 } from 'uuid';

class BusinessServiceService {
  /**
   * Crear un nuevo servicio para un negocio
   */
  async createService(businessId, ownerId, serviceData) {
    try {
      // Verificar que el negocio existe y pertenece al usuario
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        throw new Error('Negocio no encontrado o no tienes permisos');
      }

      const service = await BusinessService.create({
        id: uuidv4(),
        businessId,
        ...serviceData
      });

      return service;
    } catch (error) {
      throw new Error(`Error al crear servicio: ${error.message}`);
    }
  }

  /**
   * Obtener todos los servicios de un negocio
   */
  async getServicesByBusiness(businessId, filters = {}) {
    try {
      const where = { businessId };

      if (filters.serviceType) {
        where.serviceType = filters.serviceType;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      const services = await BusinessService.findAll({
        where,
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'slug', 'logo']
          }
        ],
        order: [['orderIndex', 'ASC'], ['createdAt', 'DESC']]
      });

      return services;
    } catch (error) {
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }
  }

  /**
   * Obtener un servicio específico por ID
   */
  async getServiceById(serviceId) {
    try {
      const service = await BusinessService.findOne({
        where: { id: serviceId },
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'slug', 'logo', 'contactPhone', 'contactEmail']
          }
        ]
      });

      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      return service;
    } catch (error) {
      throw new Error(`Error al obtener servicio: ${error.message}`);
    }
  }

  /**
   * Actualizar un servicio
   */
  async updateService(serviceId, ownerId, updateData) {
    try {
      const service = await BusinessService.findOne({
        where: { id: serviceId },
        include: [
          {
            model: Business,
            as: 'business',
            where: { ownerId }
          }
        ]
      });

      if (!service) {
        throw new Error('Servicio no encontrado o no tienes permisos para editarlo');
      }

      await service.update(updateData);

      return service;
    } catch (error) {
      throw new Error(`Error al actualizar servicio: ${error.message}`);
    }
  }

  /**
   * Eliminar un servicio
   */
  async deleteService(serviceId, ownerId) {
    try {
      const service = await BusinessService.findOne({
        where: { id: serviceId },
        include: [
          {
            model: Business,
            as: 'business',
            where: { ownerId }
          }
        ]
      });

      if (!service) {
        throw new Error('Servicio no encontrado o no tienes permisos para eliminarlo');
      }

      await service.destroy();

      return { message: 'Servicio eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar servicio: ${error.message}`);
    }
  }

  /**
   * Reordenar servicios
   */
  async reorderServices(businessId, ownerId, servicesOrder) {
    try {
      // Verificar que el negocio pertenece al usuario
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        throw new Error('Negocio no encontrado o no tienes permisos');
      }

      // Actualizar el orden de cada servicio
      const updatePromises = servicesOrder.map((item, index) =>
        BusinessService.update(
          { orderIndex: index },
          { where: { id: item.serviceId, businessId } }
        )
      );

      await Promise.all(updatePromises);

      return { message: 'Orden actualizado exitosamente' };
    } catch (error) {
      throw new Error(`Error al reordenar servicios: ${error.message}`);
    }
  }

  /**
   * Cambiar estado de un servicio
   */
  async toggleServiceStatus(serviceId, ownerId) {
    try {
      const service = await BusinessService.findOne({
        where: { id: serviceId },
        include: [
          {
            model: Business,
            as: 'business',
            where: { ownerId }
          }
        ]
      });

      if (!service) {
        throw new Error('Servicio no encontrado o no tienes permisos');
      }

      await service.update({
        isActive: !service.isActive
      });

      return service;
    } catch (error) {
      throw new Error(`Error al cambiar estado del servicio: ${error.message}`);
    }
  }
}

export default new BusinessServiceService();
