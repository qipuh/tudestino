import 'package:dio/dio.dart';

class LocationsService {
  late final Dio _dio;
  final String baseUrl;

  LocationsService({String? apiUrl})
      : baseUrl = apiUrl ?? 'http://localhost:3000/api' {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ));
  }

  Future<List<Country>> getCountries() async {
    try {
      final response = await _dio.get('/locations/countries');
      final data = response.data as Map<String, dynamic>;
      final countries = (data['data'] as List)
          .map((c) => Country.fromJson(c as Map<String, dynamic>))
          .toList();
      return countries;
    } catch (e) {
      throw Exception('Error fetching countries: $e');
    }
  }

  Future<List<Department>> getDepartments(String countryId) async {
    try {
      final response = await _dio.get('/locations/countries/$countryId/departments');
      final data = response.data as Map<String, dynamic>;
      final departments = (data['data'] as List)
          .map((d) => Department.fromJson(d as Map<String, dynamic>))
          .toList();
      return departments;
    } catch (e) {
      throw Exception('Error fetching departments: $e');
    }
  }

  Future<List<Province>> getProvinces(String departmentId) async {
    try {
      final response = await _dio.get('/locations/departments/$departmentId/provinces');
      final data = response.data as Map<String, dynamic>;
      final provinces = (data['data'] as List)
          .map((p) => Province.fromJson(p as Map<String, dynamic>))
          .toList();
      return provinces;
    } catch (e) {
      throw Exception('Error fetching provinces: $e');
    }
  }

  Future<List<District>> getDistricts(String provinceId) async {
    try {
      final response = await _dio.get('/locations/provinces/$provinceId/districts');
      final data = response.data as Map<String, dynamic>;
      final districts = (data['data'] as List)
          .map((d) => District.fromJson(d as Map<String, dynamic>))
          .toList();
      return districts;
    } catch (e) {
      throw Exception('Error fetching districts: $e');
    }
  }

  Future<List<District>> searchDistricts(String query, {String? countryId}) async {
    try {
      final params = {'q': query};
      if (countryId != null) params['countryId'] = countryId;

      final response = await _dio.get('/locations/search', queryParameters: params);
      final data = response.data as Map<String, dynamic>;
      final districts = (data['data'] as List)
          .map((d) => District.fromJson(d as Map<String, dynamic>))
          .toList();
      return districts;
    } catch (e) {
      throw Exception('Error searching districts: $e');
    }
  }

  Future<District?> getDistrictById(String districtId) async {
    try {
      final response = await _dio.get('/locations/districts/$districtId');
      final data = response.data as Map<String, dynamic>;
      return District.fromJson(data['data'] as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Error fetching district: $e');
    }
  }
}

// Models
class Country {
  final int id;
  final String code;
  final String name;
  final String? nativeName;
  final String phoneCode;
  final String? flagEmoji;
  final String? currencyCode;

  Country({
    required this.id,
    required this.code,
    required this.name,
    this.nativeName,
    required this.phoneCode,
    this.flagEmoji,
    this.currencyCode,
  });

  factory Country.fromJson(Map<String, dynamic> json) {
    return Country(
      id: json['id'] as int,
      code: json['code'] as String,
      name: json['name'] as String,
      nativeName: json['native_name'] as String?,
      phoneCode: json['phone_code'] as String,
      flagEmoji: json['flag_emoji'] as String?,
      currencyCode: json['currency_code'] as String?,
    );
  }
}

// Los campos decimales (latitude/longitude) vienen serializados como
// String desde Sequelize (DECIMAL -> string en JSON), no como number.
double? _parseDecimal(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  return double.tryParse(value as String);
}

class Department {
  final String id;
  final int countryId;
  final String code;
  final String name;
  final String? nativeName;
  final double? latitude;
  final double? longitude;

  Department({
    required this.id,
    required this.countryId,
    required this.code,
    required this.name,
    this.nativeName,
    this.latitude,
    this.longitude,
  });

  factory Department.fromJson(Map<String, dynamic> json) {
    return Department(
      id: json['id'] as String,
      // Backend: Department/Province/District usan atributos camelCase
      // (countryId), a diferencia de Country que usa snake_case
      // (native_name, phone_code) - son modelos Sequelize distintos con
      // convenciones distintas, confirmado contra la API real.
      countryId: json['countryId'] as int,
      code: json['code'] as String,
      name: json['name'] as String,
      nativeName: json['nativeName'] as String?,
      latitude: _parseDecimal(json['latitude']),
      longitude: _parseDecimal(json['longitude']),
    );
  }
}

class Province {
  final String id;
  final String departmentId;
  final String code;
  final String name;
  final String? nativeName;
  final double? latitude;
  final double? longitude;

  Province({
    required this.id,
    required this.departmentId,
    required this.code,
    required this.name,
    this.nativeName,
    this.latitude,
    this.longitude,
  });

  factory Province.fromJson(Map<String, dynamic> json) {
    return Province(
      id: json['id'] as String,
      departmentId: json['departmentId'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      nativeName: json['nativeName'] as String?,
      latitude: _parseDecimal(json['latitude']),
      longitude: _parseDecimal(json['longitude']),
    );
  }
}

class District {
  final String id;
  final String provinceId;
  final String code;
  final String name;
  final String? nativeName;
  final double? latitude;
  final double? longitude;

  District({
    required this.id,
    required this.provinceId,
    required this.code,
    required this.name,
    this.nativeName,
    this.latitude,
    this.longitude,
  });

  factory District.fromJson(Map<String, dynamic> json) {
    return District(
      id: json['id'] as String,
      provinceId: json['provinceId'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      nativeName: json['nativeName'] as String?,
      latitude: _parseDecimal(json['latitude']),
      longitude: _parseDecimal(json['longitude']),
    );
  }
}
