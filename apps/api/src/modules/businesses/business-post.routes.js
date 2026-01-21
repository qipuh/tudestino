import express from 'express';
import businessPostController from './business-post.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { uploadSocial } from '../../middleware/upload.js';

const router = express.Router();

// Middleware de logging para debug
router.use((req, _res, next) => {
  console.log('🔍 business-post.routes - Request:', {
    method: req.method,
    path: req.path,
    url: req.url,
    params: req.params,
    hasAuth: !!req.headers.authorization
  });
  next();
});

/**
 * Rutas públicas (con autenticación opcional)
 */

// Obtener un post específico
router.get('/posts/:postId', optionalAuthenticate, businessPostController.getPostById);

// Obtener posts de un negocio
router.get('/:businessId/posts', optionalAuthenticate, businessPostController.getPostsByBusiness);

/**
 * Rutas protegidas (requieren autenticación)
 */

// Aplicar autenticación a todas las rutas siguientes
router.use(authenticate);

// Obtener feed de posts de negocios seguidos
router.get('/posts/feed', businessPostController.getFeedPosts);

// Crear post para un negocio (hasta 10 archivos de media)
router.post('/:businessId/posts', uploadSocial.array('media', 10), businessPostController.createPost);

// Actualizar post
router.put('/posts/:postId', businessPostController.updatePost);

// Eliminar post
router.delete('/posts/:postId', businessPostController.deletePost);

// Like/Unlike post
router.post('/posts/:postId/like', businessPostController.toggleLike);

export default router;
