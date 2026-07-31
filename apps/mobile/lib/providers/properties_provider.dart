import 'package:flutter/material.dart';
import '../models/property.dart';
import '../models/attraction.dart';
import '../models/tour.dart';
import '../models/business_result.dart';
import '../models/business_detail.dart';
import '../core/services/api_service.dart';

class PropertiesProvider with ChangeNotifier {
  final ApiService _apiService;

  List<Property> _properties = [];
  List<Property> _searchResults = [];
  Property? _selectedProperty;
  Tour? _selectedTour;
  Attraction? _selectedAttraction;
  BusinessDetail? _selectedBusiness;
  List<BusinessPhoto> _businessPhotos = [];
  List<MenuItem> _businessMenu = [];
  List<Attraction> _attractions = [];
  List<Attraction> _attractionResults = [];
  List<Tour> _tours = [];
  List<BusinessResult> _businessResults = [];
  bool _isLoading = false;
  String? _error;

  PropertiesProvider(this._apiService);

  List<Property> get properties => _properties;
  List<Property> get searchResults => _searchResults;
  Property? get selectedProperty => _selectedProperty;
  Tour? get selectedTour => _selectedTour;
  Attraction? get selectedAttraction => _selectedAttraction;
  BusinessDetail? get selectedBusiness => _selectedBusiness;
  List<BusinessPhoto> get businessPhotos => _businessPhotos;
  List<MenuItem> get businessMenu => _businessMenu;
  List<Attraction> get attractions => _attractions;
  List<Attraction> get attractionResults => _attractionResults;
  List<Tour> get tours => _tours;
  List<BusinessResult> get businessResults => _businessResults;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Búsqueda de atractivos turísticos por ciudad/texto.
  Future<void> searchAttractions({String? location}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final queryParams = <String, String>{'limit': '30'};
      if (location != null && location.isNotEmpty) {
        queryParams['city'] = location;
      }
      final uri = Uri.parse('/attractions').replace(queryParameters: queryParams);
      final response = await _apiService.get(uri.toString());

      if (response.data['success']) {
        final data = response.data['data']['attractions'] as List? ?? [];
        _attractionResults =
            data.map((json) => Attraction.fromJson(json)).toList();
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al buscar atractivos';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Búsqueda por categoría (restaurant/tours/entertainment/spa) - usa
  /// /search/all, distinto del endpoint /search/properties (solo hoteles).
  Future<void> searchByCategory(String category, {String? location}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final queryParams = <String, String>{'category': category, 'limit': '30'};
      if (location != null && location.isNotEmpty) {
        queryParams['location'] = location;
      }
      final uri = Uri.parse('/search/all').replace(queryParameters: queryParams);
      final response = await _apiService.get(uri.toString());

      if (response.data['success']) {
        final results = response.data['data']['results'] as List? ?? [];
        _businessResults =
            results.map((json) => BusinessResult.fromJson(json)).toList();
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al buscar';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadFeaturedProperties() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Cambiado de /properties/featured a /properties
      final response = await _apiService.get('/properties');

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
      _error = 'Error al buscar propiedades: ${e.toString()}';
      print('Error en searchProperties: $e');
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

  Future<void> loadTourDetail(String tourId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/tours/$tourId');

      if (response.data['success']) {
        _selectedTour = Tour.fromJson(response.data['data']);
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar detalle del tour';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadAttractionDetail(String attractionId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/attractions/$attractionId');

      if (response.data['success']) {
        _selectedAttraction = Attraction.fromJson(response.data['data']);
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar detalle del atractivo';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadBusinessDetail(String businessId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response =
          await _apiService.get('/businesses/$businessId?include=true');

      if (response.data['success']) {
        _selectedBusiness = BusinessDetail.fromJson(response.data['data']);
      } else {
        _error = response.data['message'];
      }

      final photosResponse =
          await _apiService.get('/businesses/$businessId/photos');
      if (photosResponse.data['success']) {
        final data = photosResponse.data['data'] as List? ?? [];
        _businessPhotos =
            data.map((json) => BusinessPhoto.fromJson(json)).toList();
      }

      // El menú solo aplica a restaurantes/entretenimiento - para el resto
      // (hoteles, tours, spa) el endpoint devuelve simplemente una lista vacía.
      final menuResponse =
          await _apiService.get('/businesses/$businessId/menu');
      if (menuResponse.data['success']) {
        final data = menuResponse.data['data'] as List? ?? [];
        _businessMenu = data.map((json) => MenuItem.fromJson(json)).toList();
      }
    } catch (e) {
      _error = 'Error al cargar detalle del negocio';
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

  // Load attractions
  Future<void> loadAttractions({int limit = 6}) async {
    try {
      final response = await _apiService.get('/attractions?limit=$limit');

      if (response.data['success']) {
        final attractionsData = response.data['data']['attractions'] ?? [];
        _attractions = (attractionsData as List)
            .map((json) => Attraction.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error al cargar atractivos: $e');
    }
  }

  // Load tours
  Future<void> loadTours({int limit = 8}) async {
    try {
      final response = await _apiService.get('/tours/search?limit=$limit');

      if (response.data['success']) {
        final toursData = response.data['data']['tours'] ?? [];
        _tours = (toursData as List)
            .map((json) => Tour.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error al cargar tours: $e');
    }
  }
}
