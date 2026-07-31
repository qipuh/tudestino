import { Op } from 'sequelize';
import User from '../users/user.model-mysql.js';
import { Property } from '../properties/hotel-property.model.js';
import Booking from '../bookings/booking.model.js';
import Business from '../businesses/business.model.js';
import Config from './config.model.js';

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getStats() {
    try {
      // Get current date and first day of month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [
        totalUsers,
        totalProperties,
        totalBookings,
        newUsersThisMonth,
        newPropertiesThisMonth,
        newUsersLastMonth,
        newPropertiesLastMonth,
        revenueResult
      ] = await Promise.all([
        User.count(),
        Property.count(),
        Booking.count(),
        User.count({ where: { createdAt: { [Op.gte]: firstDayOfMonth } } }),
        Property.count({ where: { createdAt: { [Op.gte]: firstDayOfMonth } } }),
        User.count({
          where: {
            createdAt: { [Op.gte]: firstDayOfLastMonth, [Op.lt]: firstDayOfMonth },
          },
        }),
        Property.count({
          where: {
            createdAt: { [Op.gte]: firstDayOfLastMonth, [Op.lt]: firstDayOfMonth },
          },
        }),
        Booking.sum('totalPrice', { where: { status: 'confirmed' } }),
      ]);

      // Calculate growth percentages
      const growthUsers = newUsersLastMonth > 0
        ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
        : 0;

      const growthProperties = newPropertiesLastMonth > 0
        ? Math.round(((newPropertiesThisMonth - newPropertiesLastMonth) / newPropertiesLastMonth) * 100)
        : 0;

      const totalRevenue = revenueResult || 0;

      return {
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue,
        newUsersThisMonth,
        newPropertiesThisMonth,
        growthUsers,
        growthProperties
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  }

  /**
   * Get recent users
   */
  async getRecentUsers(limit = 5) {
    try {
      const users = await User.findAll({
        limit,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'role', 'avatar', 'createdAt']
      });

      return users;
    } catch (error) {
      console.error('Error getting recent users:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers({ page = 1, limit = 10, search = '', role = null }) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      if (role) {
        where.role = role;
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] }
      });

      return {
        users: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Get all businesses with pagination (hoteles, restaurantes, tours, etc.)
   */
  async getAllBusinesses({ page = 1, limit = 10, search = '', type = null }) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }

      if (type) {
        where.businessType = type;
      }

      const { count, rows } = await Business.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      });

      return {
        businesses: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error('Error getting all businesses:', error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId, isActive) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await user.update({ isActive });
      return user;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await user.destroy();
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get WhatsApp API configuration
   */
  async getWhatsAppConfig() {
    try {
      const config = await Config.findOne({
        where: { key: 'whatsapp_api_token' }
      });

      return config ? config.value : null;
    } catch (error) {
      console.error('Error getting WhatsApp config:', error);
      throw error;
    }
  }

  /**
   * Set WhatsApp API configuration
   */
  async setWhatsAppConfig(token) {
    try {
      const [config, created] = await Config.findOrCreate({
        where: { key: 'whatsapp_api_token' },
        defaults: {
          key: 'whatsapp_api_token',
          value: token,
          description: 'Token de autenticación para WhatsApp API (Factiliza)',
          isEncrypted: false
        }
      });

      if (!created) {
        await config.update({ value: token });
      }

      return config;
    } catch (error) {
      console.error('Error setting WhatsApp config:', error);
      throw error;
    }
  }
}

export default new AdminService();
