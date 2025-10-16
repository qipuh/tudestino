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
