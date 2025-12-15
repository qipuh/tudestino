import businessService from './business.service.js';
import businessPropertyService from './business-property.service.js';

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
   */
  async searchBusinesses(req, res) {
    try {
      const filters = {
        businessType: req.query.type,
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
}

export default new BusinessController();
