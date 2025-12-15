import restaurantsService from './restaurants.service.js';

class RestaurantsController {
  // RESTAURANTES
  async createRestaurant(req, res) {
    try {
      const restaurant = await restaurantsService.createRestaurant(
        req.body,
        req.user.id
      );
      res.status(201).json(restaurant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRestaurant(req, res) {
    try {
      const restaurant = await restaurantsService.getRestaurantById(
        req.params.id
      );

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json(restaurant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateRestaurant(req, res) {
    try {
      const restaurant = await restaurantsService.updateRestaurant(
        req.params.id,
        req.body,
        req.user.id
      );
      res.json(restaurant);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRestaurant(req, res) {
    try {
      const result = await restaurantsService.deleteRestaurant(
        req.params.id,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchRestaurants(req, res) {
    try {
      const filters = {
        city: req.query.city,
        cuisineTypes: req.query.cuisineTypes ? JSON.parse(req.query.cuisineTypes) : undefined,
        priceRange: req.query.priceRange ? parseInt(req.query.priceRange) : undefined,
        dietaryOptions: req.query.dietaryOptions ? JSON.parse(req.query.dietaryOptions) : undefined,
        hasDelivery: req.query.hasDelivery === 'true',
        hasTakeout: req.query.hasTakeout === 'true',
        acceptsReservations: req.query.acceptsReservations === 'true',
        minRating: req.query.minRating ? parseFloat(req.query.minRating) : undefined,
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await restaurantsService.searchRestaurants(filters);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyRestaurants(req, res) {
    try {
      const restaurants = await restaurantsService.getRestaurantsByOwner(
        req.user.id
      );
      res.json(restaurants);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // CATEGORÍAS DE MENÚ
  async createMenuCategory(req, res) {
    try {
      const category = await restaurantsService.createMenuCategory({
        ...req.body,
        restaurantId: req.params.restaurantId
      });
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMenuCategory(req, res) {
    try {
      const category = await restaurantsService.updateMenuCategory(
        req.params.categoryId,
        req.body,
        req.params.restaurantId
      );
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteMenuCategory(req, res) {
    try {
      const result = await restaurantsService.deleteMenuCategory(
        req.params.categoryId,
        req.params.restaurantId
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ITEMS DEL MENÚ
  async createMenuItem(req, res) {
    try {
      const item = await restaurantsService.createMenuItem({
        ...req.body,
        restaurantId: req.params.restaurantId
      });
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMenuItem(req, res) {
    try {
      const item = await restaurantsService.updateMenuItem(
        req.params.itemId,
        req.body,
        req.params.restaurantId
      );
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteMenuItem(req, res) {
    try {
      const result = await restaurantsService.deleteMenuItem(
        req.params.itemId,
        req.params.restaurantId
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRestaurantMenu(req, res) {
    try {
      const menu = await restaurantsService.getMenuByRestaurant(
        req.params.restaurantId
      );
      res.json(menu);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // RESERVAS
  async createReservation(req, res) {
    try {
      const reservation = await restaurantsService.createReservation({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReservation(req, res) {
    try {
      const reservation = await restaurantsService.updateReservation(
        req.params.reservationId,
        req.body,
        req.user.id
      );
      res.json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReservationStatus(req, res) {
    try {
      const reservation = await restaurantsService.updateReservationByRestaurant(
        req.params.reservationId,
        req.body,
        req.params.restaurantId
      );
      res.json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelReservation(req, res) {
    try {
      const reservation = await restaurantsService.cancelReservation(
        req.params.reservationId,
        req.user.id,
        req.body.reason
      );
      res.json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyReservations(req, res) {
    try {
      const reservations = await restaurantsService.getReservationsByUser(
        req.user.id,
        req.query.status
      );
      res.json(reservations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRestaurantReservations(req, res) {
    try {
      const reservations = await restaurantsService.getReservationsByRestaurant(
        req.params.restaurantId,
        req.query.date
      );
      res.json(reservations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // IMÁGENES
  async addRestaurantImage(req, res) {
    try {
      const image = await restaurantsService.addRestaurantImage({
        ...req.body,
        restaurantId: req.params.restaurantId
      });
      res.status(201).json(image);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRestaurantImage(req, res) {
    try {
      const result = await restaurantsService.deleteRestaurantImage(
        req.params.imageId,
        req.params.restaurantId
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async setMainImage(req, res) {
    try {
      const image = await restaurantsService.setMainImage(
        req.params.imageId,
        req.params.restaurantId
      );
      res.json(image);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new RestaurantsController();
