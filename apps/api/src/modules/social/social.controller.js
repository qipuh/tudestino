import * as socialService from './social.service.js';
import { Post, Reel, Like, Comment, SavedPost } from './social.model.sequelize.js';
import User from '../users/user.model-mysql.js';
import CommentLike from './commentLike.model.js';
import BusinessSocialPost from '../businesses/business-social-post.model.js';
import Business from '../businesses/business.model.js';
import Route from '../routes/route.model.js';
import {
  createFollowerNotification,
  createPostLikeNotification,
  createReelLikeNotification,
  createCommentLikeNotification,
  createCommentNotification,
} from '../notifications/notification.helper.js';

// ==================== PROFILE CONTROLLERS ====================

// GET /api/social/profile/:userId
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const profile = await socialService.getUserProfile(userId, currentUserId);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    const statusCode = error.message === 'Usuario no encontrado' ? 404 :
                       error.message === 'Este perfil es privado' ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/social/profile (perfil propio)
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await socialService.getUserProfile(userId, userId);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PATCH /api/social/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const profile = await socialService.updateSocialProfile(userId, updates);

    res.json({
      success: true,
      data: profile,
      message: 'Perfil actualizado correctamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// POST /api/social/profile/avatar
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha enviado ninguna imagen'
      });
    }

    // Actualizar el avatar en la base de datos
    const avatarUrl = `/uploads/social/${req.file.filename}`;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await user.update({ avatar: avatarUrl });

    res.json({
      success: true,
      avatarUrl,
      message: 'Avatar actualizado correctamente'
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al subir el avatar'
    });
  }
};

// GET /api/social/profile/:userId/stats
export const getProfileStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await socialService.getProfileStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== FOLLOW CONTROLLERS ====================

// POST /api/social/follow/:userId
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    const result = await socialService.followUser(followerId, userId);
    createFollowerNotification(userId, followerId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.message === 'Usuario no encontrado' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE /api/social/follow/:userId
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    const result = await socialService.unfollowUser(followerId, userId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/social/followers/:userId
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await socialService.getFollowers(userId, limit, offset);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/social/following/:userId
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await socialService.getFollowing(userId, limit, offset);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/social/follow/status/:userId
export const checkFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId } = req.params;

    const status = await socialService.checkFollowStatus(followerId, userId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/social/search/users
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La búsqueda debe tener al menos 2 caracteres'
      });
    }

    const users = await socialService.searchUsers(q, currentUserId, limit);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== USERNAME CONTROLLERS ====================

// GET /api/social/username/check/:username
export const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    // Validar formato
    if (!username || !/^[a-z0-9-]{3,30}$/.test(username)) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Username inválido. Debe tener 3-30 caracteres (solo letras minúsculas, números y guiones)'
      });
    }

    const isAvailable = await socialService.checkUsernameAvailability(username, currentUserId);

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable ? 'Username disponible' : 'Username ya está en uso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/social/profile/by-username/:username
export const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const profile = await socialService.getProfileByUsername(username, currentUserId);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    const statusCode = error.message === 'Usuario no encontrado' ? 404 :
                       error.message === 'Este perfil es privado' ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== POST & REEL CONTROLLERS ====================

/**
 * Crear nueva publicación (Post)
 * POST /api/social/posts
 */
