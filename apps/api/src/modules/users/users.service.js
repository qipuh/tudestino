import User from './user.model-mysql.js';
import { AppError } from '../../middleware/errorHandler.js';

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
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await User.findOne({
        where: { username: updateData.username }
      });

      if (existingUser) {
        throw new AppError('Este nombre de usuario ya está en uso', 400);
      }

      // Validar formato del username
      const usernameRegex = /^[a-z0-9-]+$/;
      if (!usernameRegex.test(updateData.username)) {
        throw new AppError('El nombre de usuario solo puede contener letras minúsculas, números y guiones', 400);
      }

      if (updateData.username.length < 3) {
        throw new AppError('El nombre de usuario debe tener al menos 3 caracteres', 400);
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
