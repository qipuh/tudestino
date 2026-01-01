import User from '../users/user.model-mysql.js';
import UserFollow from './userFollow.model.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

// ==================== PROFILE SERVICES ====================

// Obtener perfil público de un usuario
export const getUserProfile = async (userId, currentUserId = null) => {
  const user = await User.findByPk(userId, {
    attributes: [
      'id', 'name', 'avatar', 'username', 'bio', 'travelInterests',
      'visitedDestinations', 'travelStyle', 'followersCount',
      'followingCount', 'reelsCount', 'totalLikes', 'isPublicProfile',
      'location', 'createdAt', 'role'
    ]
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Si el perfil es privado y no es el dueño
  if (!user.isPublicProfile && user.id !== currentUserId) {
    throw new Error('Este perfil es privado');
  }

  const profileData = user.toJSON();

  // Si hay un usuario actual, verificar si lo sigue
  if (currentUserId) {
    const isFollowing = await UserFollow.findOne({
      where: {
        followerId: currentUserId,
        followingId: userId,
        status: 'active'
      }
    });
    profileData.isFollowing = !!isFollowing;
    profileData.isOwnProfile = currentUserId === userId;
  } else {
    profileData.isFollowing = false;
    profileData.isOwnProfile = false;
  }

  return profileData;
};

// Actualizar perfil social del usuario
export const updateSocialProfile = async (userId, updates) => {
  const allowedFields = [
    'username', 'bio', 'travelBio', 'travelInterests', 'visitedDestinations',
    'travelStyle', 'isPublicProfile', 'allowMessages'
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }

  // Validar username si se está actualizando
  if (updateData.username) {
    const isAvailable = await checkUsernameAvailability(updateData.username, userId);
    if (!isAvailable) {
      throw new Error('El username ya está en uso');
    }
  }

  await User.update(updateData, {
    where: { id: userId }
  });

  return getUserProfile(userId, userId);
};

// Obtener estadísticas del perfil
export const getProfileStats = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [
      'followersCount', 'followingCount', 'reelsCount',
      'totalLikes', 'hostRating', 'hostReviewCount'
    ]
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user.toJSON();
};

// ==================== FOLLOW SERVICES ====================

// Seguir a un usuario
export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new Error('No puedes seguirte a ti mismo');
  }

  // Verificar que el usuario a seguir existe
  const userToFollow = await User.findByPk(followingId);
  if (!userToFollow) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar si ya sigue al usuario
  const existingFollow = await UserFollow.findOne({
    where: { followerId, followingId }
  });

  if (existingFollow) {
    if (existingFollow.status === 'active') {
      throw new Error('Ya sigues a este usuario');
    }
    // Reactivar seguimiento
    await existingFollow.update({ status: 'active' });
  } else {
    // Crear nuevo seguimiento
    await UserFollow.create({ followerId, followingId });
  }

  // Actualizar contadores
  await Promise.all([
    User.increment('followingCount', { where: { id: followerId } }),
    User.increment('followersCount', { where: { id: followingId } })
  ]);

  return { success: true, message: 'Ahora sigues a este usuario' };
};

// Dejar de seguir a un usuario
export const unfollowUser = async (followerId, followingId) => {
  const follow = await UserFollow.findOne({
    where: {
      followerId,
      followingId,
      status: 'active'
    }
  });

  if (!follow) {
    throw new Error('No sigues a este usuario');
  }

  await follow.destroy();

  // Actualizar contadores
  await Promise.all([
    User.decrement('followingCount', { where: { id: followerId } }),
    User.decrement('followersCount', { where: { id: followingId } })
  ]);

  return { success: true, message: 'Has dejado de seguir a este usuario' };
};

// Obtener lista de seguidores
export const getFollowers = async (userId, limit = 20, offset = 0) => {
  const followers = await UserFollow.findAll({
    where: {
      followingId: userId,
      status: 'active'
    },
    include: [{
      model: User,
      as: 'follower',
      attributes: ['id', 'name', 'avatar', 'bio', 'followersCount']
    }],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  const total = await UserFollow.count({
    where: { followingId: userId, status: 'active' }
  });

  return {
    followers: followers.map(f => f.follower),
    total,
    hasMore: offset + limit < total
  };
};

// Obtener lista de seguidos
export const getFollowing = async (userId, limit = 20, offset = 0) => {
  const following = await UserFollow.findAll({
    where: {
      followerId: userId,
      status: 'active'
    },
    include: [{
      model: User,
      as: 'following',
      attributes: ['id', 'name', 'avatar', 'bio', 'followersCount']
    }],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  const total = await UserFollow.count({
    where: { followerId: userId, status: 'active' }
  });

  return {
    following: following.map(f => f.following),
    total,
    hasMore: offset + limit < total
  };
};

// Verificar si un usuario sigue a otro
export const checkFollowStatus = async (followerId, followingId) => {
  const follow = await UserFollow.findOne({
    where: {
      followerId,
      followingId,
      status: 'active'
    }
  });

  return {
    isFollowing: !!follow,
    followedAt: follow?.createdAt || null
  };
};

// Buscar usuarios (para seguir)
export const searchUsers = async (query, currentUserId, limit = 20) => {
  const users = await User.findAll({
    where: {
      id: { [Op.ne]: currentUserId },
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { location: { [Op.like]: `%${query}%` } }
      ],
      isActive: true
    },
    attributes: ['id', 'name', 'avatar', 'bio', 'location', 'followersCount'],
    limit
  });

  // Agregar estado de seguimiento
  const usersWithFollowStatus = await Promise.all(
    users.map(async (user) => {
      const userData = user.toJSON();
      const followStatus = await checkFollowStatus(currentUserId, user.id);
      userData.isFollowing = followStatus.isFollowing;
      return userData;
    })
  );

  return usersWithFollowStatus;
};

// ==================== USERNAME SERVICES ====================

// Verificar disponibilidad de username
export const checkUsernameAvailability = async (username, currentUserId = null) => {
  // No permitir usernames vacíos o null
  if (!username || username.trim() === '') {
    return false;
  }

  const existingUser = await User.findOne({
    where: {
      username: username.toLowerCase().trim()
    }
  });

  if (!existingUser) {
    return true; // Disponible
  }

  // Si el username pertenece al usuario actual, está disponible para él
  // Normalizar comparación (ambos como strings)
  return String(existingUser.id) === String(currentUserId);
};

// Obtener perfil por username
export const getProfileByUsername = async (username, currentUserId = null) => {
  const user = await User.findOne({
    where: { username },
    attributes: [
      'id', 'name', 'avatar', 'username', 'bio', 'travelInterests',
      'visitedDestinations', 'travelStyle', 'followersCount',
      'followingCount', 'reelsCount', 'totalLikes', 'isPublicProfile',
      'location', 'createdAt', 'role'
    ]
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Si el perfil es privado y no es el dueño
  if (!user.isPublicProfile && user.id !== currentUserId) {
    throw new Error('Este perfil es privado');
  }

  const profileData = user.toJSON();

  // Si hay un usuario actual, verificar si lo sigue
  if (currentUserId) {
    const isFollowing = await UserFollow.findOne({
      where: {
        followerId: currentUserId,
        followingId: user.id,
        status: 'active'
      }
    });
    profileData.isFollowing = !!isFollowing;
    profileData.isOwnProfile = currentUserId === user.id;
  } else {
    profileData.isFollowing = false;
    profileData.isOwnProfile = false;
  }

  return profileData;
};
