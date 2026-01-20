import express from 'express';
import businessPostController from './business-post.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadSocial } from '../../middleware/upload.js';

const router = express.Router();

/**
 * Rutas públicas
 */

// Obtener un post específico
router.get('/posts/:postId', businessPostController.getPostById);

// Obtener posts de un negocio
router.get('/:businessId/posts', businessPostController.getPostsByBusiness);

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
