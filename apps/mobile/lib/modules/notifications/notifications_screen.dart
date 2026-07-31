import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../providers/notification_provider.dart';
import '../../models/app_notification.dart';
import '../../core/theme/app_theme.dart';

const _typeIcons = {
  'booking_request': (Icons.event_note, Colors.orange),
  'booking_confirmed': (Icons.check_circle, Colors.green),
  'booking_cancelled': (Icons.cancel, Colors.red),
  'message_received': (Icons.chat_bubble, Colors.blue),
  'payment_received': (Icons.payments, Colors.green),
  'review_received': (Icons.star, Colors.amber),
  'property_approved': (Icons.check_circle, Colors.green),
  'property_rejected': (Icons.cancel, Colors.red),
  'new_follower': (Icons.person_add, Colors.blue),
  'post_liked': (Icons.favorite, Colors.red),
  'reel_liked': (Icons.favorite, Colors.red),
  'comment_liked': (Icons.favorite, Colors.red),
  'comment_received': (Icons.comment, Colors.blue),
  'post_shared': (Icons.share, Colors.blue),
  'user_mentioned': (Icons.alternate_email, Colors.blue),
  'identity_verified': (Icons.verified, Colors.green),
  'identity_rejected': (Icons.cancel, Colors.red),
  'verification_pending': (Icons.hourglass_empty, Colors.orange),
};

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<NotificationProvider>(context, listen: false).loadNotifications();
    });
  }

  void _handleTap(AppNotification notification) {
    final provider = Provider.of<NotificationProvider>(context, listen: false);
    if (!notification.isRead) provider.markAsRead(notification.id);

    switch (notification.type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
        Navigator.of(context).pushNamed('/bookings');
        break;
      case 'message_received':
        Navigator.of(context).pushNamed('/messages');
        break;
      case 'post_liked':
      case 'reel_liked':
      case 'comment_liked':
      case 'comment_received':
      case 'post_shared':
      case 'user_mentioned':
        Navigator.of(context).pushNamed('/feed');
        break;
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<NotificationProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        actions: [
          if (provider.notifications.any((n) => !n.isRead))
            TextButton(
              onPressed: () => provider.markAllAsRead(),
              child: const Text('Marcar todo como leído'),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.loadNotifications(),
        child: provider.isLoading && provider.notifications.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : provider.notifications.isEmpty
                ? ListView(
                    children: const [
                      SizedBox(height: 120),
                      Icon(Icons.notifications_none, size: 80, color: Colors.grey),
                      SizedBox(height: 16),
                      Center(
                        child: Text(
                          'No tienes notificaciones',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                      ),
                    ],
                  )
                : ListView.builder(
                    itemCount: provider.notifications.length,
                    itemBuilder: (context, index) {
                      final notification = provider.notifications[index];
                      final iconData = _typeIcons[notification.type] ??
                          (Icons.notifications, AppTheme.mute);

                      return Container(
                        color: notification.isRead ? null : AppTheme.sand,
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: iconData.$2.withValues(alpha: 0.1),
                            child: Icon(iconData.$1, color: iconData.$2),
                          ),
                          title: Text(
                            notification.title,
                            style: TextStyle(
                              fontWeight:
                                  notification.isRead ? FontWeight.normal : FontWeight.bold,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(notification.message),
                              const SizedBox(height: 4),
                              Text(
                                timeago.format(notification.createdAt, locale: 'es'),
                                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                          onTap: () => _handleTap(notification),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
