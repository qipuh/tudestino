import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'post_id',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    comment: 'For nested replies',
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
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true,
});

export default Comment;
