import 'package:flutter/material.dart';
import '../models/booking.dart';
import '../core/services/api_service.dart';

class BookingsProvider with ChangeNotifier {
  final ApiService _apiService;

  List<Booking> _bookings = [];
  Booking? _selectedBooking;
  bool _isLoading = false;
  String? _error;

  BookingsProvider(this._apiService);

  List<Booking> get bookings => _bookings;
  Booking? get selectedBooking => _selectedBooking;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Booking> get upcomingBookings {
    final now = DateTime.now();
    return _bookings
        .where((b) => b.checkIn.isAfter(now) && b.status == 'confirmed')
        .toList()
      ..sort((a, b) => a.checkIn.compareTo(b.checkIn));
  }

  List<Booking> get pastBookings {
    final now = DateTime.now();
    return _bookings
        .where((b) => b.checkOut.isBefore(now) || b.status == 'completed')
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
      _error = 'Error de conexión. Verifica tu internet.';
      _isLoading = false;
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
      _error = 'Error de conexión. Verifica tu internet.';
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
