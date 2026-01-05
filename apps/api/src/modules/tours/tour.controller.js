import tourService from './tour.service.js';

class TourController {
  /**
   * Crear un nuevo tour
   * POST /api/businesses/:businessId/tours
   */
  async createTour(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user.id;
      const tourData = req.body;

      const tour = await tourService.createTour(businessId, ownerId, tourData);

      return res.status(201).json({
        success: true,
        message: 'Tour creado exitosamente',
        data: tour
      });
    } catch (error) {
      console.error('Error en createTour:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener todos los tours de un negocio
   * GET /api/businesses/:businessId/tours
   */
  async getToursByBusiness(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user ? req.user.id : null;

      const tours = await tourService.getToursByBusiness(businessId, ownerId);

      return res.status(200).json({
        success: true,
        data: tours
      });
    } catch (error) {
      console.error('Error en getToursByBusiness:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener un tour por ID
   * GET /api/tours/:id
   */
  async getTourById(req, res) {
    try {
      const { id } = req.params;

      const tour = await tourService.getTourById(id);

      return res.status(200).json({
        success: true,
        data: tour
      });
    } catch (error) {
      console.error('Error en getTourById:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener un tour por slug
   * GET /api/tours/slug/:slug
   */
  async getTourBySlug(req, res) {
    try {
      const { slug } = req.params;

      const tour = await tourService.getTourBySlug(slug);

      return res.status(200).json({
        success: true,
        data: tour
      });
    } catch (error) {
      console.error('Error en getTourBySlug:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar un tour
   * PUT /api/tours/:id
   */
  async updateTour(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const updateData = req.body;

      const tour = await tourService.updateTour(id, ownerId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Tour actualizado exitosamente',
        data: tour
      });
    } catch (error) {
      console.error('Error en updateTour:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar un tour
   * DELETE /api/tours/:id
   */
  async deleteTour(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;

      const result = await tourService.deleteTour(id, ownerId);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deleteTour:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar tours
   * GET /api/tours/search
   */
  async searchTours(req, res) {
    try {
      const filters = req.query;

      const result = await tourService.searchTours(filters);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en searchTours:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new TourController();
