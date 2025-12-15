import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const ServiceReview = sequelize.define('ServiceReview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID del servicio (property, restaurant, entertainment, event)'
  },
  serviceType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Tipo de servicio: property, restaurant, entertainment, event'
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Calificación de 1 a 5'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de URLs de imágenes de la reseña'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si la reseña es de una reserva confirmada'
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'service_reviews',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['businessId'] },
    { fields: ['serviceId', 'serviceType'] },
    { fields: ['rating'] },
    { fields: ['isVerified'] },
    { fields: ['createdAt'] }
  ]
});

export default ServiceReview;
