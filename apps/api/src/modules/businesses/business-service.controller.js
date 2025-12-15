import businessServiceService from './business-service.service.js';

class BusinessServiceController {
  /**
   * Crear un nuevo servicio
   * POST /api/businesses/:businessId/services
   */
  async createService(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user.id;
      const serviceData = req.body;

      const service = await businessServiceService.createService(
        businessId,
        ownerId,
        serviceData
      );

      return res.status(201).json({
        success: true,
        message: 'Servicio creado exitosamente',
        data: service
      });
    } catch (error) {
      console.error('Error en createService:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener todos los servicios de un negocio
   * GET /api/businesses/:businessId/services
   */
  async getServicesByBusiness(req, res) {
    try {
      const { businessId } = req.params;
      const filters = {
        serviceType: req.query.type,
        status: req.query.status,
        isActive: req.query.isActive === 'true'
      };

      const services = await businessServiceService.getServicesByBusiness(
        businessId,
        filters
      );

      return res.status(200).json({
        success: true,
        data: services
      });
    } catch (error) {
      console.error('Error en getServicesByBusiness:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener un servicio específico
   * GET /api/businesses/services/:serviceId
   */
  async getServiceById(req, res) {
    try {
      const { serviceId } = req.params;

      const service = await businessServiceService.getServiceById(serviceId);

      return res.status(200).json({
        success: true,
        data: service
      });
    } catch (error) {
      console.error('Error en getServiceById:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar un servicio
   * PUT /api/businesses/services/:serviceId
   */
  async updateService(req, res) {
    try {
      const { serviceId } = req.params;
      const ownerId = req.user.id;
      const updateData = req.body;

      const service = await businessServiceService.updateService(
        serviceId,
        ownerId,
        updateData
      );

      return res.status(200).json({
        success: true,
        message: 'Servicio actualizado exitosamente',
        data: service
      });
    } catch (error) {
      console.error('Error en updateService:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar un servicio
   * DELETE /api/businesses/services/:serviceId
   */
  async deleteService(req, res) {
    try {
      const { serviceId } = req.params;
      const ownerId = req.user.id;

      const result = await businessServiceService.deleteService(serviceId, ownerId);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteService:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Reordenar servicios
   * POST /api/businesses/:businessId/services/reorder
   */
  async reorderServices(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user.id;
      const { servicesOrder } = req.body;

      const result = await businessServiceService.reorderServices(
        businessId,
        ownerId,
        servicesOrder
      );

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error en reorderServices:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Cambiar estado de un servicio
   * PATCH /api/businesses/services/:serviceId/toggle
   */
  async toggleServiceStatus(req, res) {
    try {
      const { serviceId } = req.params;
      const ownerId = req.user.id;

      const service = await businessServiceService.toggleServiceStatus(
        serviceId,
        ownerId
      );

      return res.status(200).json({
        success: true,
        message: 'Estado del servicio actualizado',
        data: service
      });
    } catch (error) {
      console.error('Error en toggleServiceStatus:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new BusinessServiceController();
