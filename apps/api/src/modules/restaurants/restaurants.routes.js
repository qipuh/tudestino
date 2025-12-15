import express from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import restaurantsController from './restaurants.controller.js';

const router = express.Router();

// RUTAS PÚBLICAS (sin autenticación)
router.get('/search', restaurantsController.searchRestaurants);
router.get('/:id', restaurantsController.getRestaurant);
router.get('/:restaurantId/menu', restaurantsController.getRestaurantMenu);

// RUTAS PROTEGIDAS - GESTIÓN DE RESTAURANTES
router.post('/', authenticate, restaurantsController.createRestaurant);
router.get('/owner/my-restaurants', authenticate, restaurantsController.getMyRestaurants);
router.put('/:id', authenticate, restaurantsController.updateRestaurant);
router.delete('/:id', authenticate, restaurantsController.deleteRestaurant);

// RUTAS PROTEGIDAS - GESTIÓN DE MENÚ
// Categorías
router.post(
  '/:restaurantId/categories',
  authenticate,
  restaurantsController.createMenuCategory
);
router.put(
  '/:restaurantId/categories/:categoryId',
  authenticate,
  restaurantsController.updateMenuCategory
);
router.delete(
  '/:restaurantId/categories/:categoryId',
  authenticate,
  restaurantsController.deleteMenuCategory
);

// Items del menú
router.post(
  '/:restaurantId/menu-items',
  authenticate,
  restaurantsController.createMenuItem
);
router.put(
  '/:restaurantId/menu-items/:itemId',
  authenticate,
  restaurantsController.updateMenuItem
);
router.delete(
  '/:restaurantId/menu-items/:itemId',
  authenticate,
  restaurantsController.deleteMenuItem
);

// RUTAS PROTEGIDAS - RESERVAS
// Crear y gestionar reservas por usuario
router.post(
  '/:restaurantId/reservations',
  authenticate,
  restaurantsController.createReservation
);
router.get(
  '/user/reservations',
  authenticate,
  restaurantsController.getMyReservations
);
router.put(
  '/reservations/:reservationId',
  authenticate,
  restaurantsController.updateReservation
);
router.post(
  '/reservations/:reservationId/cancel',
  authenticate,
  restaurantsController.cancelReservation
);

// Gestión de reservas por restaurante
router.get(
  '/:restaurantId/reservations',
  authenticate,
  restaurantsController.getRestaurantReservations
);
router.put(
  '/:restaurantId/reservations/:reservationId/status',
  authenticate,
  restaurantsController.updateReservationStatus
);

// RUTAS PROTEGIDAS - IMÁGENES
router.post(
  '/:restaurantId/images',
  authenticate,
  restaurantsController.addRestaurantImage
);
router.delete(
  '/:restaurantId/images/:imageId',
  authenticate,
  restaurantsController.deleteRestaurantImage
);
router.put(
  '/:restaurantId/images/:imageId/set-main',
  authenticate,
  restaurantsController.setMainImage
);

export default router;
