import 'package:flutter/material.dart';
import '../models/reservation_model.dart';
import '../services/reservations_service.dart';

class ReservationsProvider extends ChangeNotifier {
  final ReservationsService _service = ReservationsService();

  List<ReservationModel> _reservations = [];
  bool _loading = false;
  String? _error;
  String _statusFilter = ''; // empty = all, pending, confirmed, completed, cancelled

  List<ReservationModel> get reservations => _reservations;
  bool get loading => _loading;
  String? get error => _error;
  String get statusFilter => _statusFilter;

  List<ReservationModel> get filteredReservations {
    if (_statusFilter.isEmpty) {
      return _reservations;
    }
    return _reservations.where((r) => r.status == _statusFilter).toList();
  }

  Future<void> loadMyReservations({String? status}) async {
    try {
      _loading = true;
      _error = null;
      notifyListeners();

      _reservations = await _service.getMyReservations(status: status);
      _loading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
    }
  }

  Future<ReservationModel?> createReservation({
    required String businessId,
    required String reservationDate,
    required int numberOfPeople,
    String? serviceId,
    String? reservationTime,
  }) async {
    try {
      _loading = true;
      _error = null;
      notifyListeners();

      final reservation = await _service.createReservation(
        businessId: businessId,
        reservationDate: reservationDate,
        numberOfPeople: numberOfPeople,
        serviceId: serviceId,
        reservationTime: reservationTime,
      );

      _reservations.insert(0, reservation);
      _loading = false;
      notifyListeners();
      return reservation;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return null;
    }
  }

  Future<void> cancelReservation(String id) async {
    try {
      await _service.cancelReservation(id);
      _reservations.removeWhere((r) => r.id == id);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  void setStatusFilter(String status) {
    _statusFilter = status;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
