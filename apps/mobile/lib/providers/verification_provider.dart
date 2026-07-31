import 'package:dio/dio.dart' as dio;
import 'package:flutter/material.dart';
import '../core/services/api_service.dart';

class VerificationProvider with ChangeNotifier {
  final ApiService _apiService;

  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _error;
  String? _status;
  bool _isVerified = false;

  VerificationProvider(this._apiService);

  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get error => _error;
  String? get status => _status;
  bool get isVerified => _isVerified;

  Future<void> loadStatus() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/verification/identity/status');
      if (response.data['success']) {
        final data = response.data['data'];
        _status = data['status'] as String?;
        _isVerified = data['isVerified'] == true;
      }
    } catch (e) {
      _error = 'No se pudo consultar el estado de verificación';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> submitIdentity({
    required String documentType,
    required String documentNumber,
    required String documentFrontPath,
    required String selfiePath,
  }) async {
    _isSubmitting = true;
    _error = null;
    notifyListeners();

    try {
      final formData = dio.FormData.fromMap({
        'documentType': documentType,
        'documentNumber': documentNumber,
        'documentFront': await dio.MultipartFile.fromFile(documentFrontPath),
        'selfie': await dio.MultipartFile.fromFile(selfiePath),
      });

      final response = await _apiService.post('/verification/identity/submit', data: formData);

      if (response.data['success'] == true || response.statusCode == 200) {
        _status = 'pending';
        _isSubmitting = false;
        notifyListeners();
        return true;
      }

      _error = response.data['message'] ?? 'No se pudo enviar la verificación';
      _isSubmitting = false;
      notifyListeners();
      return false;
    } catch (e) {
      if (e is dio.DioException && e.response?.data is Map) {
        _error = (e.response!.data['message'] ?? 'Error al enviar la verificación').toString();
      } else {
        _error = 'Error de conexión. Verifica tu internet.';
      }
      _isSubmitting = false;
      notifyListeners();
      return false;
    }
  }
}
