import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import '../../providers/route_provider.dart';
import '../../core/services/route_tracking_service.dart';
import '../../models/gps_route.dart';
import 'widgets/milestone_capture_sheet.dart';
import '../../core/services/offline_map_service.dart';

const _activityOptions = [
  ('trekking', 'Trekking', Icons.hiking),
  ('walking', 'Caminata', Icons.directions_walk),
  ('cycling', 'Ciclismo', Icons.directions_bike),
  ('running', 'Running', Icons.directions_run),
  ('mountaineering', 'Montañismo', Icons.terrain),
  ('climbing', 'Escalada', Icons.landscape),
  ('horseback', 'Cabalgata', Icons.pets),
];

class RecordRouteScreen extends StatefulWidget {
  /// Si viene de "Hacer esta ruta" de otra persona: fija el tipo de
  /// actividad (igual al de la ruta seguida) y muestra su trazado como
  /// referencia de fondo mientras se graba el propio recorrido.
  final String? activityType;
  final List<TrackPoint>? referenceTrackPoints;

  const RecordRouteScreen({super.key, this.activityType, this.referenceTrackPoints});

  @override
  State<RecordRouteScreen> createState() => _RecordRouteScreenState();
}

class _RecordRouteScreenState extends State<RecordRouteScreen> {
  final MapController _mapController = MapController();
  late String _activityType;
  bool _starting = false;
  LatLng? _currentPosition;
  Position? _lastLivePosition;
  late final RouteTrackingService _tracking;
  StreamSubscription<Position>? _liveLocationSubscription;

  @override
  void initState() {
    super.initState();
    _activityType = widget.activityType ?? 'trekking';
    _tracking = Provider.of<RouteProvider>(context, listen: false).tracking;
    _tracking.addListener(_followTrack);
    _startLiveLocation();
  }

  /// Ubicación en vivo (punto azul en el mapa) - corre siempre, esté o no
  /// grabando, para que el usuario siempre vea dónde está.
  Future<void> _startLiveLocation() async {
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever ||
          permission == LocationPermission.denied) {
        return;
      }

