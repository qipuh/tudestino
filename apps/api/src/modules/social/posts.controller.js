import Post from './post.model.js';
import Comment from './comment.model.js';
import PostLike from './postLike.model.js';
import CommentLike from './commentLike.model.js';
import User from '../users/user.model-mysql.js';

export const postsController = {
  // Get all posts (with optional type filter)
  async getAllPosts(req, res) {
    try {
      const { type } = req.query;
      const whereClause = type ? { type } : {};

      const posts = await Post.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Get like status for current user
      if (req.user) {
        const postIds = posts.map(p => p.id);
        const userLikes = await PostLike.findAll({
          where: {
            postId: postIds,
            userId: req.user.id,
          },
        });
        const likedPostIds = new Set(userLikes.map(l => l.postId));

        posts.forEach(post => {
          post.dataValues.isLiked = likedPostIds.has(post.id);
        });
      }

      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Error al obtener publicaciones' });
    }
  },

  // Get all posts for a user
  async getUserPosts(req, res) {
    try {
      const { userId } = req.params;
      const { type } = req.query;
      const whereClause = { userId };
      if (type) whereClause.type = type;

      const posts = await Post.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Get like status for current user
      if (req.user) {
        const postIds = posts.map(p => p.id);
        const userLikes = await PostLike.findAll({
          where: {
            postId: postIds,
            userId: req.user.id,
          },
        });
        const likedPostIds = new Set(userLikes.map(l => l.postId));

        posts.forEach(post => {
          post.dataValues.isLiked = likedPostIds.has(post.id);
        });
      }

      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Error al obtener publicaciones' });
    }
  },

  // Create a new post
  async createPost(req, res) {
    try {
      const { content, type } = req.body;

      console.log('📝 Creating post:', { content, type, files: req.files });

      // Handle uploaded files
      let images = [];
      let videoUrl = null;

      if (req.files) {
        if (type === 'reel' && req.files.video) {
          // Single video for reel
          videoUrl = `/uploads/posts/${req.files.video[0].filename}`;
        } else if (type === 'post' && req.files.images) {
          // Multiple images for post
          images = req.files.images.map(file => `/uploads/posts/${file.filename}`);
        }
      }

      const post = await Post.create({
        userId: req.user.id,
        content,
        images: images || [],
        type: type || 'post',
        videoUrl,
      });

      const postWithUser = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
          },
        ],
      });

      console.log('✅ Post created:', postWithUser.id);
      res.status(201).json(postWithUser);
    } catch (error) {
      console.error('❌ Error creating post:', error);
      res.status(500).json({ message: 'Error al crear publicación', error: error.message });
    }
  },

  // Toggle like on a post
  async togglePostLike(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      console.log('👍 Toggle like request:', { postId, userId });

      const existingLike = await PostLike.findOne({
        where: { postId, userId },
      });

      if (existingLike) {
        // Unlike
        console.log('❌ Removing like:', { postId, userId });
        await existingLike.destroy();
        await Post.decrement('likesCount', { where: { id: postId } });

        const post = await Post.findByPk(postId);
        console.log('✅ Like removed, new count:', post.likesCount);
        res.json({ liked: false, likesCount: post.likesCount });
      } else {
        // Like
        console.log('✅ Adding like:', { postId, userId });
        await PostLike.create({ postId, userId });
        await Post.increment('likesCount', { where: { id: postId } });

        const post = await Post.findByPk(postId);
        console.log('✅ Like added, new count:', post.likesCount);
        res.json({ liked: true, likesCount: post.likesCount });
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      res.status(500).json({ message: 'Error al dar like' });
    }
  },

  // Get comments for a post
  async getPostComments(req, res) {
    try {
      const { postId } = req.params;

      const comments = await Comment.findAll({
        where: { postId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      // Organize comments into threads (parent comments with their replies)
      const commentMap = {};
      const rootComments = [];

      // Convert all comments to JSON first to preserve associations
      comments.forEach(comment => {
        const commentJSON = comment.toJSON();
        commentMap[comment.id] = {
          ...commentJSON,
          replies: [],
          // Ensure user data is present
          user: commentJSON.user || {
            id: comment.userId,
            name: 'Usuario',
            avatar: null,
          },
        };
      });

      // Build comment tree
      comments.forEach(comment => {
        if (comment.parentId) {
          if (commentMap[comment.parentId]) {
            commentMap[comment.parentId].replies.push(commentMap[comment.id]);
          }
        } else {
          rootComments.push(commentMap[comment.id]);
        }
      });

      // Get like status for current user
      if (req.user) {
        const commentIds = comments.map(c => c.id);
        const userLikes = await CommentLike.findAll({
          where: {
            commentId: commentIds,
            userId: req.user.id,
          },
        });
        const likedCommentIds = new Set(userLikes.map(l => l.commentId));

        const markLikes = (comment) => {
          comment.isLiked = likedCommentIds.has(comment.id);
          comment.replies?.forEach(markLikes);
        };

        rootComments.forEach(markLikes);
      }

      res.json(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ message: 'Error al obtener comentarios' });
    }
  },

  // Add a comment to a post
  async addComment(req, res) {
    try {
      const { postId } = req.params;
      const { text, parentId } = req.body;

      console.log('💬 Add comment request:', { postId, userId: req.user.id, text: text.substring(0, 50) });

      const comment = await Comment.create({
        postId,
        userId: req.user.id,
        text,
        parentId: parentId || null,
      });

      // Increment comment count
      await Post.increment('commentsCount', { where: { id: postId } });

      const commentWithUser = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
          },
        ],
      });

      console.log('✅ Comment added:', { commentId: comment.id });
      res.status(201).json(commentWithUser);
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      res.status(500).json({ message: 'Error al agregar comentario' });
    }
  },

  // Toggle like on a comment
  async toggleCommentLike(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      console.log('💬👍 Toggle comment like:', { commentId, userId });

      const existingLike = await CommentLike.findOne({
        where: { commentId, userId },
      });

      if (existingLike) {
        // Unlike
        console.log('❌ Removing comment like:', { commentId, userId });
        await existingLike.destroy();
        await Comment.decrement('likesCount', { where: { id: commentId } });

        const comment = await Comment.findByPk(commentId);
        console.log('✅ Comment like removed, new count:', comment.likesCount);
        res.json({ liked: false, likesCount: comment.likesCount });
      } else {
        // Like
        console.log('✅ Adding comment like:', { commentId, userId });
        await CommentLike.create({ commentId, userId });
        await Comment.increment('likesCount', { where: { id: commentId } });

        const comment = await Comment.findByPk(commentId);
        console.log('✅ Comment like added, new count:', comment.likesCount);
        res.json({ liked: true, likesCount: comment.likesCount });
      }
    } catch (error) {
      console.error('❌ Error toggling comment like:', error);
      res.status(500).json({ message: 'Error al dar like al comentario' });
    }
  },
};
