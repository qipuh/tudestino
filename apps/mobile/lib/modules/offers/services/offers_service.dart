import 'package:dio/dio.dart';
import '../../../config/api_client.dart';
import '../models/offer_model.dart';

class OffersService {
  final Dio _dio = ApiClient.getDio();
  static const String _baseUrl = '/api/offers';

  Future<List<OfferModel>> getOffersByBusiness(String businessId) async {
    try {
      final response = await _dio.get(
        _baseUrl,
        queryParameters: {'businessId': businessId},
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final List list = data is List ? data : (data['data'] ?? []);
        return list
            .map((item) => OfferModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to load offers');
    } catch (e) {
      rethrow;
    }
  }

  Future<OfferModel> getOfferById(String id) async {
    try {
      final response = await _dio.get('$_baseUrl/$id');

      if (response.statusCode == 200) {
        return OfferModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw Exception('Failed to load offer');
    } catch (e) {
      rethrow;
    }
  }

  Future<OfferModel> validateCode(String code) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/validate',
        data: {'code': code},
      );

      if (response.statusCode == 200) {
        return OfferModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw Exception('Invalid or expired offer code');
    } catch (e) {
      rethrow;
    }
  }
}
