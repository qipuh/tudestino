import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/gps_route.dart';

enum TrackingStatus { idle, recording, paused }

/// Hito capturado durante la grabación (foto y/o comentario pinchado en el
/// punto donde estaba el usuario en ese momento). Se sube al backend recién
/// después de guardar la ruta (ver save_route_screen.dart).
class RouteMilestoneDraft {
  final String? photoPath;
  final String? comment;
  final double lat;
  final double lng;
  final DateTime recordedAt;

  RouteMilestoneDraft({
    this.photoPath,
    this.comment,
    required this.lat,
    required this.lng,
    required this.recordedAt,
  });

  Map<String, dynamic> toJson() => {
        'photoPath': photoPath,
        'comment': comment,
        'lat': lat,
        'lng': lng,
        'recordedAt': recordedAt.toIso8601String(),
      };

  factory RouteMilestoneDraft.fromJson(Map<String, dynamic> json) => RouteMilestoneDraft(
        photoPath: json['photoPath'] as String?,
        comment: json['comment'] as String?,
        lat: (json['lat'] as num).toDouble(),
        lng: (json['lng'] as num).toDouble(),
        recordedAt: DateTime.parse(json['recordedAt'] as String),
      );
}

/// Motor de grabación de rutas GPS. Usa flutter_foreground_task solo para
/// mantener el proceso vivo (servicio en primer plano + notificación
/// persistente) mientras geolocator entrega posiciones normalmente al
/// isolate principal - no corre nada dentro del isolate de background,
/// así se evita la complejidad frágil de comunicación entre isolates.
class RouteTrackingService extends ChangeNotifier {
  static const _checkpointKey = 'route_tracking_checkpoint';

  TrackingStatus _status = TrackingStatus.idle;
  StreamSubscription<Position>? _positionSubscription;
  Timer? _checkpointTimer;

  final List<TrackPoint> _points = [];
  final List<RouteMilestoneDraft> _milestoneDrafts = [];
  DateTime? _startedAt;
  double _distanceMeters = 0;
  double _elevationGainMeters = 0;
  Position? _lastPosition;
  Duration _pausedDuration = Duration.zero;
  DateTime? _pauseStartedAt;

  TrackingStatus get status => _status;
  List<TrackPoint> get points => List.unmodifiable(_points);
  List<RouteMilestoneDraft> get milestoneDrafts => List.unmodifiable(_milestoneDrafts);
  double get distanceKm => _distanceMeters / 1000;
  double get elevationGainM => _elevationGainMeters;
  DateTime? get startedAt => _startedAt;

  /// Agrega un hito en la posición actual (o la última conocida si el GPS
  /// aún no entregó ningún fix). Llamado desde la hoja de captura en
  /// record_route_screen.dart.
  void addMilestone({String? photoPath, String? comment, required double lat, required double lng}) {
    _milestoneDrafts.add(RouteMilestoneDraft(
      photoPath: photoPath,
      comment: comment,
      lat: lat,
      lng: lng,
      recordedAt: DateTime.now(),
    ));
    // Guardar de inmediato (no esperar los 30s del timer) - una foto/
    // comentario recién agregado no debería perderse si el proceso muere
    // justo después.
    _saveCheckpoint();
    notifyListeners();
  }

  Duration get elapsed {
    if (_startedAt == null) return Duration.zero;
    final end = DateTime.now();
    return end.difference(_startedAt!) - _pausedDuration;
  }

  double get avgSpeedKmh {
    final hours = elapsed.inSeconds / 3600;
    if (hours <= 0) return 0;
    return distanceKm / hours;
  }

