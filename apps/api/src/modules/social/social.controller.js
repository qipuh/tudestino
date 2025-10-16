import * as socialService from './social.service.js';

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
