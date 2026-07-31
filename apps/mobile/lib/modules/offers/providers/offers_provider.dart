import 'package:flutter/material.dart';
import '../models/offer_model.dart';
import '../services/offers_service.dart';

class OffersProvider extends ChangeNotifier {
  final OffersService _service = OffersService();

  List<OfferModel> _offers = [];
  OfferModel? _selectedOffer;
  bool _loading = false;
  String? _error;

  List<OfferModel> get offers => _offers;
  OfferModel? get selectedOffer => _selectedOffer;
  bool get loading => _loading;
  String? get error => _error;

  List<OfferModel> get activeOffers => _offers.where((o) => o.isValid).toList();

  Future<void> loadOffersByBusiness(String businessId) async {
    try {
      _loading = true;
      _error = null;
      notifyListeners();

      _offers = await _service.getOffersByBusiness(businessId);
      _loading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> validateCode(String code) async {
    try {
      _loading = true;
      _error = null;
      notifyListeners();

      _selectedOffer = await _service.validateCode(code);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _selectedOffer = null;
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  void clearSelectedOffer() {
    _selectedOffer = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
