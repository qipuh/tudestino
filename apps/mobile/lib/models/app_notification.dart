import 'user.dart';

/// Notificación real del backend (antes la pantalla usaba datos mock).
/// Nombrada `AppNotification` para no chocar con `dart:ui`'s tipos ni con
/// el widget `Notification` de Flutter.
class AppNotification {
  final String id;
  final String type;
  final String title;
  final String message;
  final String? relatedId;
  final User? actor;
  final bool isRead;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.relatedId,
    this.actor,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      relatedId: json['relatedId'],
      actor: json['actor'] != null ? User.fromJson(json['actor']) : null,
      isRead: json['isRead'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  AppNotification copyWith({bool? isRead}) {
    return AppNotification(
      id: id,
      type: type,
      title: title,
      message: message,
      relatedId: relatedId,
      actor: actor,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
    );
  }
}
