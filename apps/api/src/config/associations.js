import User from '../modules/users/user.model-mysql.js';
import { Property, Room } from '../modules/properties/hotel-property.model.js';
import Booking from '../modules/bookings/booking.model.js';
import Message from '../modules/messaging/message.model.js';
import Conversation from '../modules/messaging/conversation.model.js';
import Notification from '../modules/notifications/notification.model.js';
import UserFollow from '../modules/social/userFollow.model.js';
import Post from '../modules/social/post.model.js';
import Comment from '../modules/social/comment.model.js';
import PostLike from '../modules/social/postLike.model.js';
import CommentLike from '../modules/social/commentLike.model.js';
import { Post as SocialPost, Reel, Like, Comment as SocialComment } from '../modules/social/social.model.sequelize.js';
import Business from '../modules/businesses/business.model.js';
import BusinessService from '../modules/businesses/business-service.model.js';
import BusinessSocialPost from '../modules/businesses/business-social-post.model.js';
import BusinessFollow from '../modules/businesses/business-follow.model.js';
import UserSocialPost from '../modules/social/user-social-post.model.js';
import ServiceReview from '../modules/reviews/service-review.model.js';
import Country from '../modules/countries/country.model.js';
import Department from '../modules/locations/department.model.js';
import Province from '../modules/locations/province.model.js';
import District from '../modules/locations/district.model.js';
import Tour from '../modules/tours/tour.model.js';
import Attraction from '../modules/attractions/attraction.model.js';
import AttractionImage from '../modules/attractions/attraction-image.model.js';
import AttractionTag from '../modules/attractions/attraction-tag.model.js';
import Route from '../modules/routes/route.model.js';
import RouteMilestone from '../modules/routes/route-milestone.model.js';
import Address from '../modules/addresses/address.model.js';
import Media from '../modules/media/media.model.js';
import Service from '../modules/services/service.model.js';
import Reservation from '../modules/reservations/reservation.model.js';
import BusinessProfile from '../modules/business-profiles/business-profile.model.js';
import UserProfile from '../modules/user-profiles/user-profile.model.js';
import UserFavorite from '../modules/user-profiles/user-favorite.model.js';
import Offer from '../modules/offers/offer.model.js';
import Payment from '../modules/payments/payment.model.js';
import Refund from '../modules/payments/refund.model.js';
import Payout from '../modules/payments/payout.model.js';
import PayoutItem from '../modules/payments/payout-item.model.js';
import CommissionRule from '../modules/payments/commission-rule.model.js';

