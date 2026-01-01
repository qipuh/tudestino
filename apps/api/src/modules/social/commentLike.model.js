import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const CommentLike = sequelize.define('CommentLike', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  commentId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'comment_id',
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'user_id',
  },
}, {
  tableName: 'social_comment_likes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['comment_id', 'user_id'],
    },
  ],
});

export default CommentLike;
