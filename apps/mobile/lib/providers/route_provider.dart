import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart' as dio;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/gps_route.dart';
import '../models/social_post.dart' show Comment;
import '../core/services/api_service.dart';
import '../core/services/route_tracking_service.dart';

class RouteProvider with ChangeNotifier {
  static const _pendingRoutesKey = 'pending_routes_queue';

  final ApiService _apiService;
  final RouteTrackingService tracking = RouteTrackingService();

  List<GpsRoute> _feedRoutes = [];
  List<GpsRoute> _userRoutes = [];
  bool _isLoading = false;
  bool _isSaving = false;
  bool _wasQueued = false;
  String? _error;
  int _currentPage = 1;
  bool _hasMoreRoutes = true;

  List<Map<String, dynamic>> _pendingRoutes = [];
  bool _syncingPending = false;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  RouteProvider(this._apiService) {
    tracking.addListener(notifyListeners);
    _loadPendingRoutes();
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((results) {
      if (results.any((r) => r != ConnectivityResult.none)) {
        _syncPendingRoutes();
      }
    });
  }

  List<GpsRoute> get feedRoutes => _feedRoutes;
  List<GpsRoute> get userRoutes => _userRoutes;
  bool get isLoading => _isLoading;
  bool get isSaving => _isSaving;
  /// true si el último `saveRoute()` no se pudo subir (sin conexión) y quedó
  /// encolado para reintentarse solo cuando vuelva la señal.
  bool get wasQueued => _wasQueued;
  String? get error => _error;
  bool get hasMoreRoutes => _hasMoreRoutes;
  int get pendingRoutesCount => _pendingRoutes.length;

  Future<void> loadFeed({bool refresh = false, String? activityType}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMoreRoutes = true;
      _feedRoutes = [];
    }

    if (!_hasMoreRoutes || _isLoading) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final query = StringBuffer('/routes/feed?page=$_currentPage&limit=10');
      if (activityType != null) query.write('&activityType=$activityType');

      final response = await _apiService.get(query.toString());

      if (response.data['success']) {
        final List<dynamic> data = response.data['data']['routes'];
        final newRoutes = data.map((json) => GpsRoute.fromJson(json)).toList();

        if (refresh) {
          _feedRoutes = newRoutes;
        } else {
          _feedRoutes.addAll(newRoutes);
        }

        _hasMoreRoutes = response.data['data']['pagination']['hasMore'] ?? false;
        _currentPage++;
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar el feed de rutas';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadUserRoutes(String userId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/routes/users/$userId');

