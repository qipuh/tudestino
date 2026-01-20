import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageSquare, Calendar, Briefcase, Users, UserPlus, Share2, AtSign, Trash2, Check } from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../../services/notificationService';
import { getImageUrl } from '../../../services/api';
import useAuthStore from '../../../store/authStore';

function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Cargar notificaciones
  const loadNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await getNotifications(pageNum, 20);

      if (append) {
        setNotifications(prev => [...prev, ...response.notifications]);
      } else {
        setNotifications(response.notifications);
      }

      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar notificaciones al montar
  useEffect(() => {
    loadNotifications();

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadNotifications(1, false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Manejar click en notificación
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  // Marcar todas como leídas
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Eliminar notificación
  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Cargar más notificaciones
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage, true);
  };

  // Obtener icono según el tipo
  const getNotificationIcon = (type) => {
    const iconMap = {
      new_follower: UserPlus,
      post_liked: Heart,
      reel_liked: Heart,
      comment_liked: Heart,
      comment_received: MessageSquare,
      post_shared: Share2,
      user_mentioned: AtSign,
      booking_request: Calendar,
      booking_confirmed: Calendar,
      booking_cancelled: Calendar,
      message_received: MessageSquare,
      review_received: Users,
      property_approved: Briefcase,
      property_rejected: Briefcase,
    };
    return iconMap[type] || Bell;
  };

  // Obtener color según el tipo
  const getNotificationColor = (type) => {
    const colorMap = {
      new_follower: 'text-blue-600 bg-blue-100',
      post_liked: 'text-red-600 bg-red-100',
      reel_liked: 'text-red-600 bg-red-100',
      comment_liked: 'text-pink-600 bg-pink-100',
      comment_received: 'text-purple-600 bg-purple-100',
      post_shared: 'text-green-600 bg-green-100',
      user_mentioned: 'text-orange-600 bg-orange-100',
      booking_request: 'text-yellow-600 bg-yellow-100',
      booking_confirmed: 'text-green-600 bg-green-100',
      booking_cancelled: 'text-red-600 bg-red-100',
      message_received: 'text-blue-600 bg-blue-100',
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  // Obtener link según el tipo
  const getNotificationLink = (notification) => {
    const linkMap = {
      new_follower: `/profile/${notification.actorId}`,
      post_liked: `/profile/${user?.id}?tab=muro`,
      reel_liked: `/profile/${user?.id}?tab=reels`,
      comment_liked: `/profile/${user?.id}?tab=muro`,
      comment_received: `/profile/${user?.id}?tab=muro`,
      post_shared: `/profile/${user?.id}?tab=muro`,
      user_mentioned: `/profile/${user?.id}?tab=muro`,
      booking_request: `/account/bookings`,
      booking_confirmed: `/account/bookings`,
      booking_cancelled: `/account/bookings`,
      message_received: `/messages`,
    };
    return linkMap[notification.type] || '#';
  };

  // Formatear tiempo relativo
  const getRelativeTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return notificationDate.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white text-sm font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Mantente al día con todas tus actualizaciones
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Check size={16} />
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading && notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
              <p className="mt-4 text-gray-600 font-medium">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes notificaciones
              </h3>
              <p className="text-gray-600">
                Cuando tengas nuevas notificaciones, aparecerán aquí
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  const link = getNotificationLink(notification);
                  const actor = notification.actor;

                  return (
                    <div
                      key={notification.id}
                      className={`group relative hover:bg-gray-50 transition cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <Link
                        to={link}
                        onClick={() => handleNotificationClick(notification)}
                        className="block p-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar del actor si existe */}
                          {actor && (
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 overflow-hidden">
                                {actor.avatar ? (
                                  <img
                                    src={getImageUrl(actor.avatar, 'social')}
                                    alt={actor.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary">
                                    {actor.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              {/* Icono de tipo en la esquina */}
                              <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full ${colorClass}`}>
                                <Icon size={14} />
                              </div>
                            </div>
                          )}

                          {/* Icono solo si no hay actor */}
                          {!actor && (
                            <div className={`p-3 rounded-full flex-shrink-0 ${colorClass}`}>
                              <Icon size={20} />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {getRelativeTime(notification.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                                <button
                                  onClick={(e) => handleDelete(notification.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-600"
                                  title="Eliminar notificación"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Botón Cargar más */}
              {hasMore && !loading && (
                <div className="p-4 border-t border-gray-200 text-center">
                  <button
                    onClick={loadMore}
                    className="px-6 py-2 text-primary hover:text-primary-dark font-medium hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    Cargar más
                  </button>
                </div>
              )}

              {loading && notifications.length > 0 && (
                <div className="p-4 border-t border-gray-200 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary"></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
