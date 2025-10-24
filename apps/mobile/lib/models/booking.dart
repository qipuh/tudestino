import 'property.dart';
import 'room.dart';
import 'user.dart';

class Booking {
  final String id;
  final String userId;
  final String propertyId;
  final String roomId;
  final DateTime checkIn;
  final DateTime checkOut;
  final int adults;
  final int children;
  final double totalPrice;
  final String status; // 'pending', 'confirmed', 'cancelled', 'completed'
  final String? cancellationReason;

  // Relaciones
  final User? user;
  final Property? property;
  final Room? room;

  final DateTime createdAt;
  final DateTime updatedAt;

  Booking({
    required this.id,
    required this.userId,
    required this.propertyId,
    required this.roomId,
    required this.checkIn,
    required this.checkOut,
    required this.adults,
    required this.children,
    required this.totalPrice,
    required this.status,
    this.cancellationReason,
    this.user,
    this.property,
    this.room,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      propertyId: json['propertyId']?.toString() ?? '',
      roomId: json['roomId']?.toString() ?? '',
      checkIn: DateTime.parse(json['checkIn']),
      checkOut: DateTime.parse(json['checkOut']),
      adults: json['adults'] is int ? json['adults'] : int.tryParse(json['adults']?.toString() ?? '1') ?? 1,
      children: json['children'] is int ? json['children'] : int.tryParse(json['children']?.toString() ?? '0') ?? 0,
      totalPrice: json['totalPrice'] is num
          ? (json['totalPrice'] as num).toDouble()
          : double.tryParse(json['totalPrice']?.toString() ?? '0') ?? 0.0,
      status: json['status']?.toString() ?? 'pending',
      cancellationReason: json['cancellationReason']?.toString(),
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      property: json['property'] != null ? Property.fromJson(json['property']) : null,
      room: json['room'] != null ? Room.fromJson(json['room']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  int get nights {
    return checkOut.difference(checkIn).inDays;
  }

  String get statusText {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  }
}
