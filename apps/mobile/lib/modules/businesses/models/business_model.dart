class BusinessModel {
  final String id;
  final String name;
  final String type; // restaurant, hotel, tour, attraction, entertainment, spa
  final String? description;
  final double? rating;
  final int? reviewCount;
  final String? phoneNumber;
  final String? email;
  final String? website;
  final String? coverImage;
  final List<String> images;
  final AddressModel? address;
  final List<ServiceModel>? services;
  final List<MenuItemModel>? menu;
  final bool verified;
  final DateTime createdAt;

  BusinessModel({
    required this.id,
    required this.name,
    required this.type,
    this.description,
    this.rating,
    this.reviewCount,
    this.phoneNumber,
    this.email,
    this.website,
    this.coverImage,
    this.images = const [],
    this.address,
    this.services,
    this.menu,
    this.verified = false,
    required this.createdAt,
  });

  factory BusinessModel.fromJson(Map<String, dynamic> json) {
    return BusinessModel(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String? ?? 'restaurant',
      description: json['description'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      reviewCount: json['reviewCount'] as int?,
      phoneNumber: json['phoneNumber'] as String?,
      email: json['email'] as String?,
      website: json['website'] as String?,
      coverImage: json['coverImage'] as String?,
      images: List<String>.from((json['images'] as List?) ?? []),
      address: json['address'] != null
          ? AddressModel.fromJson(json['address'] as Map<String, dynamic>)
          : null,
      services: (json['services'] as List?)
          ?.map((e) => ServiceModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      menu: (json['menu'] as List?)
          ?.map((e) => MenuItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      verified: json['verified'] as bool? ?? false,
      createdAt: json['createdAt'] is String
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'type': type,
        'description': description,
        'rating': rating,
        'reviewCount': reviewCount,
        'phoneNumber': phoneNumber,
        'email': email,
        'website': website,
        'coverImage': coverImage,
        'images': images,
        'address': address?.toJson(),
        'services': services?.map((s) => s.toJson()).toList(),
        'menu': menu?.map((m) => m.toJson()).toList(),
        'verified': verified,
        'createdAt': createdAt.toIso8601String(),
      };
}

class AddressModel {
  final String? street;
  final String? city;
  final String? state;
  final String? country;
  final String? zipCode;
  final double? latitude;
  final double? longitude;

  AddressModel({
    this.street,
    this.city,
    this.state,
    this.country,
    this.zipCode,
    this.latitude,
    this.longitude,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      street: json['street'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      country: json['country'] as String?,
      zipCode: json['zipCode'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'street': street,
        'city': city,
        'state': state,
        'country': country,
        'zipCode': zipCode,
        'latitude': latitude,
        'longitude': longitude,
      };

  String get fullAddress {
    final parts = [street, city, state, country]
        .where((p) => p != null && p.isNotEmpty)
        .cast<String>()
        .toList();
    return parts.join(', ');
  }
}

class ServiceModel {
  final String id;
  final String name;
  final String type;
  final String? description;
  final double? price;
  final String currency;
  final Map<String, dynamic>? settings;

  ServiceModel({
    required this.id,
    required this.name,
    required this.type,
    this.description,
    this.price,
    this.currency = 'PEN',
    this.settings,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num?)?.toDouble(),
      currency: json['currency'] as String? ?? 'PEN',
      settings: json['settings'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'type': type,
        'description': description,
        'price': price,
        'currency': currency,
        'settings': settings,
      };
}

class MenuItemModel {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String currency;
  final String? category;

  MenuItemModel({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.currency = 'PEN',
    this.category,
  });

  factory MenuItemModel.fromJson(Map<String, dynamic> json) {
    return MenuItemModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'PEN',
      category: json['category'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'price': price,
        'currency': currency,
        'category': category,
      };
}
