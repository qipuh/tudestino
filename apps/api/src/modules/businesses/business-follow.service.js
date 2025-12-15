import BusinessFollow from './business-follow.model.js';
import Business from './business.model.js';
import businessService from './business.service.js';
import { v4 as uuidv4 } from 'uuid';

class BusinessFollowService {
  /**
   * Seguir un negocio
   */
  async followBusiness(userId, businessId) {
    try {
      // Verificar que el negocio existe y está activo
      const business = await Business.findOne({
        where: { id: businessId, isActive: true }
      });

      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      // Verificar si ya sigue al negocio
      const existingFollow = await BusinessFollow.findOne({
        where: { userId, businessId }
      });

      if (existingFollow) {
        // Si ya existe pero está bloqueado, reactivarlo
        if (existingFollow.status === 'blocked') {
          await existingFollow.update({ status: 'active' });
          await businessService.incrementFollowers(businessId);
          return {
            message: 'Ahora sigues este negocio',
            following: true
          };
        }
        throw new Error('Ya sigues este negocio');
      }

      // Crear nuevo seguimiento
      await BusinessFollow.create({
        id: uuidv4(),
        userId,
        businessId
      });

      // Incrementar contador de seguidores
      await businessService.incrementFollowers(businessId);

      return {
        message: 'Ahora sigues este negocio',
        following: true
      };
    } catch (error) {
      throw new Error(`Error al seguir negocio: ${error.message}`);
    }
  }

  /**
   * Dejar de seguir un negocio
   */
  async unfollowBusiness(userId, businessId) {
    try {
      const follow = await BusinessFollow.findOne({
        where: { userId, businessId, status: 'active' }
      });

      if (!follow) {
        throw new Error('No sigues este negocio');
      }

      // Eliminar seguimiento
      await follow.destroy();

      // Decrementar contador de seguidores
      await businessService.decrementFollowers(businessId);

      return {
        message: 'Dejaste de seguir este negocio',
        following: false
      };
    } catch (error) {
      throw new Error(`Error al dejar de seguir negocio: ${error.message}`);
    }
  }

  /**
   * Verificar si un usuario sigue a un negocio
   */
  async isFollowing(userId, businessId) {
    try {
      const follow = await BusinessFollow.findOne({
        where: { userId, businessId, status: 'active' }
      });

      return !!follow;
    } catch (error) {
      console.error('Error en isFollowing:', error);
      return false;
    }
  }

  /**
   * Obtener todos los negocios que sigue un usuario
   */
  async getFollowedBusinesses(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await BusinessFollow.findAndCountAll({
        where: { userId, status: 'active' },
        include: [
          {
            model: Business,
            as: 'business',
            where: { isActive: true },
            attributes: [
              'id',
              'name',
              'slug',
              'logo',
              'coverImage',
              'businessType',
              'ratingAverage',
              'reviewCount',
              'followersCount'
            ]
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        businesses: rows.map(follow => follow.business),
        total: count,
        page,
        pages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(`Error al obtener negocios seguidos: ${error.message}`);
    }
  }

  /**
   * Obtener seguidores de un negocio
   */
  async getBusinessFollowers(businessId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await BusinessFollow.findAndCountAll({
        where: { businessId, status: 'active' },
        // TODO: Incluir información del usuario cuando el modelo esté disponible
        // include: [
        //   {
        //     model: User,
        //     as: 'follower',
        //     attributes: ['id', 'name', 'username', 'avatar']
        //   }
        // ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        followers: rows,
        total: count,
        page,
        pages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(`Error al obtener seguidores: ${error.message}`);
    }
  }

  /**
   * Actualizar configuración de notificaciones
   */
  async updateNotificationSettings(userId, businessId, notificationsEnabled) {
    try {
      const follow = await BusinessFollow.findOne({
        where: { userId, businessId, status: 'active' }
      });

      if (!follow) {
        throw new Error('No sigues este negocio');
      }

      await follow.update({ notificationsEnabled });

      return {
        message: 'Configuración actualizada',
        notificationsEnabled
      };
    } catch (error) {
      throw new Error(`Error al actualizar notificaciones: ${error.message}`);
    }
  }

  /**
   * Bloquear/Desbloquear un seguimiento
   */
  async toggleBlockStatus(userId, businessId) {
    try {
      const follow = await BusinessFollow.findOne({
        where: { userId, businessId }
      });

      if (!follow) {
        throw new Error('No sigues este negocio');
      }

      const newStatus = follow.status === 'active' ? 'blocked' : 'active';
      await follow.update({ status: newStatus });

      // Actualizar contador de seguidores
      if (newStatus === 'blocked') {
        await businessService.decrementFollowers(businessId);
      } else {
        await businessService.incrementFollowers(businessId);
      }

      return {
        message: newStatus === 'blocked' ? 'Negocio bloqueado' : 'Negocio desbloqueado',
        status: newStatus
      };
    } catch (error) {
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }
}

export default new BusinessFollowService();
