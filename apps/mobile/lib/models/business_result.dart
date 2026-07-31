import '../core/utils/url_helper.dart';

/// Resultado genérico de /api/search/all (restaurantes, tours, entretenimiento,
/// spa, eventos) - no es una Property, no tiene habitaciones/precio por noche.
class BusinessResult {
  final String id;
  final String type;
  final String name;
  final String? description;
  final String? imageUrl;
  final String? city;
  final String? country;
  final double rating;
  final int reviewCount;
  final String? url;

  BusinessResult({
    required this.id,
    required this.type,
    required this.name,
    this.description,
    this.imageUrl,
    this.city,
    this.country,
    required this.rating,
    required this.reviewCount,
    this.url,
  });

  factory BusinessResult.fromJson(Map<String, dynamic> json) {
    final location = json['location'] as Map<String, dynamic>?;
    final rawImage = json['image']?.toString();

    return BusinessResult(
      id: json['id']?.toString() ?? '',
      type: json['type'] ?? '',
      name: json['name'] ?? json['propertyName'] ?? json['hotelName'] ?? '',
      description: json['description'],
      imageUrl: (rawImage != null && rawImage.isNotEmpty)
          ? UrlHelper.getFullImageUrl(rawImage, folder: 'business')
          : null,
      city: location?['city'],
      country: location?['country'],
      rating: double.tryParse(json['rating']?.toString() ?? '0') ?? 0,
      reviewCount: int.tryParse(json['reviewCount']?.toString() ?? '0') ?? 0,
      url: json['url'],
    );
  }
}
