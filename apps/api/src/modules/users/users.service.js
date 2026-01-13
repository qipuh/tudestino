import User from './user.model-mysql.js';
import { AppError } from '../../middleware/errorHandler.js';
import sequelize from '../../config/database-mysql.js';

class UsersService {
  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Si se está actualizando el username, verificar que no exista
    if (updateData.username) {
      // Normalizar el username a minúsculas
      updateData.username = updateData.username.toLowerCase().trim();

      console.log('🔍 Validando username:', {
        currentUsername: user.username,
        newUsername: updateData.username,
        userId: user.id
      });

      // Solo verificar si el username está cambiando
      if (updateData.username !== user.username) {
        // Validar formato del username primero
        const usernameRegex = /^[a-z0-9-]+$/;
        if (!usernameRegex.test(updateData.username)) {
          throw new AppError('El nombre de usuario solo puede contener letras minúsculas, números y guiones', 400);
        }

        if (updateData.username.length < 3) {
          throw new AppError('El nombre de usuario debe tener al menos 3 caracteres', 400);
        }

        // Buscar si existe otro usuario con ese username (case-insensitive)
        const existingUser = await User.findOne({
          where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('username')),
            updateData.username.toLowerCase()
          )
        });

        console.log('🔎 Búsqueda de username existente:', {
          found: !!existingUser,
          existingUserId: existingUser?.id,
          isSameUser: existingUser?.id === user.id
        });

        if (existingUser && existingUser.id !== user.id) {
          throw new AppError('Este nombre de usuario ya está en uso. Por favor, elige otro.', 400);
        }
      }
    }

    await user.update(updateData);
    return user;
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async getBookingHistory(userId) {
    // TODO: Implementar lógica de bookings
    return [];
  }
}

export const usersService = new UsersService();
