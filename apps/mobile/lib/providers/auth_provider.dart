import 'package:flutter/material.dart';
import '../models/user.dart';
import '../core/services/api_service.dart';
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
        _isLoading = false;
        notifyListeners();
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
        _isLoading = false;
        notifyListeners();
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
      }
    } catch (e) {
      // Token inválido o error
      await logout();
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    await StorageHelper.delete('auth_token');
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