export const setupAssociations = () => {
  // User - Property (Host relationship)
  User.hasMany(Property, { foreignKey: 'hostId', as: 'properties' });
  Property.belongsTo(User, { foreignKey: 'hostId', as: 'host' });

  // User - Route (rutas GPS compartidas)
  User.hasMany(Route, { foreignKey: 'userId', as: 'routes' });
  Route.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Route - RouteMilestone (fotos/comentarios pinchados en el recorrido)
  Route.hasMany(RouteMilestone, { foreignKey: 'routeId', as: 'milestones' });
  RouteMilestone.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });
  User.hasMany(RouteMilestone, { foreignKey: 'userId', as: 'routeMilestones' });
  RouteMilestone.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User - Booking (Guest relationship)
  User.hasMany(Booking, { foreignKey: 'guestId', as: 'guestBookings' });
  Booking.belongsTo(User, { foreignKey: 'guestId', as: 'guest' });

  // User - Booking (Host relationship)
  User.hasMany(Booking, { foreignKey: 'hostId', as: 'hostBookings' });
  Booking.belongsTo(User, { foreignKey: 'hostId', as: 'host' });

  // Property - Room association is already defined in hotel-property.model.js

  // Property - Booking
  Property.hasMany(Booking, { foreignKey: 'propertyId', as: 'bookings' });
  Booking.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

  // Conversation - User (many-to-many through user1Id and user2Id)
  // No usamos belongsToMany porque queremos controlar exactamente los campos
  Conversation.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
  Conversation.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });

  // Booking - Conversation (opcional)
  Booking.hasOne(Conversation, { foreignKey: 'bookingId', as: 'conversation' });
  Conversation.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

  // Conversation - Message
  Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
  Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

  // User - Message (Sender)
  User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
  Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

  // User - Message (Receiver)
  User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
  Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

  // User - Notification
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User - Notification (Actor relationship)
  User.hasMany(Notification, { foreignKey: 'actorId', as: 'actedNotifications' });
  Notification.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

  // User - UserFollow (Followers)
  User.hasMany(UserFollow, { foreignKey: 'followingId', as: 'followers' });
  UserFollow.belongsTo(User, { foreignKey: 'followerId', as: 'follower' });

  // User - UserFollow (Following)
  User.hasMany(UserFollow, { foreignKey: 'followerId', as: 'following' });
  UserFollow.belongsTo(User, { foreignKey: 'followingId', as: 'following' });

  // User - Post
  User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
  Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Post - Comment
  Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
  Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

  // User - Comment
  User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
  Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Comment self-referencing for replies
  Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
  Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

  // Post - PostLike
  Post.hasMany(PostLike, { foreignKey: 'postId', as: 'likes' });
  PostLike.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
  User.hasMany(PostLike, { foreignKey: 'userId', as: 'postLikes' });
  PostLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Comment - CommentLike
  Comment.hasMany(CommentLike, { foreignKey: 'commentId', as: 'likes' });
  CommentLike.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });
  User.hasMany(CommentLike, { foreignKey: 'userId', as: 'commentLikes' });
  CommentLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // ==================== NEW SOCIAL MEDIA ASSOCIATIONS ====================

  // User - SocialPost (Posts from new social model)
  User.hasMany(SocialPost, { foreignKey: 'userId', as: 'socialPosts' });
  SocialPost.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User - Reel
  User.hasMany(Reel, { foreignKey: 'userId', as: 'reels' });
  Reel.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User - SocialComment
  User.hasMany(SocialComment, { foreignKey: 'userId', as: 'socialComments' });
  SocialComment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User - Like
  User.hasMany(Like, { foreignKey: 'userId', as: 'socialLikes' });
  Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // ==================== BUSINESS MODULE ASSOCIATIONS ====================

  // User - Business (Owner relationship)
  User.hasMany(Business, { foreignKey: 'ownerId', as: 'businesses' });
  Business.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

  // Business - BusinessService
  Business.hasMany(BusinessService, { foreignKey: 'businessId', as: 'businessServices' });
  BusinessService.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // Business - BusinessSocialPost
  Business.hasMany(BusinessSocialPost, { foreignKey: 'businessId', as: 'businessPosts' });
  BusinessSocialPost.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // User - BusinessFollow
  User.hasMany(BusinessFollow, { foreignKey: 'userId', as: 'businessFollows' });
  BusinessFollow.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Business - BusinessFollow
  Business.hasMany(BusinessFollow, { foreignKey: 'businessId', as: 'followers' });
  BusinessFollow.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // User - UserSocialPost
  User.hasMany(UserSocialPost, { foreignKey: 'userId', as: 'userPosts' });
  UserSocialPost.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User - ServiceReview
  User.hasMany(ServiceReview, { foreignKey: 'userId', as: 'serviceReviews' });
  ServiceReview.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Business - ServiceReview
  Business.hasMany(ServiceReview, { foreignKey: 'businessId', as: 'reviews' });
  ServiceReview.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // Note: Tour associations are defined in tour.model.js

  // ==================== ATTRACTIONS MODULE ASSOCIATIONS ====================

  // Attraction - AttractionImage
  Attraction.hasMany(AttractionImage, { foreignKey: 'attractionId', as: 'images' });
  AttractionImage.belongsTo(Attraction, { foreignKey: 'attractionId', as: 'attraction' });

  // Attraction - AttractionTag
  Attraction.hasMany(AttractionTag, { foreignKey: 'attractionId', as: 'tags' });
  AttractionTag.belongsTo(Attraction, { foreignKey: 'attractionId', as: 'attraction' });

  // User - Attraction (Creator relationship)
  User.hasMany(Attraction, { foreignKey: 'createdBy', as: 'attractions' });
  Attraction.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

  // ==================== LOCATION HIERARCHY ASSOCIATIONS ====================

  // Country - Department
  Country.hasMany(Department, { foreignKey: 'countryId', as: 'departments' });
  Department.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

  // Department - Province
  Department.hasMany(Province, { foreignKey: 'departmentId', as: 'provinces' });
  Province.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

  // Province - District
  Province.hasMany(District, { foreignKey: 'provinceId', as: 'districts' });
  District.belongsTo(Province, { foreignKey: 'provinceId', as: 'province' });

  // ==================== NEW POLYMORPH SYSTEM ASSOCIATIONS ====================

  // ---- Address & Location ----
  // District - Address
  District.hasMany(Address, { foreignKey: 'districtId', as: 'addresses' });
  Address.belongsTo(District, { foreignKey: 'districtId', as: 'district' });

  // Business - District (already exists above, but ensuring it's clear)
  Business.belongsTo(District, { foreignKey: 'districtId', as: 'district' });
  District.hasMany(Business, { foreignKey: 'districtId', as: 'businesses' });

  // Business - Address: no association here. businesses.address is a JSON
  // column (see business.model.js), not an addressId FK - there is no such
  // column on the table. A prior belongsTo(Address, {foreignKey:'addressId'})
  // implicitly injected a non-existent 'addressId' attribute onto every
  // Business query, breaking all business.findAll() calls app-wide.

  // ---- Media (Polymorphic) ----
  // Media no tiene FK hardcodeado (es polimórfica vía mediableType + mediableId)
  // Pero podemos definir scopes en el modelo para filtrar por tipo

  // ---- Services & Reservations ----
  // Business - Service (NEW centralizado)
  Business.hasMany(Service, { foreignKey: 'businessId', as: 'services' });
  Service.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // Business - Reservation
  Business.hasMany(Reservation, { foreignKey: 'businessId', as: 'reservations' });
  Reservation.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // User - Reservation
  User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
  Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Reservation - Service
  Reservation.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
  Service.hasMany(Reservation, { foreignKey: 'serviceId', as: 'reservations' });

  // ---- Profiles ----
  // Business - BusinessProfile
  Business.hasOne(BusinessProfile, { foreignKey: 'businessId', as: 'profile' });
  BusinessProfile.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // BusinessProfile - Owner User
  BusinessProfile.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
  User.hasMany(BusinessProfile, { foreignKey: 'ownerId', as: 'ownedBusinesses' });

  // User - UserProfile
  User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile' });
  UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // UserProfile - UserFavorite
  UserProfile.hasMany(UserFavorite, { foreignKey: 'userId', as: 'favorites' });
  UserFavorite.belongsTo(UserProfile, { foreignKey: 'userId', as: 'userProfile' });

  // UserFavorite - User & Business
  UserFavorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasMany(UserFavorite, { foreignKey: 'userId', as: 'favorites' });

  UserFavorite.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
  Business.hasMany(UserFavorite, { foreignKey: 'businessId', as: 'favoritedBy' });

  // ---- Offers ----
  Business.hasMany(Offer, { foreignKey: 'businessId', as: 'offers' });
  Offer.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // ---- Payments, Refunds, Payouts ----
  // Reservation - Payment
  Reservation.hasOne(Payment, { foreignKey: 'reservationId', as: 'payment' });
  Payment.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });

  // Business - Payment
  Business.hasMany(Payment, { foreignKey: 'businessId', as: 'payments' });
  Payment.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // Payment - Refund
  Payment.hasMany(Refund, { foreignKey: 'paymentId', as: 'refunds' });
  Refund.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

  // Refund - Reservation & User
  Refund.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });
  Reservation.hasMany(Refund, { foreignKey: 'reservationId', as: 'refunds' });

  Refund.belongsTo(User, { foreignKey: 'processedByUserId', as: 'processedBy' });
  User.hasMany(Refund, { foreignKey: 'processedByUserId', as: 'processedRefunds' });

  // Business - Payout
  Business.hasMany(Payout, { foreignKey: 'businessId', as: 'payouts' });
  Payout.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  // Payout - PayoutItem
  Payout.hasMany(PayoutItem, { foreignKey: 'payoutId', as: 'items' });
  PayoutItem.belongsTo(Payout, { foreignKey: 'payoutId', as: 'payout' });

  // PayoutItem - Payment
  PayoutItem.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });
  Payment.hasMany(PayoutItem, { foreignKey: 'paymentId', as: 'payoutItems' });

  // ---- Commission Rules ----
  Business.hasMany(CommissionRule, { foreignKey: 'businessId', as: 'commissionRules' });
  CommissionRule.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

  CommissionRule.belongsTo(User, { foreignKey: 'createdByUserId', as: 'createdBy' });
  User.hasMany(CommissionRule, { foreignKey: 'createdByUserId', as: 'commissionRules' });

  console.log('✅ Model associations configured (including Business module, Attractions, Location hierarchy, Polymorph System)');
};
