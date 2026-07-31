import 'package:dio/dio.dart';
import '../../../config/api_client.dart';
import '../models/business_model.dart';

class BusinessesService {
  final Dio _dio = ApiClient.getDio();
  static const String _baseUrl = '/api/businesses';

  Future<BusinessModel> getBusinessById(String id, {bool include = true}) async {
    try {
      final response = await _dio.get(
        '$_baseUrl/$id',
        queryParameters: {'include': include},
      );

      if (response.statusCode == 200) {
        return BusinessModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw Exception('Failed to load business');
    } catch (e) {
      rethrow;
    }
  }

  Future<List<BusinessModel>> getBusinessesByCategory(
    String category, {
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final params = <String, dynamic>{
        'category': category,
        'limit': limit,
        'offset': offset,
      };

      final response = await _dio.get(
        _baseUrl,
        queryParameters: params,
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final List list = data is List ? data : (data['data'] ?? []);
        return list
            .map((item) => BusinessModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to load businesses');
    } catch (e) {
      rethrow;
    }
  }

  Future<List<BusinessModel>> searchBusinesses({
    required String query,
    String? location,
    int limit = 20,
  }) async {
    try {
      final params = <String, dynamic>{
        'search': query,
        'limit': limit,
      };
      if (location != null) {
        params['location'] = location;
      }

      final response = await _dio.get(
        '$_baseUrl/search',
        queryParameters: params,
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final List list = data is List ? data : (data['data'] ?? []);
        return list
            .map((item) => BusinessModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to search businesses');
    } catch (e) {
      rethrow;
    }
  }
}
