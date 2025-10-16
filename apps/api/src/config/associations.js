import User from '../modules/users/user.model-mysql.js';
import Property from '../modules/properties/property.model-mysql.js';
import Booking from '../modules/bookings/booking.model.js';
import Message from '../modules/messaging/message.model.js';
import Conversation from '../modules/messaging/conversation.model.js';
import Notification from '../modules/notifications/notification.model.js';
import UserFollow from '../modules/social/userFollow.model.js';
import Post from '../modules/social/post.model.js';
import Comment from '../modules/social/comment.model.js';
import PostLike from '../modules/social/postLike.model.js';
import CommentLike from '../modules/social/commentLike.model.js';

export const setupAssociations = () => {
  // User - Property (Host relationship)
  User.hasMany(Property, { foreignKey: 'hostId', as: 'properties' });
  Property.belongsTo(User, { foreignKey: 'hostId', as: 'host' });

  // User - Booking (Guest relationship)
  User.hasMany(Booking, { foreignKey: 'guestId', as: 'guestBookings' });
  Booking.belongsTo(User, { foreignKey: 'guestId', as: 'guest' });

  // User - Booking (Host relationship)
  User.hasMany(Booking, { foreignKey: 'hostId', as: 'hostBookings' });
  Booking.belongsTo(User, { foreignKey: 'hostId', as: 'host' });

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

  console.log('✅ Model associations configured');
};
