class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? profilePicture;
  final String role; // 'guest', 'host', 'admin'
  final bool emailVerified;
  final bool phoneVerified;
  final double? hostRating;
  final int? hostReviewCount;
  final String? username;
  final String? bio;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.profilePicture,
    required this.role,
    required this.emailVerified,
    required this.phoneVerified,
    this.hostRating,
    this.hostReviewCount,
    this.username,
    this.bio,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      profilePicture: json['profilePicture'],
      role: json['role'] ?? 'guest',
      emailVerified: json['emailVerified'] ?? false,
      phoneVerified: json['phoneVerified'] ?? false,
      hostRating: json['hostRating'] != null
          ? double.tryParse(json['hostRating'].toString())
          : null,
      hostReviewCount: json['hostReviewCount'],
      username: json['username'],
      bio: json['bio'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'profilePicture': profilePicture,
      'role': role,
      'emailVerified': emailVerified,
      'phoneVerified': phoneVerified,
      'hostRating': hostRating,
      'hostReviewCount': hostReviewCount,
      'username': username,
      'bio': bio,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
