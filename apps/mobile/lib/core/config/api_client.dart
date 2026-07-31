import 'package:dio/dio.dart';
import '../services/api_service.dart';

class ApiClient {
  static Dio getDio() {
    // Retorna el Dio del ApiService singleton
    // Esto permite que los servicios accedan a la instancia compartida
    // con el token y los interceptores ya configurados
    return ApiService().dio;
  }

  // Método alternativo para acceder al ApiService completo si necesitas setAuthToken
  static ApiService getService() {
    return ApiService();
  }
}
