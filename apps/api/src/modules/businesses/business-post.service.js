import BusinessSocialPost from './business-social-post.model.js';
import Business from './business.model.js';
import { Like } from '../social/social.model.sequelize.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

class BusinessPostService {
  /**
   * Crear un post para un negocio
   */
  async createPost(businessId, ownerId, postData) {
    try {
      // Verificar que el negocio existe y pertenece al usuario
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        throw new Error('Negocio no encontrado o no tienes permisos');
      }

      const post = await BusinessSocialPost.create({
        id: uuidv4(),
        businessId,
        ...postData
      });

      return post;
    } catch (error) {
      throw new Error(`Error al crear post: ${error.message}`);
    }
  }

  /**
   * Obtener posts de un negocio
   */
  async getPostsByBusiness(businessId, page = 1, limit = 20, type = null, currentUserId = null) {
    try {
      const offset = (page - 1) * limit;
      const where = { businessId, isActive: true };

      if (type) {
        where.type = type;
      }

      const { count, rows } = await BusinessSocialPost.findAndCountAll({
        where,
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'slug', 'logo']
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      // Agregar campo isLiked a cada post
      const postsWithLikeStatus = await Promise.all(
        rows.map(async (post) => {
          let isLiked = false;

          if (currentUserId) {
            const like = await Like.findOne({
              where: {
                contentType: 'post',
                contentId: post.id,
                userId: currentUserId,
              },
            });
            isLiked = !!like;
          }

          return {
            ...post.toJSON(),
            isLiked,
          };
        })
      );

      return {
        posts: postsWithLikeStatus,
        total: count,
        page,
        pages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(`Error al obtener posts: ${error.message}`);
    }
  }

  /**
   * Obtener un post específico
   */
  async getPostById(postId) {
    try {
      const post = await BusinessSocialPost.findOne({
        where: { id: postId, isActive: true },
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'slug', 'logo', 'followersCount']
          }
        ]
      });

      if (!post) {
        throw new Error('Post no encontrado');
      }

      // Incrementar vistas
      await post.increment('viewsCount');

      return post;
    } catch (error) {
      throw new Error(`Error al obtener post: ${error.message}`);
    }
  }

  /**
   * Actualizar un post
   */
  async updatePost(postId, ownerId, updateData) {
    try {
      const post = await BusinessSocialPost.findOne({
        where: { id: postId },
        include: [
          {
            model: Business,
            as: 'business',
            where: { ownerId }
          }
        ]
      });

      if (!post) {
        throw new Error('Post no encontrado o no tienes permisos para editarlo');
      }

      await post.update(updateData);

      return post;
    } catch (error) {
      throw new Error(`Error al actualizar post: ${error.message}`);
    }
  }

  /**
   * Eliminar un post
   */
  async deletePost(postId, ownerId) {
    try {
      const post = await BusinessSocialPost.findOne({
        where: { id: postId },
        include: [
          {
            model: Business,
            as: 'business',
            where: { ownerId }
          }
        ]
      });

      if (!post) {
        throw new Error('Post no encontrado o no tienes permisos para eliminarlo');
      }

      // Soft delete
      await post.update({ isActive: false });

      return { message: 'Post eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar post: ${error.message}`);
    }
  }

  /**
   * Obtener feed de posts de negocios seguidos
   */
  async getFeedPosts(userId, page = 1, limit = 20) {
    try {
      // TODO: Implementar cuando tengamos el modelo de BusinessFollow
      // Por ahora retorna posts recientes de todos los negocios activos
      const offset = (page - 1) * limit;

      const { count, rows } = await BusinessSocialPost.findAndCountAll({
        where: { isActive: true },
        include: [
          {
            model: Business,
            as: 'business',
            where: { status: 'active', isActive: true },
            attributes: ['id', 'name', 'slug', 'logo', 'businessType']
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        posts: rows,
        total: count,
        page,
        pages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(`Error al obtener feed: ${error.message}`);
    }
  }

  /**
   * Like/Unlike un post
   */
  async toggleLike(postId, userId) {
    try {
      // TODO: Implementar sistema de likes cuando tengamos el modelo
      const post = await BusinessSocialPost.findByPk(postId);

      if (!post) {
        throw new Error('Post no encontrado');
      }

      // Por ahora solo incrementamos el contador
      // En el futuro, aquí verificaremos si el usuario ya dio like
      await post.increment('likesCount');

      return {
        liked: true,
        likesCount: post.likesCount + 1
      };
    } catch (error) {
      throw new Error(`Error al dar like: ${error.message}`);
    }
  }

  /**
   * Incrementar contador de comentarios
   */
  async incrementComments(postId) {
    try {
      const post = await BusinessSocialPost.findByPk(postId);
      if (post) {
        await post.increment('commentsCount');
      }
    } catch (error) {
      console.error('Error al incrementar comentarios:', error);
    }
  }

  /**
   * Incrementar contador de compartidos
   */
  async incrementShares(postId) {
    try {
      const post = await BusinessSocialPost.findByPk(postId);
      if (post) {
        await post.increment('sharesCount');
      }
    } catch (error) {
      console.error('Error al incrementar compartidos:', error);
    }
  }
}

export default new BusinessPostService();
