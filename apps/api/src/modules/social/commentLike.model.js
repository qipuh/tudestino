import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const CommentLike = sequelize.define('CommentLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'comment_id',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
}, {
  tableName: 'comment_likes',
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
