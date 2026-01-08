import User from '../users/user.model-mysql.js';
import Property from '../properties/property.model.js';
import Booking from '../bookings/booking.model.js';
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

      // Total counts using MongoDB/Mongoose
      const [
        totalUsers,
        totalProperties,
        totalBookings,
        newUsersThisMonth,
        newPropertiesThisMonth,
        newUsersLastMonth,
        newPropertiesLastMonth
      ] = await Promise.all([
        User.count(),
        Property.countDocuments(),
        Booking.countDocuments(),
        User.count({ createdAt: { $gte: firstDayOfMonth } }),
        Property.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
        User.count({
          createdAt: {
            $gte: firstDayOfLastMonth,
            $lt: firstDayOfMonth
          }
        }),
        Property.countDocuments({
          createdAt: {
            $gte: firstDayOfLastMonth,
            $lt: firstDayOfMonth
          }
        })
      ]);

      // Calculate growth percentages
      const growthUsers = newUsersLastMonth > 0
        ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
        : 0;

      const growthProperties = newPropertiesLastMonth > 0
        ? Math.round(((newPropertiesThisMonth - newPropertiesLastMonth) / newPropertiesLastMonth) * 100)
        : 0;

      // Calculate total revenue (sum of all confirmed bookings)
      const revenueResult = await Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]);
      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

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
        where.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (role) {
        where.role = role;
      }

      // Using MySQL User model (Sequelize)
      const { count, rows } = await User.findAndCountAll({
        where: search ? {
          [Symbol.for('or')]: [
            { name: { [Symbol.for('like')]: `%${search}%` } },
            { email: { [Symbol.for('like')]: `%${search}%` } }
          ]
        } : (role ? { role } : {}),
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
