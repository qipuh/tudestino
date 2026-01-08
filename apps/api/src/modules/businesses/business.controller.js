import businessService from './business.service.js';
import businessPropertyService from './business-property.service.js';
import BusinessReservation from './business-reservation.model.js';
import Business from './business.model.js';
import User from '../users/user.model-mysql.js';
import MenuItem from './menu-item.model.js';
import BusinessPhoto from './business-photo.model.js';

class BusinessController {
  /**
   * Crear un nuevo negocio
   * POST /api/businesses
   */
  async createBusiness(req, res) {
    try {
      const ownerId = req.user.id;
      const businessData = req.body;

      // Validar que el usuario sea business_owner
      if (req.user.role !== 'business_owner' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los usuarios con rol business_owner pueden crear negocios'
        });
      }

      const business = await businessService.createBusiness(ownerId, businessData);

      return res.status(201).json({
        success: true,
        message: 'Negocio creado exitosamente',
        data: business
      });
    } catch (error) {
      console.error('Error en createBusiness:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener un negocio por ID
   * GET /api/businesses/:id
   */
  async getBusinessById(req, res) {
    try {
      const { id } = req.params;
      const includeRelations = req.query.include === 'true';

      const business = await businessService.getBusinessById(id, includeRelations);

      return res.status(200).json({
        success: true,
        data: business
      });
    } catch (error) {
      console.error('Error en getBusinessById:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener negocio por slug
   * GET /api/businesses/slug/:slug
   */
  async getBusinessBySlug(req, res) {
    try {
      const { slug } = req.params;
      const includeRelations = req.query.include === 'true';

      const business = await businessService.getBusinessBySlug(slug, includeRelations);

      return res.status(200).json({
        success: true,
        data: business
      });
    } catch (error) {
      console.error('Error en getBusinessBySlug:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener todos los negocios del usuario autenticado
   * GET /api/businesses/my-businesses
   */
  async getMyBusinesses(req, res) {
    try {
      const ownerId = req.user.id;

      const businesses = await businessService.getBusinessesByOwner(ownerId);

      return res.status(200).json({
        success: true,
        data: businesses
      });
    } catch (error) {
      console.error('Error en getMyBusinesses:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener negocios de un usuario específico
   * GET /api/businesses/user/:userId
   */
  async getBusinessesByUser(req, res) {
    try {
      const { userId } = req.params;

      const businesses = await businessService.getBusinessesByOwner(userId);

      // Filtrar solo negocios activos para usuarios que no sean el dueño
      const filteredBusinesses = businesses.filter(b =>
        b.isActive && b.status === 'active'
      );

      return res.status(200).json({
        success: true,
        data: filteredBusinesses
      });
    } catch (error) {
      console.error('Error en getBusinessesByUser:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar un negocio
   * PUT /api/businesses/:id
   */
  async updateBusiness(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const updateData = req.body;

      const business = await businessService.updateBusiness(id, ownerId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Negocio actualizado exitosamente',
        data: business
      });
    } catch (error) {
      console.error('Error en updateBusiness:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar un negocio
   * DELETE /api/businesses/:id
   */
  async deleteBusiness(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;

      const result = await businessService.deleteBusiness(id, ownerId);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteBusiness:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar negocios
   * GET /api/businesses/search
   * Query params: type, businessType, status, q, page, limit
   */
  async searchBusinesses(req, res) {
    try {
      const filters = {
        // Aceptar tanto 'type' como 'businessType' para flexibilidad
        businessType: req.query.type || req.query.businessType,
        status: req.query.status || 'active',
        search: req.query.q
      };

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await businessService.searchBusinesses(filters, page, limit);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en searchBusinesses:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Verificar un negocio (solo admin)
   * POST /api/businesses/:id/verify
   */
  async verifyBusiness(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden verificar negocios'
        });
      }

      const { id } = req.params;
      const { verificationStatus } = req.body;

      const business = await businessService.verifyBusiness(id, verificationStatus);

      return res.status(200).json({
        success: true,
        message: 'Negocio verificado exitosamente',
        data: business
      });
    } catch (error) {
      console.error('Error en verifyBusiness:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Crear propiedad con habitaciones para un negocio (hotel)
   * POST /api/businesses/:businessId/properties
   */
  async createPropertyWithRooms(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user.id;
      const propertyData = req.body;

      // Validar que el usuario sea business_owner
      if (req.user.role !== 'business_owner' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los usuarios con rol business_owner pueden crear propiedades'
        });
      }

      const property = await businessPropertyService.createPropertyWithRooms(
        businessId,
        ownerId,
        propertyData
      );

      return res.status(201).json({
        success: true,
        message: 'Propiedad y habitaciones creadas exitosamente',
        data: property
      });
    } catch (error) {
      console.error('Error en createPropertyWithRooms:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener propiedad de un negocio con habitaciones
   * GET /api/businesses/:businessId/properties
   */
  async getBusinessProperty(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user ? req.user.id : null;

      const property = await businessPropertyService.getBusinessProperty(businessId, ownerId);

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Este negocio no tiene una propiedad configurada'
        });
      }

      return res.status(200).json({
        success: true,
        data: property
      });
    } catch (error) {
      console.error('Error en getBusinessProperty:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Crear una reservación para un negocio
   * POST /api/businesses/:businessId/reservations
   */
  async createReservation(req, res) {
    try {
      const { businessId } = req.params;
      const userId = req.user.id;
      const { reservationDate, reservationTime, numberOfPeople, specialRequests } = req.body;

      // Generar código de confirmación
      const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const reservation = await BusinessReservation.create({
        businessId,
        userId,
        reservationDate,
        reservationTime,
        numberOfPeople,
        specialRequests,
        confirmationCode,
        status: 'pending'
      });

      // Obtener información completa de la reservación
      const fullReservation = await BusinessReservation.findByPk(reservation.id, {
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'businessType', 'contactPhone', 'contactEmail']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return res.status(201).json({
        success: true,
        message: 'Reservación creada exitosamente',
        data: fullReservation
      });
    } catch (error) {
      console.error('Error en createReservation:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener reservaciones de un usuario
   * GET /api/businesses/reservations/my-reservations
   */
  async getMyReservations(req, res) {
    try {
      const userId = req.user.id;

      const reservations = await BusinessReservation.findAll({
        where: { userId },
        include: [
          {
            model: Business,
            as: 'business',
            attributes: ['id', 'name', 'businessType', 'logo', 'contactPhone']
          }
        ],
        order: [['reservationDate', 'DESC'], ['reservationTime', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: reservations
      });
    } catch (error) {
      console.error('Error en getMyReservations:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Cancelar una reservación
   * PUT /api/businesses/reservations/:reservationId/cancel
   */
  async cancelReservation(req, res) {
    try {
      const { reservationId } = req.params;
      const userId = req.user.id;

      const reservation = await BusinessReservation.findOne({
        where: { id: reservationId, userId }
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservación no encontrada'
        });
      }

      if (reservation.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'La reservación ya está cancelada'
        });
      }

      await reservation.update({ status: 'cancelled' });

      return res.status(200).json({
        success: true,
        message: 'Reservación cancelada exitosamente',
        data: reservation
      });
    } catch (error) {
      console.error('Error en cancelReservation:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener reservaciones de un negocio (para el dueño)
   * GET /api/businesses/:businessId/reservations
   */
  async getBusinessReservations(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user.id;

      // Verificar que el usuario sea dueño del negocio
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver estas reservaciones'
        });
      }

      const reservations = await BusinessReservation.findAll({
        where: { businessId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          }
        ],
        order: [['reservationDate', 'ASC'], ['reservationTime', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: reservations
      });
    } catch (error) {
      console.error('Error en getBusinessReservations:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar el estado de una reservación (para el dueño)
   * PUT /api/businesses/:businessId/reservations/:reservationId/status
   */
  async updateReservationStatus(req, res) {
    try {
      const { businessId, reservationId } = req.params;
      const { status } = req.body;
      const ownerId = req.user.id;

      // Verificar que el usuario sea dueño del negocio
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para modificar esta reservación'
        });
      }

      const reservation = await BusinessReservation.findOne({
        where: { id: reservationId, businessId }
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservación no encontrada'
        });
      }

      await reservation.update({ status });

      return res.status(200).json({
        success: true,
        message: 'Estado de reservación actualizado',
        data: reservation
      });
    } catch (error) {
      console.error('Error en updateReservationStatus:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener menú de un restaurante
   * GET /api/businesses/:businessId/menu
   */
  async getMenu(req, res) {
    try {
      const { businessId } = req.params;

      const menuItems = await MenuItem.findAll({
        where: { businessId },
        order: [['category', 'ASC'], ['displayOrder', 'ASC'], ['name', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: menuItems
      });
    } catch (error) {
      console.error('Error en getMenu:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Crear un item del menú
   * POST /api/businesses/:businessId/menu
   */
  async createMenuItem(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user.id;
      const { name, description, category, price, isAvailable, isSpecial } = req.body;

      // Verificar que el usuario sea dueño del negocio
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para modificar este negocio'
        });
      }

      const menuItemData = {
        businessId,
        name,
        description: description || '',
        category,
        price: parseFloat(price),
        isAvailable: isAvailable === '1' || isAvailable === true || isAvailable === 'true',
        isSpecial: isSpecial === '1' || isSpecial === true || isSpecial === 'true'
      };

      // Procesar imagen si existe
      if (req.file) {
        menuItemData.image = req.file.filename;
      }

      const menuItem = await MenuItem.create(menuItemData);

      return res.status(201).json({
        success: true,
        message: 'Plato agregado al menú',
        data: menuItem
      });
    } catch (error) {
      console.error('Error en createMenuItem:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar un item del menú
   * PUT /api/businesses/:businessId/menu/:itemId
   */
  async updateMenuItem(req, res) {
    try {
      const { businessId, itemId } = req.params;
      const ownerId = req.user.id;
      const { name, description, category, price, isAvailable, isSpecial } = req.body;

      // Verificar que el usuario sea dueño del negocio
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para modificar este negocio'
        });
      }

      const menuItem = await MenuItem.findOne({
        where: { id: itemId, businessId }
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Plato no encontrado'
        });
      }

      const updateData = {
        name,
        description: description || '',
        category,
        price: parseFloat(price),
        isAvailable: isAvailable === '1' || isAvailable === true || isAvailable === 'true',
        isSpecial: isSpecial === '1' || isSpecial === true || isSpecial === 'true'
      };

      // Procesar imagen si existe
      if (req.file) {
        updateData.image = req.file.filename;
      }

      await menuItem.update(updateData);

      return res.status(200).json({
        success: true,
        message: 'Plato actualizado',
        data: menuItem
      });
    } catch (error) {
      console.error('Error en updateMenuItem:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar un item del menú
   * DELETE /api/businesses/:businessId/menu/:itemId
   */
  async deleteMenuItem(req, res) {
    try {
      const { businessId, itemId } = req.params;
      const ownerId = req.user.id;

      // Verificar que el usuario sea dueño del negocio
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para modificar este negocio'
        });
      }

      const menuItem = await MenuItem.findOne({
        where: { id: itemId, businessId }
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Plato no encontrado'
        });
      }

      await menuItem.destroy();

      return res.status(200).json({
        success: true,
        message: 'Plato eliminado del menú'
      });
    } catch (error) {
      console.error('Error en deleteMenuItem:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener fotos de un negocio
   * GET /api/businesses/:businessId/photos
   */
  async getPhotos(req, res) {
    try {
      const { businessId } = req.params;

      const photos = await BusinessPhoto.findAll({
        where: { businessId },
        order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: photos
      });
    } catch (error) {
      console.error('Error en getPhotos:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Subir foto de un negocio
   * POST /api/businesses/:businessId/photos
   */
  async uploadPhoto(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user.id;
      const { caption } = req.body;

      // Verificar que el usuario sea dueño del negocio
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para modificar este negocio'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha subido ninguna foto'
        });
      }

      const photo = await BusinessPhoto.create({
        businessId,
        url: req.file.filename,
        caption
      });

      return res.status(201).json({
        success: true,
        message: 'Foto subida exitosamente',
        data: photo
      });
    } catch (error) {
      console.error('Error en uploadPhoto:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar foto de un negocio
   * DELETE /api/businesses/:businessId/photos/:photoId
   */
  async deletePhoto(req, res) {
    try {
      const { businessId, photoId } = req.params;
      const ownerId = req.user.id;

      // Verificar que el usuario sea dueño del negocio
      const business = await Business.findOne({
        where: { id: businessId, ownerId }
      });

      if (!business) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para modificar este negocio'
        });
      }

      const photo = await BusinessPhoto.findOne({
        where: { id: photoId, businessId }
      });

      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Foto no encontrada'
        });
      }

      await photo.destroy();

      return res.status(200).json({
        success: true,
        message: 'Foto eliminada'
      });
    } catch (error) {
      console.error('Error en deletePhoto:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new BusinessController();
