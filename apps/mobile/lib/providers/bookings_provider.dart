import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../models/booking.dart';
import '../core/services/api_service.dart';

String _extractErrorMessage(Object e) {
  if (e is DioException) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null) {
      return data['message'].toString();
    }
    if (e.response == null) {
      return 'Error de conexión. Verifica tu internet.';
    }
  }
  return 'Ocurrió un error. Intenta nuevamente.';
}

String? _extractErrorCode(Object e) {
  if (e is DioException) {
    final data = e.response?.data;
    if (data is Map && data['code'] != null) {
      return data['code'].toString();
    }
  }
  return null;
}

class BookingsProvider with ChangeNotifier {
  final ApiService _apiService;

  List<Booking> _bookings = [];
  Booking? _selectedBooking;
  bool _isLoading = false;
  String? _error;
  String? _errorCode;
  String? _lastCreatedBookingId;

  BookingsProvider(this._apiService);

  List<Booking> get bookings => _bookings;
  Booking? get selectedBooking => _selectedBooking;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get errorCode => _errorCode;
  String? get lastCreatedBookingId => _lastCreatedBookingId;

  List<Booking> get upcomingBookings {
    final now = DateTime.now();
    // pending también debe verse - es una reserva recién creada esperando
    // confirmación del anfitrión, no solo las ya 'confirmed'.
    return _bookings
        .where((b) =>
            b.checkIn.isAfter(now) &&
            (b.status == 'confirmed' || b.status == 'pending'))
        .toList()
      ..sort((a, b) => a.checkIn.compareTo(b.checkIn));
  }

  List<Booking> get pastBookings {
    final now = DateTime.now();
    return _bookings
        .where((b) =>
            b.checkOut.isBefore(now) ||
            b.status == 'completed' ||
            b.status == 'cancelled' ||
            b.status == 'rejected')
        .toList()
      ..sort((a, b) => b.checkOut.compareTo(a.checkOut));
  }

  Future<void> loadUserBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/bookings/my-bookings');

      if (response.data['success']) {
        _bookings = (response.data['data'] as List)
            .map((json) => Booking.fromJson(json))
            .toList();
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar reservas: $e';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createBooking({
    required String propertyId,
    required String roomId,
    required DateTime checkIn,
    required DateTime checkOut,
    required int adults,
    required int children,
  }) async {
    _isLoading = true;
    _error = null;
    _errorCode = null;
    notifyListeners();

    try {
      final response = await _apiService.post(
        '/bookings',
        data: {
          'propertyId': propertyId,
          'roomId': roomId,
          'checkIn': checkIn.toIso8601String(),
          'checkOut': checkOut.toIso8601String(),
          'adults': adults,
          'children': children,
        },
      );

      if (response.data['success']) {
        _lastCreatedBookingId = response.data['data']?['id'] as String?;
        await loadUserBookings();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response.data['message'] ?? 'Error al crear reserva';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = _extractErrorMessage(e);
      _errorCode = _extractErrorCode(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> chargeBookingWithCulqi(String bookingId, String token) async {
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post(
        '/payments/culqi/charge-booking',
        data: {'bookingId': bookingId, 'token': token},
      );

      if (response.data['success'] == true) {
        notifyListeners();
        return true;
      }

      _error = response.data['message'] ?? 'No se pudo procesar el pago';
      notifyListeners();
      return false;
    } catch (e) {
      _error = _extractErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  Future<bool> cancelBooking(String bookingId, String reason) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post(
        '/bookings/$bookingId/cancel',
        data: {
          'reason': reason,
        },
      );

      if (response.data['success']) {
        await loadUserBookings();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response.data['message'] ?? 'Error al cancelar reserva';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = _extractErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
