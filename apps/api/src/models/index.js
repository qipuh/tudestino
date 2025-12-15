import sequelize from '../config/database-mysql.js';

// Import all models
import Business from '../modules/businesses/business.model.js';
import BusinessService from '../modules/businesses/business-service.model.js';
import BusinessSocialPost from '../modules/businesses/business-social-post.model.js';
import BusinessFollow from '../modules/businesses/business-follow.model.js';
import UserSocialPost from '../modules/social/user-social-post.model.js';
import ServiceReview from '../modules/reviews/service-review.model.js';

// TODO: Import existing models when they are migrated to Sequelize
// import User from '../modules/users/user.model.js';
// import Property from '../modules/properties/property.model.js';
// import Restaurant from '../modules/restaurants/restaurant.model.js';
// import Entertainment from '../modules/entertainment/entertainment.model.js';
// import Event from '../modules/events/event.model.js';
// import Booking from '../modules/bookings/booking.model.js';

// ============================================
// RELACIONES PRINCIPALES
// ============================================

// Business pertenece a User (owner)
// Business.belongsTo(User, {
//   foreignKey: 'ownerId',
//   as: 'owner'
// });
// User.hasMany(Business, {
//   foreignKey: 'ownerId',
//   as: 'businesses'
// });

// ============================================
// BUSINESS SERVICES
// ============================================

// BusinessService pertenece a Business
BusinessService.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});

Business.hasMany(BusinessService, {
  foreignKey: 'businessId',
  as: 'services',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});

// ============================================
// SERVICIOS ESPECÍFICOS
// ============================================

// TODO: Cuando los modelos estén migrados a Sequelize
// Property.belongsTo(BusinessService, { foreignKey: 'businessServiceId', as: 'businessService' });
// Restaurant.belongsTo(BusinessService, { foreignKey: 'businessServiceId', as: 'businessService' });
// Entertainment.belongsTo(BusinessService, { foreignKey: 'businessServiceId', as: 'businessService' });
// Event.belongsTo(BusinessService, { foreignKey: 'businessServiceId', as: 'businessService' });

// ============================================
// RED SOCIAL DE NEGOCIOS
// ============================================

// BusinessSocialPost pertenece a Business
BusinessSocialPost.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});

Business.hasMany(BusinessSocialPost, {
  foreignKey: 'businessId',
  as: 'posts',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});

// ============================================
// RED SOCIAL DE USUARIOS
// ============================================

// UserSocialPost pertenece a User
// UserSocialPost.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'user',
//   onUpdate: 'CASCADE',
//   onDelete: 'CASCADE'
// });

// User.hasMany(UserSocialPost, {
//   foreignKey: 'userId',
//   as: 'posts',
//   onUpdate: 'CASCADE',
//   onDelete: 'CASCADE'
// });

// ============================================
// SEGUIDORES DE NEGOCIOS
// ============================================

// BusinessFollow - Usuario sigue a Negocio
// BusinessFollow.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'follower',
//   onUpdate: 'CASCADE',
//   onDelete: 'CASCADE'
// });

BusinessFollow.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});

// User.belongsToMany(Business, {
//   through: BusinessFollow,
//   foreignKey: 'userId',
//   otherKey: 'businessId',
//   as: 'followedBusinesses'
// });

Business.belongsToMany(Business, {
  through: BusinessFollow,
  foreignKey: 'businessId',
  otherKey: 'userId',
  as: 'followers'
});

// ============================================
// RESEÑAS DE SERVICIOS
// ============================================

// ServiceReview pertenece a User y Business
// ServiceReview.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'user',
//   onUpdate: 'CASCADE',
//   onDelete: 'CASCADE'
// });

ServiceReview.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});

// User.hasMany(ServiceReview, {
//   foreignKey: 'userId',
//   as: 'reviews'
// });

Business.hasMany(ServiceReview, {
  foreignKey: 'businessId',
  as: 'reviews'
});

// ============================================
// RESERVAS
// ============================================

// TODO: Cuando Booking esté migrado a Sequelize
// Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// Booking.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
// User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
// Business.hasMany(Booking, { foreignKey: 'businessId', as: 'bookings' });

// ============================================
// EXPORT MODELS
// ============================================

export {
  sequelize,
  Business,
  BusinessService,
  BusinessSocialPost,
  BusinessFollow,
  UserSocialPost,
  ServiceReview
};

export default {
  sequelize,
  Business,
  BusinessService,
  BusinessSocialPost,
  BusinessFollow,
  UserSocialPost,
  ServiceReview
};
