class ReservationModel {
  final String id;
  final String businessId;
  final String userId;
  final String? serviceId;
  final String reservationDate;
  final String? reservationTime;
  final int numberOfPeople;
  final String status; // pending, confirmed, cancelled, completed
  final double? totalPrice;
  final String currency;
  final String paymentStatus;
  final DateTime createdAt;

  ReservationModel({
    required this.id,
    required this.businessId,
    required this.userId,
    this.serviceId,
    required this.reservationDate,
    this.reservationTime,
    required this.numberOfPeople,
    required this.status,
    this.totalPrice,
    required this.currency,
    required this.paymentStatus,
    required this.createdAt,
  });

  factory ReservationModel.fromJson(Map<String, dynamic> json) {
    return ReservationModel(
      id: json['id'] as String,
      businessId: json['businessId'] as String,
      userId: json['userId'] as String,
      serviceId: json['serviceId'] as String?,
      reservationDate: json['reservationDate'] as String,
      reservationTime: json['reservationTime'] as String?,
      numberOfPeople: json['numberOfPeople'] as int,
      status: json['status'] as String? ?? 'pending',
      totalPrice: (json['totalPrice'] as num?)?.toDouble(),
      currency: json['currency'] as String? ?? 'PEN',
      paymentStatus: json['paymentStatus'] as String? ?? 'pending',
      createdAt: json['createdAt'] is String
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'businessId': businessId,
      'userId': userId,
      'serviceId': serviceId,
      'reservationDate': reservationDate,
      'reservationTime': reservationTime,
      'numberOfPeople': numberOfPeople,
      'status': status,
      'totalPrice': totalPrice,
      'currency': currency,
      'paymentStatus': paymentStatus,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
