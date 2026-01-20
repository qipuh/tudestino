import businessPostService from './business-post.service.js';

class BusinessPostController {
  /**
   * Crear un post para un negocio
   * POST /api/businesses/:businessId/posts
   */
  async createPost(req, res) {
    try {
      const { businessId } = req.params;
      const ownerId = req.user.id;
      const { caption, location, type } = req.body;

      // Validar que haya archivos
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere al menos un archivo (imagen o video)'
        });
      }

      // Construir array de media con información de cada archivo
      const media = req.files.map(file => ({
        url: `/uploads/social/${file.filename}`,
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        thumbnail: file.mimetype.startsWith('video/') ? `/uploads/social/thumbnails/${file.filename}.jpg` : null,
      }));

      const postData = {
        caption,
        location: location || null,
        type: type || 'post',
        media
      };

      const post = await businessPostService.createPost(businessId, ownerId, postData);

      return res.status(201).json({
        success: true,
        message: 'Post creado exitosamente',
        data: post
      });
    } catch (error) {
      console.error('Error en createPost:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener posts de un negocio
   * GET /api/businesses/:businessId/posts
   */
  async getPostsByBusiness(req, res) {
    try {
      const { businessId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const type = req.query.type;

      const result = await businessPostService.getPostsByBusiness(
        businessId,
        page,
        limit,
        type
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en getPostsByBusiness:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener un post específico
   * GET /api/businesses/posts/:postId
   */
  async getPostById(req, res) {
    try {
      const { postId } = req.params;

      const post = await businessPostService.getPostById(postId);

      return res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error en getPostById:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar un post
   * PUT /api/businesses/posts/:postId
   */
  async updatePost(req, res) {
    try {
      const { postId } = req.params;
      const ownerId = req.user.id;
      const updateData = req.body;

      const post = await businessPostService.updatePost(postId, ownerId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Post actualizado exitosamente',
        data: post
      });
    } catch (error) {
      console.error('Error en updatePost:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar un post
   * DELETE /api/businesses/posts/:postId
   */
  async deletePost(req, res) {
    try {
      const { postId } = req.params;
      const ownerId = req.user.id;

      const result = await businessPostService.deletePost(postId, ownerId);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error en deletePost:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener feed de posts de negocios
   * GET /api/businesses/posts/feed
   */
  async getFeedPosts(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await businessPostService.getFeedPosts(userId, page, limit);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en getFeedPosts:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Like/Unlike un post
   * POST /api/businesses/posts/:postId/like
   */
  async toggleLike(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const result = await businessPostService.toggleLike(postId, userId);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en toggleLike:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new BusinessPostController();
