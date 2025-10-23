class Room {
  final String id;
  final String propertyId;
  final String roomType;
  final String name;
  final int? quantity;
  final int guestCapacity;
  final List<Bed> beds;
  final double pricePerNight;
  final List<String> amenities;
  final List<String> images;
  final bool isAvailable;

  Room({
    required this.id,
    required this.propertyId,
    required this.roomType,
    required this.name,
    this.quantity,
    required this.guestCapacity,
    required this.beds,
    required this.pricePerNight,
    required this.amenities,
    required this.images,
    required this.isAvailable,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'] ?? '',
      propertyId: json['propertyId'] ?? '',
      roomType: json['roomType'] ?? '',
      name: json['name'] ?? '',
      quantity: json['quantity'],
      guestCapacity: json['guestCapacity'] ?? 1,
      beds: (json['beds'] as List?)?.map((bed) => Bed.fromJson(bed)).toList() ?? [],
      pricePerNight: (json['pricePerNight'] ?? 0).toDouble(),
      amenities: (json['amenities'] as List?)?.map((e) => e.toString()).toList() ?? [],
      images: (json['images'] as List?)?.map((e) => e.toString()).toList() ?? [],
      isAvailable: json['isAvailable'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'propertyId': propertyId,
      'roomType': roomType,
      'name': name,
      'quantity': quantity,
      'guestCapacity': guestCapacity,
      'beds': beds.map((bed) => bed.toJson()).toList(),
      'pricePerNight': pricePerNight,
      'amenities': amenities,
      'images': images,
      'isAvailable': isAvailable,
    };
  }
}

class Bed {
  final String type;
  final int quantity;

  Bed({
    required this.type,
    required this.quantity,
  });

  factory Bed.fromJson(Map<String, dynamic> json) {
    return Bed(
      type: json['type'] ?? '',
      quantity: json['quantity'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'quantity': quantity,
    };
  }
}
