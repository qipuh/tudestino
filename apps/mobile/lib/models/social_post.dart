import 'user.dart';
import '../core/utils/url_helper.dart';

/// Autor mínimo cuando el post lo publicó un negocio (no un usuario) - el
/// feed polimórfico de businesses devuelve `business` en vez de `user` en
/// ese caso, no ambos.
class PostBusiness {
  final String id;
  final String name;
  final String slug;
  final String? logo;

  PostBusiness({
    required this.id,
    required this.name,
    required this.slug,
    this.logo,
  });

  factory PostBusiness.fromJson(Map<String, dynamic> json) {
    final rawLogo = json['logo']?.toString();
    return PostBusiness(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      logo: (rawLogo != null && rawLogo.isNotEmpty)
          ? UrlHelper.getFullImageUrl(rawLogo)
          : null,
    );
  }
}

class SocialPost {
  final String id;
  final String userId;
  final String caption;
  final List<String> mediaUrls;
  final int likesCount;
  final int commentsCount;
  final bool isLiked;
  final User? user;
  final PostBusiness? business;
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
    this.business,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Nombre a mostrar como autor del post - el negocio si lo publicó un
  /// negocio, si no el usuario, si no el fallback genérico.
  String get authorName => business?.name ?? user?.name ?? 'Usuario';

  factory SocialPost.fromJson(Map<String, dynamic> json) {
    // Parsear el campo 'media' que viene como array de objetos
    List<String> mediaUrls = [];
    if (json['media'] != null && json['media'] is List) {
      mediaUrls = (json['media'] as List).map((media) {
        final url = media['url']?.toString() ?? '';
        return UrlHelper.getFullImageUrl(url);
      }).toList();
    }

    return SocialPost(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      caption: json['caption'] ?? '',
      mediaUrls: mediaUrls,
      likesCount: json['likesCount'] ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      isLiked: json['isLiked'] ?? false,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      business: json['business'] != null
          ? PostBusiness.fromJson(json['business'])
          : null,
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
      business: business,
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
  final String? location;
  final int likesCount;
  final int commentsCount;
  final int viewsCount;
  final int sharesCount;
  final bool isLiked;
  final User? user;
  final PostBusiness? business;
  final DateTime createdAt;
  final DateTime updatedAt;

  /// Nombre a mostrar como autor - el negocio si lo publicó un negocio, si
  /// no el usuario, si no el fallback genérico (ver SocialPost.authorName).
  String get authorName => business?.name ?? user?.name ?? 'Usuario';

  Reel({
    required this.id,
    required this.userId,
    required this.caption,
    required this.videoUrl,
    this.thumbnailUrl,
    this.location,
    required this.likesCount,
    required this.commentsCount,
    required this.viewsCount,
    required this.sharesCount,
    required this.isLiked,
    this.user,
    this.business,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Reel.fromJson(Map<String, dynamic> json) {
    return Reel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      caption: json['caption'] ?? '',
      videoUrl: UrlHelper.getFullImageUrl(json['videoUrl'] ?? ''),
      thumbnailUrl: json['thumbnailUrl'] != null
          ? UrlHelper.getFullImageUrl(json['thumbnailUrl'])
          : null,
      location: json['location'],
      likesCount: json['likesCount'] ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      viewsCount: json['viewsCount'] ?? 0,
      sharesCount: json['sharesCount'] ?? 0,
      isLiked: json['isLiked'] ?? false,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      business: json['business'] != null
          ? PostBusiness.fromJson(json['business'])
          : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Reel copyWith({
    int? likesCount,
    bool? isLiked,
    int? commentsCount,
    int? viewsCount,
    int? sharesCount,
  }) {
    return Reel(
      id: id,
      userId: userId,
      caption: caption,
      videoUrl: videoUrl,
      thumbnailUrl: thumbnailUrl,
      location: location,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      viewsCount: viewsCount ?? this.viewsCount,
      sharesCount: sharesCount ?? this.sharesCount,
      isLiked: isLiked ?? this.isLiked,
      user: user,
      business: business,
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
