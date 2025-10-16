import User from '../users/user.model-mysql.js';
import Post from './post.model.js';
import Comment from './comment.model.js';
import PostLike from './postLike.model.js';
import CommentLike from './commentLike.model.js';

export function setupSocialAssociations() {
  // User has many Posts
  User.hasMany(Post, {
    foreignKey: 'userId',
    as: 'posts',
  });
  Post.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Post has many Comments
  Post.hasMany(Comment, {
    foreignKey: 'postId',
    as: 'comments',
  });
  Comment.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post',
  });

  // User has many Comments
  User.hasMany(Comment, {
    foreignKey: 'userId',
    as: 'comments',
  });
  Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Comment self-referencing for replies
  Comment.hasMany(Comment, {
    foreignKey: 'parentId',
    as: 'replies',
  });
  Comment.belongsTo(Comment, {
    foreignKey: 'parentId',
    as: 'parent',
  });

  // Post Likes
  User.hasMany(PostLike, {
    foreignKey: 'userId',
    as: 'postLikes',
  });
  Post.hasMany(PostLike, {
    foreignKey: 'postId',
    as: 'likes',
  });
  PostLike.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });
  PostLike.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post',
  });

  // Comment Likes
  User.hasMany(CommentLike, {
    foreignKey: 'userId',
    as: 'commentLikes',
  });
  Comment.hasMany(CommentLike, {
    foreignKey: 'commentId',
    as: 'likes',
  });
  CommentLike.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });
  CommentLike.belongsTo(Comment, {
    foreignKey: 'commentId',
    as: 'comment',
  });

  console.log('✅ Social associations configured');
}
