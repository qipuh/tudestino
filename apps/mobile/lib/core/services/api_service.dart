import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class ApiService {
  // Singleton: varias pantallas hacen `ApiService()` directo en vez de
  // recibirlo por Provider (user_profile_screen.dart, messages_screen.dart).
  // Si cada una creara su propia instancia, el token cacheado en memoria
  // (ver _authToken) nunca les llegaría y todo pedido autenticado daría 401.
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // AuthProvider mantiene el token en memoria y lo sincroniza aquí vía
  // setAuthToken() - evita releer FlutterSecureStorage (Keystore en Android,
  // con latencia real por platform channel) en CADA petición HTTP de la app.
  String? _authToken;

  ApiService._internal() : _dio = Dio(BaseOptions(baseUrl: AppConfig.baseUrl)) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_authToken != null) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            _authToken = null;
            await _storage.delete(key: 'auth_token');
            // Navigate to login
          }
          return handler.next(error);
        },
      ),
    );
  }

  /// Sincroniza el token en memoria - llamar desde AuthProvider en
  /// initialize/login/register/logout para mantenerlo al día.
  void setAuthToken(String? token) {
    _authToken = token;
  }

  Dio get dio => _dio;

  Future<Response> get(String path) async {
    return await _dio.get(path);
  }

  Future<Response> post(String path, {dynamic data}) async {
    return await _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) async {
    return await _dio.put(path, data: data);
  }

  Future<Response> patch(String path, {dynamic data}) async {
    return await _dio.patch(path, data: data);
  }

  Future<Response> delete(String path) async {
    return await _dio.delete(path);
  }
}
