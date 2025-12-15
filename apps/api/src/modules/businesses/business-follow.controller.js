import businessFollowService from './business-follow.service.js';

class BusinessFollowController {
  /**
   * Seguir un negocio
   * POST /api/businesses/:businessId/follow
   */
  async followBusiness(req, res) {
    try {
      const { businessId } = req.params;
      const userId = req.user.id;

      const result = await businessFollowService.followBusiness(userId, businessId);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: { following: result.following }
      });
    } catch (error) {
      console.error('Error en followBusiness:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Dejar de seguir un negocio
   * DELETE /api/businesses/:businessId/follow
   */
  async unfollowBusiness(req, res) {
    try {
      const { businessId } = req.params;
      const userId = req.user.id;

      const result = await businessFollowService.unfollowBusiness(userId, businessId);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: { following: result.following }
      });
    } catch (error) {
      console.error('Error en unfollowBusiness:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Verificar si sigue un negocio
   * GET /api/businesses/:businessId/following
   */
  async checkFollowing(req, res) {
    try {
      const { businessId } = req.params;
      const userId = req.user.id;

      const isFollowing = await businessFollowService.isFollowing(userId, businessId);

      return res.status(200).json({
        success: true,
        data: { isFollowing }
      });
    } catch (error) {
      console.error('Error en checkFollowing:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener negocios que sigue el usuario
   * GET /api/businesses/following/my-followed
   */
  async getMyFollowedBusinesses(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await businessFollowService.getFollowedBusinesses(
        userId,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en getMyFollowedBusinesses:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener seguidores de un negocio
   * GET /api/businesses/:businessId/followers
   */
  async getBusinessFollowers(req, res) {
    try {
      const { businessId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await businessFollowService.getBusinessFollowers(
        businessId,
        page,
        limit
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en getBusinessFollowers:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar configuración de notificaciones
   * PATCH /api/businesses/:businessId/follow/notifications
   */
  async updateNotifications(req, res) {
    try {
      const { businessId } = req.params;
      const userId = req.user.id;
      const { notificationsEnabled } = req.body;

      const result = await businessFollowService.updateNotificationSettings(
        userId,
        businessId,
        notificationsEnabled
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: { notificationsEnabled: result.notificationsEnabled }
      });
    } catch (error) {
      console.error('Error en updateNotifications:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bloquear/Desbloquear negocio
   * PATCH /api/businesses/:businessId/follow/block
   */
  async toggleBlock(req, res) {
    try {
      const { businessId } = req.params;
      const userId = req.user.id;

      const result = await businessFollowService.toggleBlockStatus(userId, businessId);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: { status: result.status }
      });
    } catch (error) {
      console.error('Error en toggleBlock:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new BusinessFollowController();
