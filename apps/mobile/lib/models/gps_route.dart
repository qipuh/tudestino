import 'user.dart';
import '../core/utils/url_helper.dart';

/// Un punto GPS grabado durante el recorrido.
/// Nombrado `TrackPoint` (no colisiona con nada de Flutter).
class TrackPoint {
  final double lat;
  final double lng;
  final double? elevation;
  final int timestamp; // epoch millis

  TrackPoint({
    required this.lat,
    required this.lng,
    this.elevation,
    required this.timestamp,
  });

  factory TrackPoint.fromJson(Map<String, dynamic> json) {
    return TrackPoint(
      lat: double.tryParse(json['lat'].toString()) ?? 0.0,
      lng: double.tryParse(json['lng'].toString()) ?? 0.0,
      elevation: json['elevation'] != null
          ? double.tryParse(json['elevation'].toString())
          : null,
      timestamp: json['timestamp'] is int
          ? json['timestamp']
          : int.tryParse(json['timestamp'].toString()) ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'lat': lat,
        'lng': lng,
        if (elevation != null) 'elevation': elevation,
        'timestamp': timestamp,
      };
}

class GeoPoint {
  final double lat;
  final double lng;

  GeoPoint({required this.lat, required this.lng});

  factory GeoPoint.fromJson(Map<String, dynamic> json) {
    return GeoPoint(
      lat: double.tryParse(json['lat'].toString()) ?? 0.0,
      lng: double.tryParse(json['lng'].toString()) ?? 0.0,
    );
  }
}

/// Hito (foto y/o comentario) pinchado en un punto del recorrido de una
/// ruta ya guardada. Solo llega en el detalle de la ruta, igual que
/// trackPoints.
class RouteMilestone {
  final String id;
  final String routeId;
  final String userId;
  final String? photoUrl;
  final String? comment;
  final GeoPoint point;
  final DateTime? recordedAt;
  final DateTime createdAt;

  RouteMilestone({
    required this.id,
    required this.routeId,
    required this.userId,
    this.photoUrl,
    this.comment,
    required this.point,
    this.recordedAt,
    required this.createdAt,
  });

  factory RouteMilestone.fromJson(Map<String, dynamic> json) {
    return RouteMilestone(
      id: json['id'] ?? '',
      routeId: json['routeId'] ?? '',
      userId: json['userId'] ?? '',
      photoUrl: json['photoUrl'] != null
          ? UrlHelper.getFullImageUrl(json['photoUrl'])
          : null,
      comment: json['comment'],
      point: GeoPoint.fromJson(json['point']),
      recordedAt: json['recordedAt'] != null ? DateTime.tryParse(json['recordedAt']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

/// Una opción de ruta calculada por el backend (ruteo/directions) - la
/// principal o una alterna. `geometry` es la polyline a dibujar.
class RouteOption {
  final double distanceKm;
  final double durationMinutes;
  final List<GeoPoint> geometry;
  final bool isPrimary;

  RouteOption({
    required this.distanceKm,
    required this.durationMinutes,
    required this.geometry,
    required this.isPrimary,
  });

  factory RouteOption.fromJson(Map<String, dynamic> json) {
    return RouteOption(
      distanceKm: double.tryParse(json['distanceKm'].toString()) ?? 0.0,
      durationMinutes: double.tryParse(json['durationMinutes'].toString()) ?? 0.0,
      geometry: (json['geometry'] as List).map((p) => GeoPoint.fromJson(p)).toList(),
      isPrimary: json['isPrimary'] ?? false,
    );
  }
}

/// Ruta GPS grabada por un usuario y compartida con la comunidad
/// (trekking, ciclismo, running, montañismo).
///
/// Nombrada `GpsRoute`, no `Route`: `Route<T>` ya es una clase de Flutter
/// (usada en navigation_service.dart) y colisionaría.
class GpsRoute {
  final String id;
  final String userId;
  final String title;
  final String? description;
  final String activityType; // trekking | cycling | running | mountaineering
  final String? coverImage;
  final List<TrackPoint>? trackPoints; // solo viene completo en el detalle
  final GeoPoint? startPoint;
  final GeoPoint? endPoint;
  final double? distanceKm;
  final int? durationSeconds;
  final double? elevationGainM;
  final double? avgSpeedKmh;
  final String? city;
  final DateTime? startedAt;
  final int likesCount;
  final int commentsCount;
  final bool isLiked;
  final User? user;
  final DateTime createdAt;
  final List<RouteMilestone>? milestones; // solo viene completo en el detalle

  GpsRoute({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    required this.activityType,
    this.coverImage,
    this.trackPoints,
    this.startPoint,
    this.endPoint,
    this.distanceKm,
    this.durationSeconds,
    this.elevationGainM,
    this.avgSpeedKmh,
    this.city,
    this.startedAt,
    required this.likesCount,
    required this.commentsCount,
    required this.isLiked,
    this.user,
    required this.createdAt,
    this.milestones,
  });

  factory GpsRoute.fromJson(Map<String, dynamic> json) {
    return GpsRoute(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      activityType: json['activityType'] ?? 'trekking',
      coverImage: json['coverImage'] != null
          ? UrlHelper.getFullImageUrl(json['coverImage'])
          : null,
      trackPoints: json['trackPoints'] != null
          ? (json['trackPoints'] as List)
              .map((p) => TrackPoint.fromJson(p))
              .toList()
          : null,
      startPoint:
          json['startPoint'] != null ? GeoPoint.fromJson(json['startPoint']) : null,
      endPoint: json['endPoint'] != null ? GeoPoint.fromJson(json['endPoint']) : null,
      distanceKm: json['distanceKm'] != null
          ? double.tryParse(json['distanceKm'].toString())
          : null,
      durationSeconds: json['durationSeconds'],
      elevationGainM: json['elevationGainM'] != null
          ? double.tryParse(json['elevationGainM'].toString())
          : null,
      avgSpeedKmh: json['avgSpeedKmh'] != null
          ? double.tryParse(json['avgSpeedKmh'].toString())
          : null,
      city: json['city'],
      startedAt: json['startedAt'] != null ? DateTime.tryParse(json['startedAt']) : null,
      likesCount: json['likesCount'] ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      isLiked: json['isLiked'] ?? false,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      milestones: json['milestones'] != null
          ? (json['milestones'] as List).map((m) => RouteMilestone.fromJson(m)).toList()
          : null,
    );
  }

  GpsRoute copyWith({int? likesCount, bool? isLiked, int? commentsCount}) {
    return GpsRoute(
      id: id,
      userId: userId,
      title: title,
      description: description,
      activityType: activityType,
      coverImage: coverImage,
      trackPoints: trackPoints,
      startPoint: startPoint,
      endPoint: endPoint,
      distanceKm: distanceKm,
      durationSeconds: durationSeconds,
      elevationGainM: elevationGainM,
      avgSpeedKmh: avgSpeedKmh,
      city: city,
      startedAt: startedAt,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      isLiked: isLiked ?? this.isLiked,
      user: user,
      createdAt: createdAt,
      milestones: milestones,
    );
  }
}
