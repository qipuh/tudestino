class Attraction {
  final String id;
  final String title;
  final String description;
  final String? coverImage;
  final String? videoUrl;
  final String category;
  final double? latitude;
  final double? longitude;
  final String? address;
  final String? city;
  final String? region;
  final String? country;
  final bool hasDistanceMarkers;
  final String? whatToDo;
  final String? recommendations;
  final bool isPublished;
  final int views;
  final List<String> galleryImages;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Attraction({
    required this.id,
    required this.title,
    required this.description,
    this.coverImage,
    this.videoUrl,
    required this.category,
    this.latitude,
    this.longitude,
    this.address,
    this.city,
    this.region,
    this.country,
    this.hasDistanceMarkers = false,
    this.whatToDo,
    this.recommendations,
    this.isPublished = true,
    this.views = 0,
    this.galleryImages = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory Attraction.fromJson(Map<String, dynamic> json) {
    return Attraction(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      coverImage: json['coverImage'],
      videoUrl: json['videoUrl'],
      category: json['category'] ?? 'naturaleza',
      latitude: json['latitude'] != null
          ? double.tryParse(json['latitude'].toString())
          : null,
      longitude: json['longitude'] != null
          ? double.tryParse(json['longitude'].toString())
          : null,
      address: json['address'],
      city: json['city'],
      region: json['region'],
      country: json['country'],
      hasDistanceMarkers: json['hasDistanceMarkers'] ?? false,
      whatToDo: json['whatToDo'],
      recommendations: json['recommendations'],
      isPublished: json['isPublished'] ?? true,
      views: json['views'] ?? 0,
      galleryImages: json['images'] is List
          ? (json['images'] as List)
              .map((e) => e is Map ? e['url']?.toString() ?? '' : e.toString())
              .where((s) => s.isNotEmpty)
              .toList()
          : [],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'coverImage': coverImage,
      'videoUrl': videoUrl,
      'category': category,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'city': city,
      'region': region,
      'country': country,
      'hasDistanceMarkers': hasDistanceMarkers,
      'whatToDo': whatToDo,
      'recommendations': recommendations,
      'isPublished': isPublished,
      'views': views,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  String get categoryEmoji {
    switch (category) {
      case 'naturaleza':
        return '🌿';
      case 'cultura':
        return '🏛️';
      case 'aventura':
        return '⛰️';
      case 'gastronomia':
        return '🍴';
      case 'urbano':
        return '🏙️';
      default:
        return '📍';
    }
  }

  String get categoryLabel {
    switch (category) {
      case 'naturaleza':
        return 'Naturaleza';
      case 'cultura':
        return 'Cultura';
      case 'aventura':
        return 'Aventura';
      case 'gastronomia':
        return 'Gastronomía';
      case 'urbano':
        return 'Urbano';
      default:
        return 'Otro';
    }
  }
}