      // Posición inmediata para centrar el mapa apenas se abre la pantalla.
      final initial = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.medium);
      if (!mounted) return;
      final initialLatLng = LatLng(initial.latitude, initial.longitude);
      setState(() => _currentPosition = initialLatLng);
      _mapController.move(initialLatLng, 16);

      // Stream continuo mientras la pantalla esté abierta.
      _liveLocationSubscription = Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 3,
        ),
      ).listen((position) {
        if (!mounted) return;
        // Mismo filtro de ruido GPS que usa la grabación - sin esto el
        // punto azul salta y retrocede unos metros aunque no haya
        // movimiento real.
        if (!RouteTrackingService.isAcceptableMovement(position, _lastLivePosition)) {
          return;
        }
        _lastLivePosition = position;
        setState(() => _currentPosition = LatLng(position.latitude, position.longitude));
      });
    } catch (_) {
      // Sin permiso todavía o GPS no disponible; se reintenta al tocar
      // "Empezar a grabar" (requestPermissions ahí mismo).
    }
  }

  /// Sigue al usuario en el mapa mientras graba - FlutterMap no recentra
  /// solo cuando cambian los puntos, hay que mover la cámara a mano.
  void _followTrack() {
    final points = _tracking.points;
    if (points.isNotEmpty) {
      _mapController.move(
        LatLng(points.last.lat, points.last.lng),
        _mapController.camera.zoom,
      );
    }
  }

  void _recenterOnMe() {
    if (_currentPosition != null) {
      _mapController.move(_currentPosition!, _mapController.camera.zoom);
    }
  }

  @override
  void dispose() {
    _tracking.removeListener(_followTrack);
    _liveLocationSubscription?.cancel();
    // No detenemos la grabación al salir de la pantalla: el usuario puede
    // navegar mientras graba, el servicio en primer plano sigue corriendo.
    super.dispose();
  }

  Future<void> _handleStart(RouteProvider provider) async {
    setState(() => _starting = true);
    try {
      await provider.tracking.start();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
        );
      }
    } finally {
      if (mounted) setState(() => _starting = false);
    }
  }

  Future<void> _handleStop(RouteProvider provider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Terminar ruta'),
        content: const Text('¿Detener la grabación y continuar para guardarla?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Detener')),
        ],
      ),
    );

    if (confirmed != true) return;

    final result = await provider.tracking.stop();
    if (!mounted) return;

    Navigator.of(context).pushReplacementNamed('/save-route', arguments: {
      ...result,
      'activityType': _activityType,
    });
  }

  Future<void> _handleAddMilestone() async {
    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const MilestoneCaptureSheet(),
    );

    if (result == null || _currentPosition == null) return;

    _tracking.addMilestone(
      photoPath: result['photoPath'] as String?,
      comment: result['comment'] as String?,
      lat: _currentPosition!.latitude,
      lng: _currentPosition!.longitude,
    );
  }

  Future<void> _handleDiscard(RouteProvider provider) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Descartar ruta'),
        content: const Text('Se perderá todo el recorrido grabado. ¿Continuar?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Descartar', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await provider.tracking.discard();
      if (mounted) Navigator.of(context).pop();
    }
  }

  String _formatDuration(Duration d) {
    String two(int n) => n.toString().padLeft(2, '0');
    return '${two(d.inHours)}:${two(d.inMinutes % 60)}:${two(d.inSeconds % 60)}';
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<RouteProvider>();
    final tracking = provider.tracking;
    final points = tracking.points;
    final isIdle = tracking.status == TrackingStatus.idle;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Grabar ruta'),
        actions: [
          if (!isIdle)
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => _handleDiscard(provider),
            ),
        ],
      ),
      body: Column(
        children: [
          // Selector de actividad: chips con ícono, 8 tipos. Se puede
          // cambiar mientras no se esté grabando; ya en marcha queda
          // fijo (no tiene sentido cambiar de actividad a mitad de ruta).
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: SizedBox(
              height: 76,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: _activityOptions.map((option) {
                  final (value, label, icon) = option;
                  final selected = _activityType == value;
                  return GestureDetector(
                    onTap: isIdle ? () => setState(() => _activityType = value) : null,
                    child: Container(
                      width: 72,
                      margin: const EdgeInsets.only(right: 10),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: selected
                                  ? Theme.of(context).primaryColor
                                  : Colors.grey.shade100,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(icon,
                                color: selected ? Colors.white : Colors.grey.shade700,
                                size: 22),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            label,
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: points.isNotEmpty
                        ? LatLng(points.last.lat, points.last.lng)
                        : (_currentPosition ?? const LatLng(-13.5320, -71.9675)),
                    initialZoom: 15,
                  ),
                  children: [
                    OfflineMapService.buildTileLayer(),
                    // Trazado original de la ruta que se está "haciendo" -
                    // referencia de fondo, tenue, para guiarse mientras se
                    // graba el propio recorrido.
                    if (widget.referenceTrackPoints != null &&
                        widget.referenceTrackPoints!.length >= 2)
                      PolylineLayer(
                        polylines: [
                          Polyline(
                            points: widget.referenceTrackPoints!
                                .map((p) => LatLng(p.lat, p.lng))
                                .toList(),
                            strokeWidth: 5,
                            color: Colors.orange,
                            pattern: StrokePattern.dashed(segments: const [12, 8]),
                          ),
                        ],
                      ),
                    if (points.length >= 2)
                      PolylineLayer(
                        polylines: [
                          Polyline(
                            points: points.map((p) => LatLng(p.lat, p.lng)).toList(),
                            strokeWidth: 4,
                            color: Theme.of(context).primaryColor,
                          ),
                        ],
                      ),
                    // Hitos ya agregados durante esta grabación - muestra la
                    // foto real como miniatura cuando hay una.
                    if (tracking.milestoneDrafts.isNotEmpty)
                      MarkerLayer(
                        markers: tracking.milestoneDrafts.map((m) {
                          return Marker(
                            point: LatLng(m.lat, m.lng),
                            width: 36,
                            height: 36,
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.orange,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.3),
                                    blurRadius: 4,
                                  ),
                                ],
                              ),
                              child: m.photoPath != null
                                  ? ClipOval(
                                      child: Image.file(
                                        File(m.photoPath!),
                                        fit: BoxFit.cover,
                                        width: 32,
                                        height: 32,
                                      ),
                                    )
                                  : const Icon(Icons.comment, color: Colors.white, size: 16),
                            ),
                          );
                        }).toList(),
                      ),
                    // Punto azul de ubicación en vivo - siempre visible,
                    // grabando o no.
                    if (_currentPosition != null)
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: _currentPosition!,
                            width: 22,
                            height: 22,
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.blue,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 3),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.3),
                                    blurRadius: 4,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
                // Botón flotante para recentrar en mi ubicación actual.
                Positioned(
                  right: 16,
                  bottom: 16,
                  child: FloatingActionButton.small(
                    heroTag: 'recenter',
                    backgroundColor: Colors.white,
                    onPressed: _recenterOnMe,
                    child: const Icon(Icons.my_location, color: Colors.blue),
                  ),
                ),
                // Agregar hito (foto/comentario) - solo mientras se graba o
                // está en pausa, no tiene sentido antes de empezar.
                if (!isIdle)
                  Positioned(
                    left: 16,
                    bottom: 16,
                    child: FloatingActionButton.small(
                      heroTag: 'addMilestone',
                      backgroundColor: Colors.white,
                      onPressed: _handleAddMilestone,
                      child: const Icon(Icons.add_a_photo_outlined, color: Colors.orange),
                    ),
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 8)],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _StatColumn(label: 'Distancia', value: '${tracking.distanceKm.toStringAsFixed(2)} km'),
                    _StatColumn(label: 'Tiempo', value: _formatDuration(tracking.elapsed)),
                    _StatColumn(label: 'Elevación', value: '${tracking.elevationGainM.toStringAsFixed(0)} m'),
                  ],
                ),
                const SizedBox(height: 16),
                _buildControls(provider),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControls(RouteProvider provider) {
    final tracking = provider.tracking;

    if (tracking.status == TrackingStatus.idle) {
      return ElevatedButton.icon(
        onPressed: _starting ? null : () => _handleStart(provider),
        icon: const Icon(Icons.play_arrow),
        label: Text(_starting ? 'Iniciando...' : 'Empezar a grabar'),
        style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 48)),
      );
    }

    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () => tracking.status == TrackingStatus.recording
                ? tracking.pause()
                : tracking.resume(),
            icon: Icon(tracking.status == TrackingStatus.recording ? Icons.pause : Icons.play_arrow),
            label: Text(tracking.status == TrackingStatus.recording ? 'Pausar' : 'Reanudar'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () => _handleStop(provider),
            icon: const Icon(Icons.stop),
            label: const Text('Terminar'),
          ),
        ),
      ],
    );
  }
}

class _StatColumn extends StatelessWidget {
  final String label;
  final String value;

  const _StatColumn({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ],
    );
  }
}
