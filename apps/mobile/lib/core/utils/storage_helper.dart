import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Helper para almacenamiento que funciona en web y móvil
class StorageHelper {
  static final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  static SharedPreferences? _prefs;

  /// Inicializar SharedPreferences para web
  static Future<void> init() async {
    if (kIsWeb) {
      _prefs = await SharedPreferences.getInstance();
    }
  }

  /// Guardar un valor (usa SecureStorage en móvil, SharedPreferences en web)
  static Future<void> write(String key, String value) async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      await _prefs!.setString(key, value);
    } else {
      await _secureStorage.write(key: key, value: value);
    }
  }

  /// Leer un valor
  static Future<String?> read(String key) async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      return _prefs!.getString(key);
    } else {
      return await _secureStorage.read(key: key);
    }
  }

  /// Eliminar un valor
  static Future<void> delete(String key) async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      await _prefs!.remove(key);
    } else {
      await _secureStorage.delete(key: key);
    }
  }

  /// Limpiar todo
  static Future<void> deleteAll() async {
    if (kIsWeb) {
      _prefs ??= await SharedPreferences.getInstance();
      await _prefs!.clear();
    } else {
      await _secureStorage.deleteAll();
    }
  }
}
