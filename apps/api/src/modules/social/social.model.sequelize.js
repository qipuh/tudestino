import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

/**
 * Modelo de Post (Publicación)
 * Similar a Instagram posts
 */
export const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'user_id',
  },
  caption: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  media: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of media objects: [{url, type: image|video, thumbnail}]',
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likes_count',
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'comments_count',
  },
  sharesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'shares_count',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'social_posts',
  timestamps: true,
  underscored: true,
});

/**
 * Modelo de Reel (Video corto)
 * Similar a Instagram Reels / TikTok
 */
export const Reel = sequelize.define('Reel', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'user_id',
  },
  caption: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'video_url',
  },
  thumbnailUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'thumbnail_url',
  },
  duration: {
    type: DataTypes.INTEGER,
    comment: 'Duration in seconds',
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views_count',
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likes_count',
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'comments_count',
  },
  sharesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'shares_count',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'social_reels',
  timestamps: true,
  underscored: true,
});

/**
 * Modelo de Like
 */
export const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'user_id',
  },
  contentType: {
    type: DataTypes.ENUM('post', 'reel', 'comment', 'route'),
    allowNull: false,
    field: 'content_type',
    comment: 'Tipo de contenido: post, reel, comment o route',
  },
  contentId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'content_id',
    comment: 'ID del post, reel o comentario',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  tableName: 'social_likes',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'content_type', 'content_id'],
    },
  ],
});

/**
 * Modelo de Comment
 */
export const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'user_id',
  },
  contentType: {
    type: DataTypes.ENUM('post', 'reel', 'route'),
    allowNull: false,
    field: 'content_type',
  },
  contentId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'content_id',
  },
  parentCommentId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    field: 'parent_comment_id',
    comment: 'ID del comentario padre si es una respuesta',
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likes_count',
  },
  repliesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'replies_count',
    comment: 'Número de respuestas a este comentario',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'social_comments',
  timestamps: true,
  underscored: true,
});

/**
 * Modelo de SavedPost - posts que un usuario guardó (bookmark)
 */
export const SavedPost = sequelize.define('SavedPost', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'user_id',
  },
  postId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'post_id',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  tableName: 'social_saved_posts',
  timestamps: false,
  underscored: true,
  indexes: [
    { unique: true, fields: ['user_id', 'post_id'] },
  ],
});

export default { Post, Reel, Like, Comment, SavedPost };
