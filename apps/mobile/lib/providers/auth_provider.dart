import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../core/services/api_service.dart';
import '../core/services/push_notification_service.dart';
import '../core/utils/storage_helper.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService;

  User? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;

  AuthProvider(this._apiService);

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null && _token != null;

  Future<void> initialize() async {
    await StorageHelper.init();
    _token = await StorageHelper.read('auth_token');
    _apiService.setAuthToken(_token);
    if (_token != null) {
      await loadUser();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.data['success']) {
        _token = response.data['data']['token'];
        _user = User.fromJson(response.data['data']['user']);
        await StorageHelper.write('auth_token', _token!);
        _apiService.setAuthToken(_token);
        _isLoading = false;
        notifyListeners();
        PushNotificationService.registerToken(_apiService);
        return true;
      } else {
        _error = response.data['message'] ?? 'Error al iniciar sesión';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Error de conexión. Verifica tu internet.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post(
        '/auth/register',
        data: {
          'name': name,
          'email': email,
          'password': password,
          'role': role,
        },
      );

      if (response.data['success']) {
        _token = response.data['data']['token'];
        _user = User.fromJson(response.data['data']['user']);
        await StorageHelper.write('auth_token', _token!);
        _apiService.setAuthToken(_token);
        _isLoading = false;
        notifyListeners();
        PushNotificationService.registerToken(_apiService);
        return true;
      } else {
        _error = response.data['message'] ?? 'Error al registrarse';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Error de conexión. Verifica tu internet.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadUser() async {
    try {
      final response = await _apiService.get('/users/me');
      if (response.data['success']) {
        _user = User.fromJson(response.data['data']);
        notifyListeners();
        PushNotificationService.registerToken(_apiService);
      }
    } catch (e) {
      // Token inválido o error
      await logout();
    }
  }

  Future<bool> updateProfile({
    String? name,
    String? phone,
    String? email,
    String? username,
    String? bio,
  }) async {
    _error = null;
    notifyListeners();

    try {
      final data = <String, dynamic>{};
      if (name != null) data['name'] = name;
      if (phone != null) data['phone'] = phone;
      if (email != null) data['email'] = email;
      if (username != null) data['username'] = username;
      if (bio != null) data['bio'] = bio;

      final response = await _apiService.patch('/users/me', data: data);

      if (response.data['success'] == true) {
        _user = User.fromJson(response.data['data']);
        notifyListeners();
        return true;
      }

      _error = response.data['message'] ?? 'Error al actualizar el perfil';
      notifyListeners();
      return false;
    } catch (e) {
      if (e is DioException && e.response?.data is Map) {
        _error = (e.response!.data['message'] ?? 'Error al actualizar el perfil').toString();
      } else {
        _error = 'Error de conexión. Verifica tu internet.';
      }
      notifyListeners();
      return false;
    }
  }

  Future<bool> uploadAvatar(String filePath) async {
    _error = null;
    notifyListeners();

    try {
      final formData = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(filePath),
      });

      final response = await _apiService.post('/users/upload-avatar', data: formData);

      if (response.data['success'] == true) {
        await loadUser();
        return true;
      }

      _error = response.data['message'] ?? 'Error al subir la foto';
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Error al subir la foto de perfil';
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await PushNotificationService.clearToken(_apiService);
    _user = null;
    _token = null;
    _apiService.setAuthToken(null);
    await StorageHelper.delete('auth_token');
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
