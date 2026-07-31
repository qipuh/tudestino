import 'package:flutter/material.dart';
import '../models/property.dart';
import '../core/services/api_service.dart';

class FavoritesProvider with ChangeNotifier {
  final ApiService _apiService;

  List<Property> _favorites = [];
  final Set<String> _favoriteIds = {};
  bool _isLoading = false;
  String? _error;

  FavoritesProvider(this._apiService);

  List<Property> get favorites => _favorites;
  bool get isLoading => _isLoading;
  String? get error => _error;

  bool isFavorite(String propertyId) => _favoriteIds.contains(propertyId);

  Future<void> loadFavorites() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/favorites');
      if (response.data['success']) {
        _favorites = (response.data['data'] as List)
            .map((json) => Property.fromJson(json))
            .toList();
        _favoriteIds
          ..clear()
          ..addAll(_favorites.map((p) => p.id));
      }
    } catch (e) {
      _error = 'Error al cargar favoritos';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> checkStatus(String propertyId) async {
    try {
      final response = await _apiService.get('/favorites/$propertyId');
      if (response.data['success']) {
        if (response.data['isFavorite'] == true) {
          _favoriteIds.add(propertyId);
        } else {
          _favoriteIds.remove(propertyId);
        }
        notifyListeners();
      }
    } catch (_) {
      // Silencioso - el corazón simplemente queda sin marcar
    }
  }

  Future<void> toggleFavorite(String propertyId) async {
    final wasFavorite = _favoriteIds.contains(propertyId);

    // Optimista
    if (wasFavorite) {
      _favoriteIds.remove(propertyId);
    } else {
      _favoriteIds.add(propertyId);
    }
    notifyListeners();

    try {
      final response = await _apiService.post('/favorites/$propertyId/toggle');
      final isFavorite = response.data['isFavorite'] == true;
      if (isFavorite) {
        _favoriteIds.add(propertyId);
      } else {
        _favoriteIds.remove(propertyId);
      }
      notifyListeners();
    } catch (e) {
      // Revertir si falló
      if (wasFavorite) {
        _favoriteIds.add(propertyId);
      } else {
        _favoriteIds.remove(propertyId);
      }
      notifyListeners();
    }
  }
}
