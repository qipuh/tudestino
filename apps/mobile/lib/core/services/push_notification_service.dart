import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

/// Registra el token FCM de este dispositivo en el backend para poder
/// recibir push. Si Firebase no está configurado en este build (o falla
/// el permiso), todo esto queda en silencio - la app sigue funcionando
/// solo sin push, igual que antes.
class PushNotificationService {
  static Future<void> registerToken(ApiService apiService) async {
    try {
      final messaging = FirebaseMessaging.instance;

      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.denied) {
        return;
      }

      final token = await messaging.getToken();
      if (token == null) return;

      await apiService.post('/users/fcm-token', data: {'fcmToken': token});

      // El token puede rotar mientras la app está instalada; reenviar cuando cambie.
      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
        apiService.post('/users/fcm-token', data: {'fcmToken': newToken});
      });
    } catch (e) {
      debugPrint('No se pudo registrar el token de push: $e');
    }
  }

  static Future<void> clearToken(ApiService apiService) async {
    try {
      await apiService.delete('/users/fcm-token');
    } catch (_) {
      // no bloquear el logout por esto
    }
  }
}
