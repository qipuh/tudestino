import 'package:flutter/material.dart';
import '../models/property.dart';
import '../core/services/api_service.dart';

class PropertiesProvider with ChangeNotifier {
  final ApiService _apiService;

  List<Property> _properties = [];
  List<Property> _searchResults = [];
  Property? _selectedProperty;
  bool _isLoading = false;
  String? _error;

  PropertiesProvider(this._apiService);

  List<Property> get properties => _properties;
  List<Property> get searchResults => _searchResults;
  Property? get selectedProperty => _selectedProperty;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadFeaturedProperties() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/properties/featured');

      if (response.data['success']) {
        _properties = (response.data['data'] as List)
            .map((json) => Property.fromJson(json))
            .toList();
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar propiedades';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> searchProperties({
    String? location,
    double? latitude,
    double? longitude,
    DateTime? checkIn,
    DateTime? checkOut,
    int? adults,
    int? children,
    double? minPrice,
    double? maxPrice,
    String? propertyType,
    List<String>? amenities,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final queryParams = <String, dynamic>{};

      if (location != null) queryParams['location'] = location;
      if (latitude != null) queryParams['latitude'] = latitude;
      if (longitude != null) queryParams['longitude'] = longitude;
      if (checkIn != null) queryParams['checkIn'] = checkIn.toIso8601String();
      if (checkOut != null) queryParams['checkOut'] = checkOut.toIso8601String();
      if (adults != null) queryParams['adults'] = adults;
      if (children != null) queryParams['children'] = children;
      if (minPrice != null) queryParams['minPrice'] = minPrice;
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice;
      if (propertyType != null) queryParams['propertyType'] = propertyType;
      if (amenities != null && amenities.isNotEmpty) {
        queryParams['amenities'] = amenities.join(',');
      }

      final uri = Uri.parse('/search/properties').replace(queryParameters:
          queryParams.map((k, v) => MapEntry(k, v.toString())));

      final response = await _apiService.get(uri.toString());

      if (response.data['success']) {
        _searchResults = (response.data['data']['properties'] as List)
            .map((json) => Property.fromJson(json))
            .toList();
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al buscar propiedades';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadPropertyDetail(String propertyId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/properties/$propertyId');

      if (response.data['success']) {
        _selectedProperty = Property.fromJson(response.data['data']);
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar detalle de propiedad';
    }

    _isLoading = false;
    notifyListeners();
  }

  void clearSearch() {
    _searchResults = [];
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
