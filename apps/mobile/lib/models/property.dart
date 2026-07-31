import 'room.dart';
import 'user.dart';

class Property {
  final String id;
  final String hostId;
  final String accommodationType;
  final bool multipleUnits;
  final String? hotelName;
  final int? hotelCategory; // Cambiado de String? a int?
  final String? propertyName;
  final String description;
  final String cancellationPolicy;

  // Dirección
  final String addressStreet;
  final String addressCity;
  final String? addressState;
  final String addressCountry;
  final String? addressZipCode;
  final double? addressLatitude;
  final double? addressLongitude;

  // Servicios
  final List<String> propertyAmenities;
  final bool breakfastIncluded;
  final String parkingType;
  final Map<String, dynamic>? parkingDetails;

  // Normas
  final String checkInTime;
  final String checkOutTime;
  final bool childrenAllowed;
  final String petsAllowed;
  final double? petFee;
  final String? petFeePer;
  final String? additionalRules;

  // Estado y ratings
  final String status;
  final double ratingAverage;
  final int ratingCount;
  final bool isActive;

  // Relaciones
  final User? host;
  final List<Room> rooms;

  final DateTime createdAt;
  final DateTime updatedAt;

  Property({
    required this.id,
    required this.hostId,
    required this.accommodationType,
    required this.multipleUnits,
    this.hotelName,
    this.hotelCategory,
    this.propertyName,
    required this.description,
    required this.cancellationPolicy,
    required this.addressStreet,
    required this.addressCity,
    this.addressState,
    required this.addressCountry,
    this.addressZipCode,
    this.addressLatitude,
    this.addressLongitude,
    required this.propertyAmenities,
    required this.breakfastIncluded,
    required this.parkingType,
    this.parkingDetails,
    required this.checkInTime,
    required this.checkOutTime,
    required this.childrenAllowed,
    required this.petsAllowed,
    this.petFee,
    this.petFeePer,
    this.additionalRules,
    required this.status,
    required this.ratingAverage,
    required this.ratingCount,
    required this.isActive,
    this.host,
    required this.rooms,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      id: json['id'] ?? '',
      hostId: json['hostId'] ?? '',
      accommodationType: json['accommodationType'] ?? '',
      multipleUnits: json['multipleUnits'] ?? false,
      hotelName: json['hotelName'],
      hotelCategory: json['hotelCategory'],
      propertyName: json['propertyName'],
      description: json['description'] ?? '',
      cancellationPolicy: json['cancellationPolicy'] ?? 'standard',
      addressStreet: json['addressStreet'] ?? '',
      addressCity: json['addressCity'] ?? '',
      addressState: json['addressState'],
      addressCountry: json['addressCountry'] ?? '',
      addressZipCode: json['addressZipCode'],
      addressLatitude: json['addressLatitude'] != null
          ? double.tryParse(json['addressLatitude'].toString())
          : null,
      addressLongitude: json['addressLongitude'] != null
          ? double.tryParse(json['addressLongitude'].toString())
          : null,
      propertyAmenities: Room.parseAmenities(json['propertyAmenities']),
      breakfastIncluded: json['breakfastIncluded'] ?? false,
      parkingType: json['parkingType'] ?? 'no',
      parkingDetails: json['parkingDetails'],
      checkInTime: json['checkInTime'] ?? '14:00',
      checkOutTime: json['checkOutTime'] ?? '12:00',
      childrenAllowed: json['childrenAllowed'] ?? true,
      petsAllowed: json['petsAllowed'] ?? 'no',
      petFee: json['petFee'] != null ? double.tryParse(json['petFee'].toString()) : null,
      petFeePer: json['petFeePer'],
      additionalRules: json['additionalRules'],
      status: json['status'] ?? 'draft',
      ratingAverage: double.tryParse(json['ratingAverage']?.toString() ?? '0') ?? 0.0,
      ratingCount: json['ratingCount'] ?? 0,
      isActive: json['isActive'] ?? true,
      host: json['host'] != null ? User.fromJson(json['host']) : null,
      rooms: (json['rooms'] as List?)?.map((room) => Room.fromJson(room)).toList() ?? [],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  String get displayName {
    if (propertyName != null && propertyName!.isNotEmpty) {
      return propertyName!;
    }
    if (hotelName != null && hotelName!.isNotEmpty) {
      return hotelName!;
    }
    return '$accommodationType en $addressCity';
  }

  double get minPrice {
    if (rooms.isEmpty) return 0;
    return rooms.map((r) => r.pricePerNight).reduce((a, b) => a < b ? a : b);
  }

  String get fullAddress {
    final parts = [addressStreet, addressCity, addressState, addressCountry]
        .where((p) => p != null && p.isNotEmpty)
        .toList();
    return parts.join(', ');
  }
}
