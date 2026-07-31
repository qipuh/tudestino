import 'package:dio/dio.dart';
import 'api_service.dart';

/// No existe SDK oficial de Culqi para Flutter - se tokeniza la tarjeta
/// directo contra su API pública (mismo patrón que usa su checkout.js en
/// web), usando la llave PÚBLICA únicamente. La llave secreta nunca sale
/// del backend.
class CulqiService {
  static final Dio _dio = Dio(BaseOptions(baseUrl: 'https://secure.culqi.com/v2'));
  static String? _cachedPublicKey;

  /// Llave pública para el widget embebido de Culqi (checkout.js), usado
  /// para Yape/billetera/agente/bancaMovil que no se pueden tokenizar
  /// directo por REST (requieren su UI propia con OTP).
  static Future<String> getPublicKey(ApiService apiService) => _getPublicKey(apiService);

  static Future<String> _getPublicKey(ApiService apiService) async {
    if (_cachedPublicKey != null) return _cachedPublicKey!;

    final response = await apiService.get('/settings/payment/culqi-public-key');
    final key = response.data['data']?['culqiPublicKey'] as String?;

    if (key == null || key.isEmpty) {
      throw Exception('La pasarela de pago no está configurada');
    }

    _cachedPublicKey = key;
    return key;
  }

  /// Tokeniza los datos de la tarjeta. Retorna el id del token para
  /// enviarlo al backend, que hace el cargo real con la llave secreta.
  static Future<String> createToken(
    ApiService apiService, {
    required String cardNumber,
    required String cvv,
    required String expirationMonth,
    required String expirationYear,
    required String email,
  }) async {
    final publicKey = await _getPublicKey(apiService);

    try {
      final response = await _dio.post(
        '/tokens',
        options: Options(headers: {'Authorization': 'Bearer $publicKey'}),
        data: {
          'card_number': cardNumber.replaceAll(' ', ''),
          'cvv': cvv,
          'expiration_month': expirationMonth,
          'expiration_year': expirationYear,
          'email': email,
        },
      );

      return response.data['id'] as String;
    } on DioException catch (e) {
      final data = e.response?.data;
      final message = data is Map
          ? (data['user_message'] ?? data['merchant_message'] ?? 'Tarjeta rechazada')
          : 'Error al validar la tarjeta';
      throw Exception(message.toString());
    }
  }
}
