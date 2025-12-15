import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const BusinessSocialPost = sequelize.define('BusinessSocialPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  caption: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  media: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of media objects: [{url, type: image|video, thumbnail, alt}]',
    validate: {
      isArrayWithMedia(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Media debe ser un array con al menos un elemento');
        }
      }
    }
  },
  type: {
    type: DataTypes.ENUM('post', 'reel', 'story'),
    defaultValue: 'post'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de hashtags y menciones'
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sharesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'business_social_posts',
  timestamps: true,
  indexes: [
    { fields: ['businessId'] },
    { fields: ['type'] },
    { fields: ['createdAt'] },
    { fields: ['likesCount'] },
    { fields: ['isActive'] }
  ]
});

export default BusinessSocialPost;