      if (response.data['success']) {
        final List<dynamic> data = response.data['data']['routes'];
        _userRoutes = data.map((json) => GpsRoute.fromJson(json)).toList();
      } else {
        _error = response.data['message'];
      }
    } catch (e) {
      _error = 'Error al cargar tus rutas';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<GpsRoute?> getRouteDetail(String routeId) async {
    try {
      final response = await _apiService.get('/routes/$routeId');
      if (response.data['success']) {
        return GpsRoute.fromJson(response.data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<bool> toggleLikeRoute(String routeId) async {
    try {
      final response = await _apiService.post(
        '/social/like',
        data: {'contentType': 'route', 'contentId': routeId},
      );

      if (response.data['success']) {
        final index = _feedRoutes.indexWhere((r) => r.id == routeId);
        if (index != -1) {
          final route = _feedRoutes[index];
          _feedRoutes[index] = route.copyWith(
            isLiked: !route.isLiked,
            likesCount: route.isLiked ? route.likesCount - 1 : route.likesCount + 1,
          );
          notifyListeners();
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> addComment(String routeId, String text) async {
    try {
      final response = await _apiService.post(
        '/social/comments',
        data: {'contentType': 'route', 'contentId': routeId, 'text': text},
      );
      return response.data['success'] ?? false;
    } catch (e) {
      return false;
    }
  }

  Future<List<Comment>> loadComments(String routeId) async {
    try {
      final response = await _apiService.get('/social/comments/route/$routeId');
      if (response.data['success']) {
        final List<dynamic> data = response.data['data']['comments'];
        return data.map((json) => Comment.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Sube una ruta grabada. Si falla por falta de conexión, se encola
  /// localmente (junto con `milestones`, para que la cola de sincronización
  /// pueda subirlos ella misma más tarde) y se reintenta sola cuando vuelva
  /// la señal - ver `wasQueued`. Si ya hay conexión, el caller (típicamente
  /// save_route_screen.dart) sigue siendo responsable de subir `milestones`
  /// con `addMilestone` después de que esto retorne exitosamente.
  Future<GpsRoute?> saveRoute({
    required String title,
    String? description,
    required String activityType,
    String? city,
    required List<TrackPoint> trackPoints,
    double? distanceKm,
    int? durationSeconds,
    double? elevationGainM,
    double? avgSpeedKmh,
    DateTime? startedAt,
    String? coverImagePath,
    List<RouteMilestoneDraft> milestones = const [],
  }) async {
    _isSaving = true;
    _error = null;
    _wasQueued = false;
    notifyListeners();

    final payload = {
      'title': title,
      'description': description,
      'activityType': activityType,
      'city': city,
      'trackPoints': trackPoints.map((p) => p.toJson()).toList(),
      'distanceKm': distanceKm,
      'durationSeconds': durationSeconds,
      'elevationGainM': elevationGainM,
      'avgSpeedKmh': avgSpeedKmh,
      'startedAt': startedAt?.toIso8601String(),
      'coverImagePath': coverImagePath,
      'milestones': milestones.map((m) => m.toJson()).toList(),
    };

    try {
      final route = await _postRoute(payload);
      await RouteTrackingService.clearCheckpoint();
      _isSaving = false;
      notifyListeners();
      return route;
    } on dio.DioException catch (e) {
      if (!_looksLikeConnectivityError(e)) {
        _error = 'Error al guardar la ruta';
        _isSaving = false;
        notifyListeners();
        return null;
      }

      await _enqueuePendingRoute(payload);
      await RouteTrackingService.clearCheckpoint();
      _wasQueued = true;
      _isSaving = false;
      notifyListeners();
      return null;
    } catch (e) {
      _error = 'Error al guardar la ruta';
      _isSaving = false;
      notifyListeners();
      return null;
    }
  }

  bool _looksLikeConnectivityError(dio.DioException e) {
    return e.type == dio.DioExceptionType.connectionError ||
        e.type == dio.DioExceptionType.connectionTimeout ||
        e.type == dio.DioExceptionType.sendTimeout ||
        e.type == dio.DioExceptionType.receiveTimeout ||
        e.type == dio.DioExceptionType.unknown;
  }

  /// Arma el multipart y sube la ruta. Lanza si falla (así el caller puede
  /// distinguir error de conectividad de un error real del servidor).
  Future<GpsRoute> _postRoute(Map<String, dynamic> payload) async {
    final formMap = <String, dynamic>{
      'title': payload['title'],
      'activityType': payload['activityType'],
      'trackPoints': jsonEncode(payload['trackPoints']),
    };
    if (payload['description'] != null) formMap['description'] = payload['description'];
    if (payload['city'] != null) formMap['city'] = payload['city'];
    if (payload['distanceKm'] != null) formMap['distanceKm'] = payload['distanceKm'].toString();
    if (payload['durationSeconds'] != null) formMap['durationSeconds'] = payload['durationSeconds'].toString();
    if (payload['elevationGainM'] != null) formMap['elevationGainM'] = payload['elevationGainM'].toString();
    if (payload['avgSpeedKmh'] != null) formMap['avgSpeedKmh'] = payload['avgSpeedKmh'].toString();
    if (payload['startedAt'] != null) formMap['startedAt'] = payload['startedAt'];

    final coverImagePath = payload['coverImagePath'] as String?;
    if (coverImagePath != null) {
      formMap['coverImage'] = await dio.MultipartFile.fromFile(coverImagePath);
    }

    final response = await _apiService.post('/routes', data: dio.FormData.fromMap(formMap));
    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Error al guardar la ruta');
    }
    return GpsRoute.fromJson(response.data['data']);
  }

  Future<void> _loadPendingRoutes() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_pendingRoutesKey);
    if (raw == null) return;
    try {
      final decoded = jsonDecode(raw) as List;
      _pendingRoutes = decoded.cast<Map<String, dynamic>>();
      notifyListeners();
    } catch (_) {
      // Cola corrupta - se descarta en vez de bloquear el arranque de la app.
    }
  }

  Future<void> _savePendingRoutesToDisk() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_pendingRoutesKey, jsonEncode(_pendingRoutes));
  }

  Future<void> _enqueuePendingRoute(Map<String, dynamic> payload) async {
    _pendingRoutes.add(payload);
    await _savePendingRoutesToDisk();
    notifyListeners();
  }

  /// Reintenta subir las rutas encoladas (sin conexión en su momento).
  /// Best-effort y secuencial: una que siga fallando se deja en la cola
  /// para el próximo evento de conexión, no bloquea a las demás.
  Future<void> _syncPendingRoutes() async {
    if (_syncingPending || _pendingRoutes.isEmpty) return;
    _syncingPending = true;

    final remaining = <Map<String, dynamic>>[];
    for (final payload in _pendingRoutes) {
      try {
        final route = await _postRoute(payload);
        final milestones = (payload['milestones'] as List)
            .map((m) => RouteMilestoneDraft.fromJson(m as Map<String, dynamic>))
            .toList();
        for (final draft in milestones) {
          await addMilestone(route.id, draft);
        }
      } catch (_) {
        remaining.add(payload);
      }
    }

    _pendingRoutes = remaining;
    await _savePendingRoutesToDisk();
    _syncingPending = false;
    notifyListeners();
  }

  /// Fuerza un intento de sincronización manual (ej. botón "reintentar" en
  /// el banner del feed), además del disparo automático por conectividad.
  Future<void> syncPendingRoutesNow() => _syncPendingRoutes();

  /// Busca destinos por texto (autocomplete vía ORS, proxied por el backend).
  Future<List<Map<String, dynamic>>> searchDestination(
    String text, {
    double? focusLat,
    double? focusLng,
  }) async {
    try {
      final query = StringBuffer('/routing/geocode?text=${Uri.encodeQueryComponent(text)}');
      if (focusLat != null && focusLng != null) {
        query.write('&focusLat=$focusLat&focusLng=$focusLng');
      }
      final response = await _apiService.get(query.toString());
      if (response.data['success']) {
        return List<Map<String, dynamic>>.from(response.data['data']['results']);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Calcula ruta(s) entre dos puntos. `alternatives` pide hasta 3 opciones
  /// (best-effort - ORS puede devolver solo 1 según la geometría).
  Future<List<RouteOption>> getDirections({
    required double originLat,
    required double originLng,
    required double destLat,
    required double destLng,
    required String activityType,
    bool alternatives = true,
  }) async {
    try {
      final response = await _apiService.get(
        '/routing/directions?originLat=$originLat&originLng=$originLng'
        '&destLat=$destLat&destLng=$destLng&activityType=$activityType'
        '&alternatives=$alternatives',
      );
      if (response.data['success']) {
        final List<dynamic> data = response.data['data']['routes'];
        return data.map((json) => RouteOption.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Sube un hito (foto y/o comentario) de una ruta ya guardada.
  /// Best-effort: una falla no debe bloquear el resto de hitos ni la ruta
  /// ya guardada (ver save_route_screen.dart).
  Future<bool> addMilestone(String routeId, RouteMilestoneDraft draft) async {
    try {
      final formMap = <String, dynamic>{
        'lat': draft.lat.toString(),
        'lng': draft.lng.toString(),
        'recordedAt': draft.recordedAt.toIso8601String(),
      };
      if (draft.comment != null) formMap['comment'] = draft.comment;
      if (draft.photoPath != null) {
        formMap['photo'] = await dio.MultipartFile.fromFile(draft.photoPath!);
      }

      final response = await _apiService.post(
        '/routes/$routeId/milestones',
        data: dio.FormData.fromMap(formMap),
      );
      return response.data['success'] ?? false;
    } catch (e) {
      return false;
    }
  }

  /// Edita metadata de una ruta propia. `coverImagePath` reemplaza la
  /// portada (el backend borra el archivo viejo); si se omite, se conserva.
  Future<GpsRoute?> updateRoute(
    String routeId, {
    String? title,
    String? description,
    String? city,
    String? coverImagePath,
  }) async {
    try {
      final formMap = <String, dynamic>{};
      if (title != null) formMap['title'] = title;
      if (description != null) formMap['description'] = description;
      if (city != null) formMap['city'] = city;
      if (coverImagePath != null) {
        formMap['coverImage'] = await dio.MultipartFile.fromFile(coverImagePath);
      }

      final response = await _apiService.put('/routes/$routeId', data: dio.FormData.fromMap(formMap));
      if (response.data['success']) {
        final route = GpsRoute.fromJson(response.data['data']);
        final feedIndex = _feedRoutes.indexWhere((r) => r.id == routeId);
        if (feedIndex != -1) _feedRoutes[feedIndex] = route;
        final userIndex = _userRoutes.indexWhere((r) => r.id == routeId);
        if (userIndex != -1) _userRoutes[userIndex] = route;
        notifyListeners();
        return route;
      }
      _error = response.data['message'];
      return null;
    } catch (e) {
      _error = 'Error al actualizar la ruta';
      return null;
    }
  }

  /// Edita un hito ya guardado: nuevo comentario, nueva foto (reemplaza), o
  /// `removePhoto: true` para quitar la foto sin poner una nueva.
  Future<bool> updateMilestone(
    String routeId,
    String milestoneId, {
    String? comment,
    String? photoPath,
    bool removePhoto = false,
  }) async {
    try {
      final formMap = <String, dynamic>{};
      if (comment != null) formMap['comment'] = comment;
      if (photoPath != null) {
        formMap['photo'] = await dio.MultipartFile.fromFile(photoPath);
      } else if (removePhoto) {
        formMap['removePhoto'] = 'true';
      }

      final response = await _apiService.put(
        '/routes/$routeId/milestones/$milestoneId',
        data: dio.FormData.fromMap(formMap),
      );
      return response.data['success'] ?? false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteMilestone(String routeId, String milestoneId) async {
    try {
      final response = await _apiService.delete('/routes/$routeId/milestones/$milestoneId');
      return response.data['success'] ?? false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteComment(String commentId) async {
    try {
      final response = await _apiService.delete('/social/comments/$commentId');
      return response.data['success'] ?? false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteRoute(String routeId) async {
    try {
      final response = await _apiService.delete('/routes/$routeId');
      if (response.data['success']) {
        _feedRoutes.removeWhere((r) => r.id == routeId);
        _userRoutes.removeWhere((r) => r.id == routeId);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    tracking.dispose();
    super.dispose();
  }
}
