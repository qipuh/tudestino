import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const EventImage = sequelize.define('EventImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'event_id',
    references: {
      model: 'events',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  caption: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('cover', 'gallery', 'banner', 'poster', 'flyer', 'venue', 'other'),
    allowNull: false,
    defaultValue: 'gallery'
  },
  isCover: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_cover',
    defaultValue: false
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order',
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'event_images',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['display_order']
    }
  ]
});

export default EventImage;