  /// Pide los permisos necesarios en orden: ubicación en uso -> ubicación en
  /// background. En Android 11+ el diálogo in-app ya no ofrece "permitir
  /// todo el tiempo": si sigue denegado hay que mandar al usuario a Ajustes.
  Future<bool> requestPermissions() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.deniedForever) {
      return false;
    }
    if (permission != LocationPermission.always) {
      // En Android 11+ esto puede requerir que el usuario vaya a Ajustes
      // y seleccione "Permitir todo el tiempo" manualmente.
      permission = await Geolocator.requestPermission();
    }
    return permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
  }

  Future<void> _initForegroundTask() async {
    FlutterForegroundTask.init(
      androidNotificationOptions: AndroidNotificationOptions(
        channelId: 'route_tracking_channel',
        channelName: 'Grabación de ruta',
        channelDescription: 'Notificación mientras se graba tu ruta en TuDestino',
      ),
      iosNotificationOptions: const IOSNotificationOptions(),
      foregroundTaskOptions: const ForegroundTaskOptions(
        autoRunOnBoot: false,
        allowWakeLock: true,
        allowWifiLock: false,
      ),
    );
  }

  Future<void> start() async {
    if (_status != TrackingStatus.idle) return;

    final granted = await requestPermissions();
    if (!granted) {
      throw Exception('Se necesita permiso de ubicación para grabar la ruta');
    }

    await _initForegroundTask();
    await FlutterForegroundTask.startService(
      notificationTitle: 'Grabando tu ruta',
      notificationText: 'TuDestino está registrando tu recorrido',
    );

    _points.clear();
    _milestoneDrafts.clear();
    _distanceMeters = 0;
    _elevationGainMeters = 0;
    _pausedDuration = Duration.zero;
    _lastPosition = null;
    _startedAt = DateTime.now();
    _status = TrackingStatus.recording;

    _subscribeToPositionStream();
    _checkpointTimer = Timer.periodic(const Duration(seconds: 30), (_) => _saveCheckpoint());

    notifyListeners();
  }

  // GPS a pie libre normalmente da 3-15m de error, peor cerca de edificios o
  // bajo copas de árboles. Sin filtrar, esa deriva se ve como el punto
  // saltando y retrocediendo unos metros aunque la persona esté quieta o
  // caminando en línea recta. Mismo filtro se reusa para el punto azul de
  // ubicación en vivo en record_route_screen.dart.
  static const maxAcceptableAccuracyMeters = 25.0;
  static const maxPlausibleSpeedMetersPerSecond = 35.0; // ~126 km/h, cubre bici cuesta abajo

  /// true si [candidate] representa movimiento real respecto a [previous]
  /// (o si no hay posición previa). Filtra fixes de mala precisión, saltos
  /// imposibles (rebote GPS/multipath) y deriva menor al margen de error.
  static bool isAcceptableMovement(Position candidate, Position? previous) {
    if (candidate.accuracy > maxAcceptableAccuracyMeters) return false;
    if (previous == null) return true;

    final segmentMeters = Geolocator.distanceBetween(
      previous.latitude,
      previous.longitude,
      candidate.latitude,
      candidate.longitude,
    );

    final elapsedSeconds =
        candidate.timestamp.difference(previous.timestamp).inMilliseconds / 1000;
    final impliedSpeed = elapsedSeconds > 0 ? segmentMeters / elapsedSeconds : 0;
    if (impliedSpeed > maxPlausibleSpeedMetersPerSecond) return false;

    final noiseFloor = previous.accuracy + candidate.accuracy;
    if (segmentMeters < noiseFloor && segmentMeters < 5) return false;

    return true;
  }

  void _subscribeToPositionStream() {
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 5, // metros - evita puntos redundantes parado en un sitio
    );

    _positionSubscription =
        Geolocator.getPositionStream(locationSettings: locationSettings).listen((position) {
      if (!isAcceptableMovement(position, _lastPosition)) {
        return;
      }

      if (_lastPosition != null) {
        final segmentMeters = Geolocator.distanceBetween(
          _lastPosition!.latitude,
          _lastPosition!.longitude,
          position.latitude,
          position.longitude,
        );

        _distanceMeters += segmentMeters;

        final elevationDelta = position.altitude - _lastPosition!.altitude;
        if (elevationDelta > 0) {
          _elevationGainMeters += elevationDelta;
        }
      }

      final point = TrackPoint(
        lat: position.latitude,
        lng: position.longitude,
        elevation: position.altitude,
        timestamp: DateTime.now().millisecondsSinceEpoch,
      );

      _lastPosition = position;
      _points.add(point);
      notifyListeners();
    });
  }

  Future<void> pause() async {
    if (_status != TrackingStatus.recording) return;
    _pauseStartedAt = DateTime.now();
    await _positionSubscription?.cancel();
    _status = TrackingStatus.paused;
    notifyListeners();
  }

  Future<void> resume() async {
    if (_status != TrackingStatus.paused) return;
    if (_pauseStartedAt != null) {
      _pausedDuration += DateTime.now().difference(_pauseStartedAt!);
      _pauseStartedAt = null;
    }
    _lastPosition = null; // evita sumar la distancia del salto durante la pausa
    _subscribeToPositionStream();
    _status = TrackingStatus.recording;
    notifyListeners();
  }

  /// Detiene la grabación y devuelve los datos listos para guardar.
  /// No borra el checkpoint local hasta que el caller confirme que
  /// ya se subió la ruta (ver [clearCheckpoint]).
  Future<Map<String, dynamic>> stop() async {
    await _positionSubscription?.cancel();
    _checkpointTimer?.cancel();
    await FlutterForegroundTask.stopService();

    final result = {
      'trackPoints': _points,
      'milestones': List<RouteMilestoneDraft>.from(_milestoneDrafts),
      'distanceKm': distanceKm,
      'durationSeconds': elapsed.inSeconds,
      'elevationGainM': elevationGainM,
      'avgSpeedKmh': avgSpeedKmh,
      'startedAt': _startedAt,
    };

    _status = TrackingStatus.idle;
    notifyListeners();

    return result;
  }

  /// Cancela la grabación sin guardar nada.
  Future<void> discard() async {
    await _positionSubscription?.cancel();
    _checkpointTimer?.cancel();
    await FlutterForegroundTask.stopService();
    await clearCheckpoint();
    _points.clear();
    _milestoneDrafts.clear();
    _status = TrackingStatus.idle;
    notifyListeners();
  }

  /// Guarda el progreso en disco cada cierto intervalo para no perder toda
  /// la grabación si el proceso muere a mitad de una caminata larga.
  Future<void> _saveCheckpoint() async {
    if (_points.isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    final data = {
      'points': _points.map((p) => p.toJson()).toList(),
      'milestones': _milestoneDrafts.map((m) => m.toJson()).toList(),
      'startedAt': _startedAt?.toIso8601String(),
      'distanceMeters': _distanceMeters,
      'elevationGainMeters': _elevationGainMeters,
    };
    await prefs.setString(_checkpointKey, jsonEncode(data));
  }

  /// Revisa si quedó una grabación sin terminar de una sesión anterior
  /// (el proceso murió a mitad de camino). Devuelve null si no hay nada.
  static Future<Map<String, dynamic>?> recoverCheckpoint() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_checkpointKey);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  static Future<void> clearCheckpoint() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_checkpointKey);
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    _checkpointTimer?.cancel();
    super.dispose();
  }
}
