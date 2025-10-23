import * as socialService from './social.service.js';
import { Post, Reel, Like, Comment } from './social.model.sequelize.js';
import User from '../users/user.model-mysql.js';

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

    res.json({
      success: true,
      data: {
        posts,
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
 * Obtener reels de un usuario
 * GET /api/social/users/:userId/reels
 */
export const getUserReels = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

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

    res.json({
      success: true,
      data: {
        reels,
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
    const offset = (page - 1) * limit;

    // Por ahora, obtener todos los posts públicos
    // En el futuro, filtrar por usuarios seguidos
    const posts = await Post.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ success: true, data: { posts } });
  } catch (error) {
    console.error('Error getting feed:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el feed', error: error.message });
  }
};

/**
 * Obtener feed de reels
 * GET /api/social/reels/feed
 */
export const getReelsFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const reels = await Reel.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ success: true, data: { reels } });
  } catch (error) {
    console.error('Error getting reels feed:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los reels', error: error.message });
  }
};

/**
 * Toggle like en un post o reel
 * POST /api/social/like
 */
export const toggleLike = async (req, res) => {
  try {
    const { contentType, contentId } = req.body;
    const userId = req.user.id;

    // Validar tipo de contenido
    if (!['post', 'reel'].includes(contentType)) {
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

      // Decrementar contador
      const Model = contentType === 'post' ? Post : Reel;
      await Model.decrement('likesCount', {
        where: { id: contentId },
      });

      res.json({ success: true, message: 'Like eliminado', data: { liked: false } });
    } else {
      // Si no existe, crear (like)
      await Like.create({
        userId,
        contentType,
        contentId,
      });

      // Incrementar contador
      const Model = contentType === 'post' ? Post : Reel;
      await Model.increment('likesCount', {
        where: { id: contentId },
      });

      res.json({ success: true, message: 'Like agregado', data: { liked: true } });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Error al procesar el like', error: error.message });
  }
};

/**
 * Agregar comentario
 * POST /api/social/comments
 */
export const addComment = async (req, res) => {
  try {
    const { contentType, contentId, text } = req.body;
    const userId = req.user.id;

    // Validar tipo de contenido
    if (!['post', 'reel'].includes(contentType)) {
      return res.status(400).json({ message: 'Tipo de contenido inválido' });
    }

    // Validar texto
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }

    // Crear comentario
    const comment = await Comment.create({
      userId,
      contentType,
      contentId,
      text: text.trim(),
    });

    // Incrementar contador
    const Model = contentType === 'post' ? Post : Reel;
    await Model.increment('commentsCount', {
      where: { id: contentId },
    });

    // Obtener comentario con información del usuario
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'username'],
      }],
    });

    res.status(201).json({
      success: true,
      message: 'Comentario agregado',
      data: commentWithUser,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Error al agregar comentario', error: error.message });
  }
};

/**
 * Obtener comentarios de un contenido
 * GET /api/social/comments/:contentType/:contentId
 */
export const getComments = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: {
        contentType,
        contentId,
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

    res.json({
      success: true,
      data: {
        comments,
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
