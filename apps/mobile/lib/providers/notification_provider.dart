import 'package:flutter/material.dart';
import '../models/app_notification.dart';
import '../core/services/api_service.dart';

/// Ojo: esta respuesta viene plana (`{success, notifications, pagination}`),
/// no envuelta en `data` como la mayoría de los otros endpoints.
class NotificationProvider with ChangeNotifier {
  final ApiService _apiService;

  List<AppNotification> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  String? _error;

  NotificationProvider(this._apiService);

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadNotifications() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/notifications?limit=50');
      if (response.data['success']) {
        final data = response.data['notifications'] as List? ?? [];
        _notifications =
            data.map((json) => AppNotification.fromJson(json)).toList();
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar notificaciones';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadUnreadCount() async {
    try {
      final response = await _apiService.get('/notifications/unread-count');
      if (response.data['success']) {
        _unreadCount = response.data['count'] ?? 0;
        notifyListeners();
      }
    } catch (_) {
      // silencioso: el badge simplemente no se actualiza
    }
  }

  Future<void> markAsRead(String notificationId) async {
    final index = _notifications.indexWhere((n) => n.id == notificationId);
    if (index == -1 || _notifications[index].isRead) return;

    try {
      await _apiService.put('/notifications/$notificationId/read');
      _notifications[index] = _notifications[index].copyWith(isRead: true);
      if (_unreadCount > 0) _unreadCount--;
      notifyListeners();
    } catch (_) {
      // no revertimos el UI por un fallo silencioso de red
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _apiService.put('/notifications/mark-all-read');
      _notifications = _notifications.map((n) => n.copyWith(isRead: true)).toList();
      _unreadCount = 0;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await _apiService.delete('/notifications/$notificationId');
      _notifications.removeWhere((n) => n.id == notificationId);
      notifyListeners();
    } catch (_) {}
  }
}
