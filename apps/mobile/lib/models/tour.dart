import '../core/utils/currency_formatter.dart';

class TourItineraryDay {
  final int day;
  final String title;
  final String description;
  final List<String> activities;

  TourItineraryDay({
    required this.day,
    required this.title,
    required this.description,
    this.activities = const [],
  });

  factory TourItineraryDay.fromJson(Map<String, dynamic> json) {
    return TourItineraryDay(
      day: json['day'] is int ? json['day'] : int.tryParse(json['day']?.toString() ?? '') ?? 0,
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      activities: json['activities'] is List
          ? List<String>.from(json['activities'].map((e) => e.toString()))
          : [],
    );
  }
}

const _includesLabels = {
  'accommodation': 'Alojamiento',
  'meals': 'Alimentación',
  'transport': 'Transporte',
  'guides': 'Guía turístico',
  'entrance': 'Entradas',
  'insurance': 'Seguro',
  'equipment': 'Equipo',
};

/// El backend guarda "includes" como un objeto de flags booleanos
/// ({accommodation: true, meals: false, ...}), no como lista - se traduce
/// aquí a etiquetas legibles para no filtrar ese detalle a la UI.
List<String> _parseIncludes(dynamic raw) {
  if (raw is Map) {
    return raw.entries
        .where((e) => e.value == true)
        .map((e) => _includesLabels[e.key] ?? e.key.toString())
        .toList();
  }
  if (raw is List) {
    return raw.map((e) => e.toString()).toList();
  }
  return [];
}

List<String> _parseStringList(dynamic raw) {
  if (raw is List) return raw.map((e) => e.toString()).toList();
  return [];
}

class Tour {
  final String id;
  final String name;
  final String description;
  final String? coverImage;
  final List<String> gallery;
  final String category;
  final int durationDays;
  final int durationNights;
  final String mainDestination;
  final List<String> destinations;
  final double basePricePerPerson;
  final String priceCurrency;
  final int maxGroupSize;
  final String difficultyLevel;
  final List<String> included;
  final List<String> notIncluded;
  final List<TourItineraryDay> itinerary;
  final String? meetingPointAddress;
  final double ratingAverage;
  final int reviewCount;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final Business? business;

  Tour({
    required this.id,
    required this.name,
    required this.description,
    this.coverImage,
    this.gallery = const [],
    required this.category,
    required this.durationDays,
    required this.durationNights,
    required this.mainDestination,
    this.destinations = const [],
    required this.basePricePerPerson,
    this.priceCurrency = 'PEN',
    required this.maxGroupSize,
    required this.difficultyLevel,
    this.included = const [],
    this.notIncluded = const [],
    this.itinerary = const [],
    this.meetingPointAddress,
    this.ratingAverage = 0,
    this.reviewCount = 0,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
    this.business,
  });

  /// Todas las imágenes disponibles (portada + galería), sin duplicados.
  List<String> get allImages {
    final images = <String>[];
    if (coverImage != null && coverImage!.isNotEmpty) images.add(coverImage!);
    for (final img in gallery) {
      if (!images.contains(img)) images.add(img);
    }
    return images;
  }

  factory Tour.fromJson(Map<String, dynamic> json) {
    final duration = json['duration'];
    final durationDays = duration is Map
        ? (duration['days'] is int ? duration['days'] : int.tryParse(duration['days']?.toString() ?? '') ?? 1)
        : (json['durationDays'] ?? 1);
    final durationNights = duration is Map
        ? (duration['nights'] is int ? duration['nights'] : int.tryParse(duration['nights']?.toString() ?? '') ?? 0)
        : (json['durationNights'] ?? 0);

    final meetingPoint = json['meetingPoint'];
    final meetingPointAddress = meetingPoint is Map ? meetingPoint['address']?.toString() : null;

    return Tour(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: (json['fullDescription'] ?? json['description'] ?? json['shortDescription'] ?? '').toString(),
      coverImage: json['coverImage'],
      gallery: _parseStringList(json['gallery']),
      category: json['category'] ?? 'adventure',
      durationDays: durationDays,
      durationNights: durationNights,
      mainDestination: json['mainDestination'] ?? '',
      destinations: _parseStringList(json['secondaryDestinations'] ?? json['destinations']),
      basePricePerPerson:
          double.tryParse(json['basePricePerPerson']?.toString() ?? '0') ?? 0,
      priceCurrency: json['currency'] ?? json['priceCurrency'] ?? 'PEN',
      maxGroupSize: json['maxGroupSize'] ?? 10,
      difficultyLevel: json['difficultyLevel'] ?? 'low',
      included: _parseIncludes(json['includes'] ?? json['included']),
      notIncluded: _parseStringList(json['notIncludes'] ?? json['notIncluded']),
      itinerary: json['itinerary'] is List
          ? (json['itinerary'] as List)
              .whereType<Map>()
              .map((e) => TourItineraryDay.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : [],
      meetingPointAddress: meetingPointAddress,
      ratingAverage: double.tryParse(json['ratingAverage']?.toString() ?? '0') ?? 0,
      reviewCount: json['reviewCount'] ?? 0,
      isActive: json['status'] != null ? json['status'] == 'active' : (json['isActive'] ?? true),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'])
          : null,
      business: json['Business'] != null
          ? Business.fromJson(json['Business'])
          : null,
    );
  }

  String get formattedPrice => CurrencyFormatter.format(basePricePerPerson);

  String get duration => durationNights > 0 ? '${durationDays}D/${durationNights}N' : '$durationDays día${durationDays == 1 ? '' : 's'}';
}

class Business {
  final String id;
  final String name;
  final String? logo;
  final String? contactPhone;
  final String? contactEmail;

  Business({
    required this.id,
    required this.name,
    this.logo,
    this.contactPhone,
    this.contactEmail,
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      logo: json['logo'],
      contactPhone: json['contactPhone'],
      contactEmail: json['contactEmail'],
    );
  }
}
