import '../core/utils/url_helper.dart';

/// Detalle completo de un negocio (restaurante/tour/entretenimiento/spa)
/// - GET /api/businesses/:id?include=true
class BusinessDetail {
  final String id;
  final String name;
  final String? description;
  final String? logoUrl;
  final String? coverImageUrl;
  final String businessType;
  final String? city;
  final String? state;
  final String? country;
  final String? street;
  final String? contactPhone;
  final String? contactEmail;
  final String? website;
  final double ratingAverage;
  final int reviewCount;

  BusinessDetail({
    required this.id,
    required this.name,
    this.description,
    this.logoUrl,
    this.coverImageUrl,
    required this.businessType,
    this.city,
    this.state,
    this.country,
    this.street,
    this.contactPhone,
    this.contactEmail,
    this.website,
    required this.ratingAverage,
    required this.reviewCount,
  });

  factory BusinessDetail.fromJson(Map<String, dynamic> json) {
    final address = json['address'] as Map<String, dynamic>?;
    final logo = json['logo']?.toString();
    final cover = json['coverImage']?.toString();

    return BusinessDetail(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      logoUrl: (logo != null && logo.isNotEmpty)
          ? UrlHelper.getFullImageUrl(logo, folder: 'business')
          : null,
      coverImageUrl: (cover != null && cover.isNotEmpty)
          ? UrlHelper.getFullImageUrl(cover, folder: 'business')
          : null,
      businessType: json['businessType'] ?? '',
      city: address?['city'],
      state: address?['state'],
      country: address?['country'],
      street: address?['street'],
      contactPhone: json['contactPhone'],
      contactEmail: json['contactEmail'],
      website: json['website'],
      ratingAverage: double.tryParse(json['ratingAverage']?.toString() ?? '0') ?? 0,
      reviewCount: int.tryParse(json['reviewCount']?.toString() ?? '0') ?? 0,
    );
  }

  String get locationLabel =>
      [city, country].where((s) => s != null && s.isNotEmpty).join(', ');
}

class BusinessPhoto {
  final String id;
  final String url;
  final String? caption;

  BusinessPhoto({required this.id, required this.url, this.caption});

  factory BusinessPhoto.fromJson(Map<String, dynamic> json) {
    return BusinessPhoto(
      id: json['id']?.toString() ?? '',
      url: UrlHelper.getFullImageUrl(json['url'], folder: 'business'),
      caption: json['caption'],
    );
  }
}

class MenuItem {
  final String id;
  final String name;
  final String? description;
  final String category;
  final double price;
  final String? imageUrl;

  MenuItem({
    required this.id,
    required this.name,
    this.description,
    required this.category,
    required this.price,
    this.imageUrl,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    final image = json['image']?.toString();
    return MenuItem(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      category: json['category'] ?? '',
      price: double.tryParse(json['price']?.toString() ?? '0') ?? 0,
      imageUrl: (image != null && image.isNotEmpty)
          ? UrlHelper.getFullImageUrl(image, folder: 'menu')
          : null,
    );
  }
}
