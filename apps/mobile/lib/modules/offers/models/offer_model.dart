class OfferModel {
  final String id;
  final String businessId;
  final String code;
  final String description;
  final String discountType; // percentage, fixed, free
  final double discountValue;
  final int? maxUses;
  final int usedCount;
  final DateTime? validFrom;
  final DateTime? validUntil;
  final bool active;
  final DateTime createdAt;

  OfferModel({
    required this.id,
    required this.businessId,
    required this.code,
    required this.description,
    required this.discountType,
    required this.discountValue,
    this.maxUses,
    this.usedCount = 0,
    this.validFrom,
    this.validUntil,
    this.active = true,
    required this.createdAt,
  });

  bool get isValid {
    if (!active) return false;

    final now = DateTime.now();

    if (validFrom != null && now.isBefore(validFrom!)) return false;
    if (validUntil != null && now.isAfter(validUntil!)) return false;

    if (maxUses != null && usedCount >= maxUses!) return false;

    return true;
  }

  factory OfferModel.fromJson(Map<String, dynamic> json) {
    return OfferModel(
      id: json['id'] as String,
      businessId: json['businessId'] as String,
      code: json['code'] as String,
      description: json['description'] as String,
      discountType: json['discountType'] as String,
      discountValue: (json['discountValue'] as num).toDouble(),
      maxUses: json['maxUses'] as int?,
      usedCount: json['usedCount'] as int? ?? 0,
      validFrom: json['validFrom'] is String
          ? DateTime.parse(json['validFrom'] as String)
          : null,
      validUntil: json['validUntil'] is String
          ? DateTime.parse(json['validUntil'] as String)
          : null,
      active: json['active'] as bool? ?? true,
      createdAt: json['createdAt'] is String
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'businessId': businessId,
        'code': code,
        'description': description,
        'discountType': discountType,
        'discountValue': discountValue,
        'maxUses': maxUses,
        'usedCount': usedCount,
        'validFrom': validFrom?.toIso8601String(),
        'validUntil': validUntil?.toIso8601String(),
        'active': active,
        'createdAt': createdAt.toIso8601String(),
      };
}
