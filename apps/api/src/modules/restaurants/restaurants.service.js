import Restaurant from './restaurant.model.js';
import MenuCategory from './menu-category.model.js';
import MenuItem from './menu-item.model.js';
import Reservation from './reservation.model.js';
import RestaurantImage from './restaurant-image.model.js';
import { Op } from 'sequelize';

// Establecer relaciones entre modelos
Restaurant.hasMany(MenuCategory, { foreignKey: 'restaurant_id', as: 'categories' });
MenuCategory.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

Restaurant.hasMany(MenuItem, { foreignKey: 'restaurant_id', as: 'menuItems' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

MenuCategory.hasMany(MenuItem, { foreignKey: 'category_id', as: 'items' });
MenuItem.belongsTo(MenuCategory, { foreignKey: 'category_id', as: 'category' });

Restaurant.hasMany(Reservation, { foreignKey: 'restaurant_id', as: 'reservations' });
Reservation.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

Restaurant.hasMany(RestaurantImage, { foreignKey: 'restaurant_id', as: 'images' });
RestaurantImage.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

class RestaurantsService {
  // RESTAURANTES
  async createRestaurant(restaurantData, ownerId) {
    try {
      const restaurant = await Restaurant.create({
        ...restaurantData,
        ownerId
      });
      return restaurant;
    } catch (error) {
      throw new Error(`Error creating restaurant: ${error.message}`);
    }
  }

  async getRestaurantById(id) {
    try {
      const restaurant = await Restaurant.findByPk(id, {
        include: [
          {
            model: MenuCategory,
            as: 'categories',
            where: { isActive: true },
            required: false,
            include: [
              {
                model: MenuItem,
                as: 'items',
                where: { isActive: true },
                required: false
              }
            ]
          },
          {
            model: RestaurantImage,
            as: 'images',
            order: [['displayOrder', 'ASC']]
          }
        ]
      });
      return restaurant;
    } catch (error) {
      throw new Error(`Error fetching restaurant: ${error.message}`);
    }
  }

  async updateRestaurant(id, updateData, ownerId) {
    try {
      const restaurant = await Restaurant.findOne({
        where: { id, ownerId }
      });

      if (!restaurant) {
        throw new Error('Restaurant not found or unauthorized');
      }

      await restaurant.update(updateData);
      return restaurant;
    } catch (error) {
      throw new Error(`Error updating restaurant: ${error.message}`);
    }
  }

  async deleteRestaurant(id, ownerId) {
    try {
      const restaurant = await Restaurant.findOne({
        where: { id, ownerId }
      });

      if (!restaurant) {
        throw new Error('Restaurant not found or unauthorized');
      }

      await restaurant.destroy();
      return { message: 'Restaurant deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting restaurant: ${error.message}`);
    }
  }

  async searchRestaurants(filters = {}) {
    try {
      const {
        city,
        cuisineTypes,
        priceRange,
        dietaryOptions,
        hasDelivery,
        hasTakeout,
        acceptsReservations,
        minRating,
        page = 1,
        limit = 20,
        sortBy = 'averageRating',
        sortOrder = 'DESC'
      } = filters;

      const where = {
        status: 'published',
        isActive: true
      };

      if (city) {
        where.city = { [Op.like]: `%${city}%` };
      }

      if (cuisineTypes && cuisineTypes.length > 0) {
        where.cuisineTypes = {
          [Op.contains]: cuisineTypes
        };
      }

      if (priceRange) {
        where.priceRange = priceRange;
      }

      if (dietaryOptions && dietaryOptions.length > 0) {
        where.dietaryOptions = {
          [Op.contains]: dietaryOptions
        };
      }

      if (hasDelivery !== undefined) {
        where.hasDelivery = hasDelivery;
      }

      if (hasTakeout !== undefined) {
        where.hasTakeout = hasTakeout;
      }

      if (acceptsReservations !== undefined) {
        where.acceptsReservations = acceptsReservations;
      }

      if (minRating) {
        where.averageRating = { [Op.gte]: minRating };
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Restaurant.findAndCountAll({
        where,
        include: [
          {
            model: RestaurantImage,
            as: 'images',
            where: { isMain: true },
            required: false
          }
        ],
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });

      return {
        restaurants: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(`Error searching restaurants: ${error.message}`);
    }
  }

  async getRestaurantsByOwner(ownerId) {
    try {
      const restaurants = await Restaurant.findAll({
        where: { ownerId },
        include: [
          {
            model: RestaurantImage,
            as: 'images',
            where: { isMain: true },
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return restaurants;
    } catch (error) {
      throw new Error(`Error fetching owner restaurants: ${error.message}`);
    }
  }

  // CATEGORÍAS DE MENÚ
  async createMenuCategory(categoryData) {
    try {
      const category = await MenuCategory.create(categoryData);
      return category;
    } catch (error) {
      throw new Error(`Error creating menu category: ${error.message}`);
    }
  }

  async updateMenuCategory(id, updateData, restaurantId) {
    try {
      const category = await MenuCategory.findOne({
        where: { id, restaurantId }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      await category.update(updateData);
      return category;
    } catch (error) {
      throw new Error(`Error updating menu category: ${error.message}`);
    }
  }

  async deleteMenuCategory(id, restaurantId) {
    try {
      const category = await MenuCategory.findOne({
        where: { id, restaurantId }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      await category.destroy();
      return { message: 'Category deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting menu category: ${error.message}`);
    }
  }

  // ITEMS DEL MENÚ
  async createMenuItem(itemData) {
    try {
      const item = await MenuItem.create(itemData);
      return item;
    } catch (error) {
      throw new Error(`Error creating menu item: ${error.message}`);
    }
  }

  async updateMenuItem(id, updateData, restaurantId) {
    try {
      const item = await MenuItem.findOne({
        where: { id, restaurantId }
      });

      if (!item) {
        throw new Error('Menu item not found');
      }

      await item.update(updateData);
      return item;
    } catch (error) {
      throw new Error(`Error updating menu item: ${error.message}`);
    }
  }

  async deleteMenuItem(id, restaurantId) {
    try {
      const item = await MenuItem.findOne({
        where: { id, restaurantId }
      });

      if (!item) {
        throw new Error('Menu item not found');
      }

      await item.destroy();
      return { message: 'Menu item deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting menu item: ${error.message}`);
    }
  }

  async getMenuByRestaurant(restaurantId) {
    try {
      const categories = await MenuCategory.findAll({
        where: { restaurantId, isActive: true },
        include: [
          {
            model: MenuItem,
            as: 'items',
            where: { isActive: true },
            required: false
          }
        ],
        order: [
          ['displayOrder', 'ASC'],
          [{ model: MenuItem, as: 'items' }, 'displayOrder', 'ASC']
        ]
      });
      return categories;
    } catch (error) {
      throw new Error(`Error fetching menu: ${error.message}`);
    }
  }

  // RESERVAS
  async createReservation(reservationData) {
    try {
      // Generar código de confirmación único
      const confirmationCode = this.generateConfirmationCode();

      const reservation = await Reservation.create({
        ...reservationData,
        confirmationCode,
        status: 'pending'
      });

      return reservation;
    } catch (error) {
      throw new Error(`Error creating reservation: ${error.message}`);
    }
  }

  async updateReservation(id, updateData, userId) {
    try {
      const reservation = await Reservation.findOne({
        where: { id, userId }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      await reservation.update(updateData);
      return reservation;
    } catch (error) {
      throw new Error(`Error updating reservation: ${error.message}`);
    }
  }

  async updateReservationByRestaurant(id, updateData, restaurantId) {
    try {
      const reservation = await Reservation.findOne({
        where: { id, restaurantId }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      await reservation.update(updateData);
      return reservation;
    } catch (error) {
      throw new Error(`Error updating reservation: ${error.message}`);
    }
  }

  async cancelReservation(id, userId, reason) {
    try {
      const reservation = await Reservation.findOne({
        where: { id, userId }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      await reservation.update({
        status: 'cancelled',
        cancellationReason: reason,
        cancelledBy: 'customer',
        cancelledAt: new Date()
      });

      return reservation;
    } catch (error) {
      throw new Error(`Error cancelling reservation: ${error.message}`);
    }
  }

  async getReservationsByUser(userId, status = null) {
    try {
      const where = { userId };
      if (status) {
        where.status = status;
      }

      const reservations = await Reservation.findAll({
        where,
        include: [
          {
            model: Restaurant,
            as: 'restaurant',
            include: [
              {
                model: RestaurantImage,
                as: 'images',
                where: { isMain: true },
                required: false
              }
            ]
          }
        ],
        order: [['reservationDate', 'DESC'], ['reservationTime', 'DESC']]
      });

      return reservations;
    } catch (error) {
      throw new Error(`Error fetching user reservations: ${error.message}`);
    }
  }

  async getReservationsByRestaurant(restaurantId, date = null) {
    try {
      const where = { restaurantId };
      if (date) {
        where.reservationDate = date;
      }

      const reservations = await Reservation.findAll({
        where,
        order: [['reservationDate', 'ASC'], ['reservationTime', 'ASC']]
      });

      return reservations;
    } catch (error) {
      throw new Error(`Error fetching restaurant reservations: ${error.message}`);
    }
  }

  // IMÁGENES
  async addRestaurantImage(imageData) {
    try {
      const image = await RestaurantImage.create(imageData);
      return image;
    } catch (error) {
      throw new Error(`Error adding image: ${error.message}`);
    }
  }

  async deleteRestaurantImage(id, restaurantId) {
    try {
      const image = await RestaurantImage.findOne({
        where: { id, restaurantId }
      });

      if (!image) {
        throw new Error('Image not found');
      }

      await image.destroy();
      return { message: 'Image deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting image: ${error.message}`);
    }
  }

  async setMainImage(id, restaurantId) {
    try {
      // Desmarcar todas las imágenes principales actuales
      await RestaurantImage.update(
        { isMain: false },
        { where: { restaurantId } }
      );

      // Marcar la nueva imagen como principal
      const image = await RestaurantImage.findOne({
        where: { id, restaurantId }
      });

      if (!image) {
        throw new Error('Image not found');
      }

      await image.update({ isMain: true });
      return image;
    } catch (error) {
      throw new Error(`Error setting main image: ${error.message}`);
    }
  }

  // UTILIDADES
  generateConfirmationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export default new RestaurantsService();
