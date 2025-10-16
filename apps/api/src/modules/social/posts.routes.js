import express from 'express';
import { postsController } from './posts.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

// Get all posts (with optional type filter, e.g., ?type=reel)
router.get('/posts', optionalAuthenticate, postsController.getAllPosts);

// Get posts for a user (public with optional auth)
router.get('/users/:userId/posts', optionalAuthenticate, postsController.getUserPosts);

// Create a new post (authenticated) with file upload
router.post('/posts', authenticate, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), postsController.createPost);

// Toggle like on a post (authenticated)
router.post('/posts/:postId/like', authenticate, postsController.togglePostLike);

// Get comments for a post (public with optional auth)
router.get('/posts/:postId/comments', optionalAuthenticate, postsController.getPostComments);

// Add a comment (authenticated)
router.post('/posts/:postId/comments', authenticate, postsController.addComment);

// Toggle like on a comment (authenticated)
router.post('/comments/:commentId/like', authenticate, postsController.toggleCommentLike);

export default router;
