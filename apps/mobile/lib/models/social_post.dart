import 'user.dart';

class SocialPost {
  final String id;
  final String userId;
  final String caption;
  final List<String> mediaUrls;
  final int likesCount;
  final int commentsCount;
  final bool isLiked;
  final User? user;
  final DateTime createdAt;
  final DateTime updatedAt;

  SocialPost({
    required this.id,
    required this.userId,
    required this.caption,
    required this.mediaUrls,
    required this.likesCount,
    required this.commentsCount,
    required this.isLiked,
    this.user,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SocialPost.fromJson(Map<String, dynamic> json) {
    return SocialPost(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      caption: json['caption'] ?? '',
      mediaUrls: (json['mediaUrls'] as List?)?.map((e) => e.toString()).toList() ?? [],
      likesCount: json['likesCount'] ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      isLiked: json['isLiked'] ?? false,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  SocialPost copyWith({
    int? likesCount,
    bool? isLiked,
    int? commentsCount,
  }) {
    return SocialPost(
      id: id,
      userId: userId,
      caption: caption,
      mediaUrls: mediaUrls,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      isLiked: isLiked ?? this.isLiked,
      user: user,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

class Reel {
  final String id;
  final String userId;
  final String caption;
  final String videoUrl;
  final String? thumbnailUrl;
  final int likesCount;
  final int commentsCount;
  final int viewsCount;
  final bool isLiked;
  final User? user;
  final DateTime createdAt;
  final DateTime updatedAt;

  Reel({
    required this.id,
    required this.userId,
    required this.caption,
    required this.videoUrl,
    this.thumbnailUrl,
    required this.likesCount,
    required this.commentsCount,
    required this.viewsCount,
    required this.isLiked,
    this.user,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Reel.fromJson(Map<String, dynamic> json) {
    return Reel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      caption: json['caption'] ?? '',
      videoUrl: json['videoUrl'] ?? '',
      thumbnailUrl: json['thumbnailUrl'],
      likesCount: json['likesCount'] ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      viewsCount: json['viewsCount'] ?? 0,
      isLiked: json['isLiked'] ?? false,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Reel copyWith({
    int? likesCount,
    bool? isLiked,
    int? commentsCount,
    int? viewsCount,
  }) {
    return Reel(
      id: id,
      userId: userId,
      caption: caption,
      videoUrl: videoUrl,
      thumbnailUrl: thumbnailUrl,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      viewsCount: viewsCount ?? this.viewsCount,
      isLiked: isLiked ?? this.isLiked,
      user: user,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

class Comment {
  final String id;
  final String userId;
  final String contentType;
  final String contentId;
  final String text;
  final User? user;
  final DateTime createdAt;

  Comment({
    required this.id,
    required this.userId,
    required this.contentType,
    required this.contentId,
    required this.text,
    this.user,
    required this.createdAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      contentType: json['contentType'] ?? '',
      contentId: json['contentId'] ?? '',
      text: json['text'] ?? '',
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}
