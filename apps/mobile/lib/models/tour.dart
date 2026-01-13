class Tour {
  final String id;
  final String name;
  final String description;
  final String? coverImage;
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
  final String? itinerary;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final Business? business;

  Tour({
    required this.id,
    required this.name,
    required this.description,
    this.coverImage,
    required this.category,
    required this.durationDays,
    required this.durationNights,
    required this.mainDestination,
    this.destinations = const [],
    required this.basePricePerPerson,
    this.priceCurrency = 'USD',
    required this.maxGroupSize,
    required this.difficultyLevel,
    this.included = const [],
    this.notIncluded = const [],
    this.itinerary,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
    this.business,
  });

  factory Tour.fromJson(Map<String, dynamic> json) {
    return Tour(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      coverImage: json['coverImage'],
      category: json['category'] ?? 'aventura',
      durationDays: json['durationDays'] ?? 1,
      durationNights: json['durationNights'] ?? 0,
      mainDestination: json['mainDestination'] ?? '',
      destinations: json['destinations'] != null
          ? List<String>.from(json['destinations'])
          : [],
      basePricePerPerson:
          (json['basePricePerPerson'] ?? 0).toDouble(),
      priceCurrency: json['priceCurrency'] ?? 'USD',
      maxGroupSize: json['maxGroupSize'] ?? 10,
      difficultyLevel: json['difficultyLevel'] ?? 'moderado',
      included: json['included'] != null
          ? List<String>.from(json['included'])
          : [],
      notIncluded: json['notIncluded'] != null
          ? List<String>.from(json['notIncluded'])
          : [],
      itinerary: json['itinerary'],
      isActive: json['isActive'] ?? true,
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

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'coverImage': coverImage,
      'category': category,
      'durationDays': durationDays,
      'durationNights': durationNights,
      'mainDestination': mainDestination,
      'destinations': destinations,
      'basePricePerPerson': basePricePerPerson,
      'priceCurrency': priceCurrency,
      'maxGroupSize': maxGroupSize,
      'difficultyLevel': difficultyLevel,
      'included': included,
      'notIncluded': notIncluded,
      'itinerary': itinerary,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  String get formattedPrice => '$priceCurrency ${basePricePerPerson.toStringAsFixed(0)}';

  String get duration => '${durationDays}D/${durationNights}N';
}

class Business {
  final String id;
  final String name;
  final String? logo;

  Business({
    required this.id,
    required this.name,
    this.logo,
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      logo: json['logo'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'logo': logo,
    };
  }
}