export const createPost = async (req, res) => {
  try {
    const { caption, location } = req.body;
    const userId = req.user.id;

    // Validar que haya archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Se requiere al menos un archivo (imagen o video)' });
    }

    // Construir array de media con información de cada archivo
    const media = req.files.map(file => ({
      url: `/uploads/social/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      thumbnail: file.mimetype.startsWith('video/') ? `/uploads/social/thumbnails/${file.filename}.jpg` : null,
    }));

    // Crear post
    const post = await Post.create({
      userId,
      caption,
      location: location || null,
      media,
    });

    // Obtener post con información del usuario
    const postWithUser = await Post.findByPk(post.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
    });

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: postWithUser,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, message: 'Error al crear la publicación', error: error.message });
  }
};

/**
 * Crear nuevo reel
 * POST /api/social/reels
 */
export const createReel = async (req, res) => {
  try {
    const { caption, location, duration } = req.body;
    const userId = req.user.id;

    // Validar que haya video
    if (!req.file) {
      return res.status(400).json({ message: 'Se requiere un archivo de video' });
    }

    // Crear reel
    const reel = await Reel.create({
      userId,
      caption,
      location: location || null,
      videoUrl: `/uploads/social/${req.file.filename}`,
      thumbnailUrl: `/uploads/social/thumbnails/${req.file.filename}.jpg`,
      duration: duration ? parseInt(duration) : null,
    });

    // Obtener reel con información del usuario
    const reelWithUser = await Reel.findByPk(reel.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
    });

    res.status(201).json({
      success: true,
      message: 'Reel creado exitosamente',
      data: reelWithUser,
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    res.status(500).json({ success: false, message: 'Error al crear el reel', error: error.message });
  }
};

/**
 * Obtener posts de un usuario
 * GET /api/social/users/:userId/posts
 */
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?.id; // Usuario autenticado (opcional)

    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Post.findAndCountAll({
      where: {
        userId,
        isActive: true,
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Agregar campo isLiked a cada post
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post) => {
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

    res.json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las publicaciones', error: error.message });
  }
};

/**
 * Obtener reels de un usuario con estado de like
 * GET /api/social/users/:userId/reels
 */
export const getUserReels = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?.id; // Usuario autenticado (opcional)

    const offset = (page - 1) * limit;

    const { count, rows: reels } = await Reel.findAndCountAll({
      where: {
        userId,
        isActive: true,
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Agregar campo isLiked a cada reel
    const reelsWithLikeStatus = await Promise.all(
      reels.map(async (reel) => {
        let isLiked = false;

        if (currentUserId) {
          const like = await Like.findOne({
            where: {
              contentType: 'reel',
              contentId: reel.id,
              userId: currentUserId,
            },
          });
          isLiked = !!like;
        }

        return {
          ...reel.toJSON(),
          isLiked,
        };
      })
    );

    res.json({
      success: true,
      data: {
        reels: reelsWithLikeStatus,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error getting user reels:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los reels', error: error.message });
  }
};

/**
 * Obtener feed (timeline) - posts y reels mezclados
 * GET /api/social/feed
 */
export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?.id; // Usuario autenticado (opcional)
    const offset = (page - 1) * limit;

    // Obtener posts de usuarios
    const userPosts = await Post.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
      order: [['createdAt', 'DESC']],
    });

    // Obtener posts de negocios
    const businessPosts = await BusinessSocialPost.findAll({
      where: { isActive: true, type: 'post' },
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'slug', 'logo'],
      }],
      order: [['createdAt', 'DESC']],
    });

    // Combinar y ordenar por fecha
    const allPosts = [...userPosts, ...businessPosts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + parseInt(limit));

    // Agregar campo isLiked a cada post
    const postsWithLikeStatus = await Promise.all(
      allPosts.map(async (post) => {
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

    res.json({ success: true, data: { posts: postsWithLikeStatus } });
  } catch (error) {
    console.error('Error getting feed:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el feed', error: error.message });
  }
};

/**
 * Obtener feed de reels con estado de like
 * GET /api/social/reels/feed
 */
export const getReelsFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?.id; // Usuario autenticado (opcional)
    const offset = (page - 1) * limit;

    // Obtener reels de usuarios
    const userReels = await Reel.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
      order: [['createdAt', 'DESC']],
    });

    // Obtener reels de negocios
    const businessReels = await BusinessSocialPost.findAll({
      where: { isActive: true, type: 'reel' },
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'slug', 'logo'],
      }],
      order: [['createdAt', 'DESC']],
    });

    // Combinar y ordenar por fecha
    const allReels = [...userReels, ...businessReels]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(offset, offset + parseInt(limit));

    // Agregar campo isLiked a cada reel
    const reelsWithLikeStatus = await Promise.all(
      allReels.map(async (reel) => {
        let isLiked = false;

        if (currentUserId) {
          const like = await Like.findOne({
            where: {
              contentType: 'reel',
              contentId: reel.id,
              userId: currentUserId,
            },
          });
          isLiked = !!like;
        }

        return {
          ...reel.toJSON(),
          isLiked,
        };
      })
    );

    res.json({ success: true, data: { reels: reelsWithLikeStatus } });
  } catch (error) {
    console.error('Error getting reels feed:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los reels', error: error.message });
  }
};

/**
 * Toggle like en un post, reel o comentario
 * POST /api/social/like
 */
export const toggleLike = async (req, res) => {
  try {
    const { contentType, contentId } = req.body;
    const userId = req.user.id;

    // Validar tipo de contenido
    if (!['post', 'reel', 'comment', 'route'].includes(contentType)) {
      return res.status(400).json({ message: 'Tipo de contenido inválido' });
    }

    // Buscar like existente
    const existingLike = await Like.findOne({
      where: {
        userId,
        contentType,
        contentId,
      },
    });

    if (existingLike) {
      // Si ya existe, eliminar (unlike)
      await existingLike.destroy();

      // Decrementar contador según el tipo
      if (contentType === 'post') {
        await Post.decrement('likesCount', { where: { id: contentId } });
      } else if (contentType === 'reel') {
        await Reel.decrement('likesCount', { where: { id: contentId } });
      } else if (contentType === 'comment') {
        await Comment.decrement('likesCount', { where: { id: contentId } });
      } else if (contentType === 'route') {
        await Route.decrement('likesCount', { where: { id: contentId } });
      }

      res.json({ success: true, message: 'Like eliminado', data: { liked: false } });
    } else {
      // Si no existe, crear (like)
      await Like.create({
        userId,
        contentType,
        contentId,
      });

      // Incrementar contador según el tipo, y avisarle al dueño del contenido
      if (contentType === 'post') {
        await Post.increment('likesCount', { where: { id: contentId } });
        const post = await Post.findByPk(contentId, { attributes: ['userId'] });
        if (post) createPostLikeNotification(post.userId, userId, contentId);
      } else if (contentType === 'reel') {
        await Reel.increment('likesCount', { where: { id: contentId } });
        const reel = await Reel.findByPk(contentId, { attributes: ['userId'] });
        if (reel) createReelLikeNotification(reel.userId, userId, contentId);
      } else if (contentType === 'comment') {
        await Comment.increment('likesCount', { where: { id: contentId } });
        const comment = await Comment.findByPk(contentId, { attributes: ['userId'] });
        if (comment) createCommentLikeNotification(comment.userId, userId, contentId);
      } else if (contentType === 'route') {
        await Route.increment('likesCount', { where: { id: contentId } });
      }

      res.json({ success: true, message: 'Like agregado', data: { liked: true } });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Error al procesar el like', error: error.message });
  }
};

/**
 * Agregar comentario o respuesta
 * POST /api/social/comments
 */
export const addComment = async (req, res) => {
  try {
    const { contentType, contentId, text, parentCommentId } = req.body;
    const userId = req.user.id;

    // Validar tipo de contenido
    if (!['post', 'reel', 'route'].includes(contentType)) {
      return res.status(400).json({ message: 'Tipo de contenido inválido' });
    }

    // Validar texto
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }

    // Si es una respuesta, validar que el comentario padre existe
    if (parentCommentId) {
      const parentComment = await Comment.findByPk(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Comentario padre no encontrado' });
      }
    }

    // Crear comentario
    const comment = await Comment.create({
      userId,
      contentType,
      contentId,
      text: text.trim(),
      parentCommentId: parentCommentId || null,
    });

    // Incrementar contadores
    if (parentCommentId) {
      // Si es una respuesta, incrementar el contador de respuestas del comentario padre
      await Comment.increment('repliesCount', {
        where: { id: parentCommentId },
      });
    } else {
      // Si es un comentario principal, incrementar el contador del post/reel/route
      const Model = contentType === 'post' ? Post : contentType === 'reel' ? Reel : Route;
      await Model.increment('commentsCount', {
        where: { id: contentId },
      });

      // Avisarle al dueño del post/reel (route todavía no tiene este tipo de notificación)
      if (contentType === 'post' || contentType === 'reel') {
        const owner = await Model.findByPk(contentId, { attributes: ['userId'] });
        if (owner) createCommentNotification(owner.userId, userId, contentId, text.trim());
      }
    }

    // Obtener comentario con información del usuario
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
    });

    // Agregar isLiked = false y replies = []
    const commentWithLikeStatus = {
      ...commentWithUser.toJSON(),
      isLiked: false,
      replies: [],
    };

    res.status(201).json({
      success: true,
      message: parentCommentId ? 'Respuesta agregada' : 'Comentario agregado',
      data: commentWithLikeStatus,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Error al agregar comentario', error: error.message });
  }
};

// DELETE /api/social/comments/:commentId
// Comment no tiene columna isActive - a diferencia de post/reel (soft
// delete), acá se borra la fila de verdad, igual que deleteMilestone.
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado' });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este comentario' });
    }

    if (comment.parentCommentId) {
      await Comment.decrement('repliesCount', { where: { id: comment.parentCommentId } });
    } else {
      const Model = comment.contentType === 'post' ? Post : comment.contentType === 'reel' ? Reel : Route;
      await Model.decrement('commentsCount', { where: { id: comment.contentId } });
    }

    await comment.destroy();
    res.json({ success: true, message: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar comentario', error: error.message });
  }
};

/**
 * Obtener comentarios de un contenido con respuestas anidadas
 * GET /api/social/comments/:contentType/:contentId
 */
export const getComments = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user?.id; // Usuario autenticado (puede ser undefined si no está autenticado)

    const offset = (page - 1) * limit;

    // Obtener solo comentarios principales (sin parentCommentId)
    const { count, rows: mainComments } = await Comment.findAndCountAll({
      where: {
        contentType,
        contentId,
        parentCommentId: null, // Solo comentarios principales
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Para cada comentario principal, obtener sus respuestas
    const commentsWithReplies = await Promise.all(
      mainComments.map(async (comment) => {
        // Obtener respuestas del comentario
        const replies = await Comment.findAll({
          where: {
            parentCommentId: comment.id,
          },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'avatar', 'username'],
          }],
          order: [['createdAt', 'ASC']], // Respuestas en orden cronológico
        });

        // Verificar si el usuario dio like al comentario
        let isLiked = false;
        if (userId) {
          const like = await Like.findOne({
            where: {
              contentType: 'comment',
              contentId: comment.id,
              userId: userId,
            },
          });
          isLiked = !!like;
        }

        // Procesar respuestas con isLiked
        const repliesWithLikes = await Promise.all(
          replies.map(async (reply) => {
            let replyIsLiked = false;
            if (userId) {
              const replyLike = await Like.findOne({
                where: {
                  contentType: 'comment',
                  contentId: reply.id,
                  userId: userId,
                },
              });
              replyIsLiked = !!replyLike;
            }

            return {
              ...reply.toJSON(),
              isLiked: replyIsLiked,
            };
          })
        );

        return {
          ...comment.toJSON(),
          isLiked,
          replies: repliesWithLikes,
        };
      })
    );

    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ success: false, message: 'Error al obtener comentarios', error: error.message });
  }
};

/**
 * Eliminar post (soft delete)
 * DELETE /api/social/posts/:postId
 */
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    // Verificar que el usuario sea el propietario
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta publicación' });
    }

    // Soft delete
    await post.update({ isActive: false });

    res.json({ success: true, message: 'Publicación eliminada' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la publicación', error: error.message });
  }
};

/**
 * Eliminar reel (soft delete)
 * DELETE /api/social/reels/:reelId
 */
export const deleteReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    const reel = await Reel.findByPk(reelId);

    if (!reel) {
      return res.status(404).json({ message: 'Reel no encontrado' });
    }

    // Verificar que el usuario sea el propietario
    if (reel.userId !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este reel' });
    }

    // Soft delete
    await reel.update({ isActive: false });

    res.json({ success: true, message: 'Reel eliminado' });
  } catch (error) {
    console.error('Error deleting reel:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el reel', error: error.message });
  }
};

// ==================== SAVED POSTS ====================

/**
 * Guardar/quitar un post de guardados (bookmark toggle)
 * POST /api/social/posts/:postId/save
 */
export const toggleSavePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const existing = await SavedPost.findOne({ where: { userId, postId } });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, isSaved: false });
    }

    await SavedPost.create({ userId, postId });
    res.json({ success: true, isSaved: true });
  } catch (error) {
    console.error('Error toggling save post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Obtener posts guardados por el usuario actual
 * GET /api/social/posts/saved
 */
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const saved = await SavedPost.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    const posts = await Promise.all(
      saved.map((s) =>
        Post.findByPk(s.postId, {
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar', 'username'] }],
        })
      )
    );

    res.json({ success: true, data: posts.filter(Boolean) });
  } catch (error) {
    console.error('Error getting saved posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
