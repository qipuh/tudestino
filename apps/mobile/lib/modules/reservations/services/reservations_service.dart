import 'package:dio/dio.dart';
import '../../../core/config/api_client.dart';
import '../models/reservation_model.dart';

class ReservationsService {
  final Dio _dio = ApiClient.getDio();
  static const String _baseUrl = '/api/reservations';

  Future<List<ReservationModel>> getMyReservations({
    String? status,
    int limit = 20,
  }) async {
    try {
      final params = <String, dynamic>{
        'limit': limit,
      };
      if (status != null) {
        params['status'] = status;
      }

      final response = await _dio.get(
        _baseUrl,
        queryParameters: params,
      );

      if (response.statusCode == 200) {
        final data = response.data as List;
        return data
            .map((item) => ReservationModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to load reservations');
    } catch (e) {
      rethrow;
    }
  }

  Future<ReservationModel> getReservationById(String id) async {
    try {
      final response = await _dio.get('$_baseUrl/$id');

      if (response.statusCode == 200) {
        return ReservationModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw Exception('Failed to load reservation');
    } catch (e) {
      rethrow;
    }
  }

  Future<ReservationModel> createReservation({
    required String businessId,
    required String reservationDate,
    required int numberOfPeople,
    String? serviceId,
    String? reservationTime,
  }) async {
    try {
      final payload = {
        'businessId': businessId,
        'reservationDate': reservationDate,
        'numberOfPeople': numberOfPeople,
        if (serviceId != null) 'serviceId': serviceId,
        if (reservationTime != null) 'reservationTime': reservationTime,
      };

      final response = await _dio.post(_baseUrl, data: payload);

      if (response.statusCode == 201) {
        return ReservationModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw Exception('Failed to create reservation');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> cancelReservation(String id) async {
    try {
      final response = await _dio.delete('$_baseUrl/$id');
      if (response.statusCode != 200) {
        throw Exception('Failed to cancel reservation');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<ReservationModel> updateStatus(String id, String status) async {
    try {
      final response = await _dio.patch(
        '$_baseUrl/$id/status',
        data: {'status': status},
      );

      if (response.statusCode == 200) {
        return ReservationModel.fromJson(response.data as Map<String, dynamic>);
      }
      throw Exception('Failed to update reservation status');
    } catch (e) {
      rethrow;
    }
  }
}
