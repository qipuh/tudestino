import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock notifications - en producción vendría del backend
    final notifications = [
      {
        'type': 'booking',
        'title': 'Reserva confirmada',
        'message': 'Tu reserva en Hotel Paradise ha sido confirmada',
        'time': DateTime.now().subtract(const Duration(hours: 2)),
        'icon': Icons.check_circle,
        'color': Colors.green,
      },
      {
        'type': 'like',
        'title': 'Nueva interacción',
        'message': 'A María le gustó tu publicación',
        'time': DateTime.now().subtract(const Duration(hours: 5)),
        'icon': Icons.favorite,
        'color': Colors.red,
      },
      {
        'type': 'comment',
        'title': 'Nuevo comentario',
        'message': 'Juan comentó: "¡Qué hermoso lugar!"',
        'time': DateTime.now().subtract(const Duration(days: 1)),
        'icon': Icons.comment,
        'color': Colors.blue,
      },
      {
        'type': 'promotion',
        'title': 'Oferta especial',
        'message': '20% de descuento en reservas de fin de semana',
        'time': DateTime.now().subtract(const Duration(days: 2)),
        'icon': Icons.local_offer,
        'color': Colors.orange,
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        actions: [
          TextButton(
            onPressed: () {
              // TODO: Marcar todas como leídas
            },
            child: const Text('Marcar todo como leído'),
          ),
        ],
      ),
      body: notifications.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_none, size: 80, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'No tienes notificaciones',
                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                ],
              ),
            )
          : ListView.builder(
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notification = notifications[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: (notification['color'] as Color).withOpacity(0.1),
                    child: Icon(
                      notification['icon'] as IconData,
                      color: notification['color'] as Color,
                    ),
                  ),
                  title: Text(
                    notification['title'] as String,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(notification['message'] as String),
                      const SizedBox(height: 4),
                      Text(
                        timeago.format(notification['time'] as DateTime, locale: 'es'),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                  onTap: () {
                    // TODO: Navegar según el tipo de notificación
                  },
                );
              },
            ),
    );
  }
}
