import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../../providers/route_provider.dart';
import '../../models/gps_route.dart';
import '../../core/theme/app_theme.dart';
import '../../core/services/offline_map_service.dart';
import 'widgets/route_options_map.dart';

enum PlanRouteMode { search, fixed }

const _activityOptions = [
  ('trekking', 'Trekking', Icons.hiking),
  ('walking', 'Caminata', Icons.directions_walk),
  ('cycling', 'Ciclismo', Icons.directions_bike),
  ('running', 'Running', Icons.directions_run),
  ('mountaineering', 'Montañismo', Icons.terrain),
  ('climbing', 'Escalada', Icons.landscape),
  ('horseback', 'Cabalgata', Icons.pets),
];

/// Planear una ruta: (a) modo `search` - buscar un destino y ver la ruta
/// recomendada + alternas antes de grabar; (b) modo `fixed` - destino ya
/// definido (el punto de partida de una ruta guardada de otra persona),
/// usado cuando el usuario está lejos y "Hacer esta ruta" necesita
/// primero llevarlo hasta ahí.
class PlanRouteScreen extends StatefulWidget {
  final PlanRouteMode mode;
  final String? activityType; // fixed: viene fijo; search: default inicial
  final GeoPoint? fixedDestination;
  final String? fixedDestinationLabel;
  final List<TrackPoint>? referenceTrackPoints; // fixed: trazado original a seguir

  const PlanRouteScreen({
    super.key,
    required this.mode,
    this.activityType,
    this.fixedDestination,
    this.fixedDestinationLabel,
    this.referenceTrackPoints,
  });

  @override
  State<PlanRouteScreen> createState() => _PlanRouteScreenState();
}

class _PlanRouteScreenState extends State<PlanRouteScreen> {
  late String _activityType;
  final _searchController = TextEditingController();
  Timer? _debounce;

  Position? _origin;
  String? _originError;

  List<Map<String, dynamic>> _searchResults = [];
  bool _searching = false;

  GeoPoint? _destination;
  String? _destinationLabel;

  List<RouteOption> _routeOptions = [];
  int _selectedOptionIndex = 0;
  bool _loadingDirections = false;
  String? _directionsError;

  @override
  void initState() {
    super.initState();
    _activityType = widget.activityType ?? 'trekking';
    _init();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> _init() async {
    try {
      final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.medium);
      if (!mounted) return;
      setState(() => _origin = position);

      if (widget.mode == PlanRouteMode.fixed && widget.fixedDestination != null) {
        setState(() {
          _destination = widget.fixedDestination;
          _destinationLabel = widget.fixedDestinationLabel ?? 'Punto de partida';
        });
        await _fetchDirections(alternatives: false);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _originError = 'No se pudo obtener tu ubicación. Activa el GPS e intenta de nuevo.');
    }
  }

  void _onSearchChanged(String text) {
    _debounce?.cancel();
    if (text.trim().length < 3) {
      setState(() => _searchResults = []);
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 450), () => _search(text.trim()));
  }

  Future<void> _search(String text) async {
    setState(() => _searching = true);

    // focusLat/focusLng son opcionales para el backend (solo ordenan los
    // resultados por cercanía) - la búsqueda debe funcionar igual aunque el
    // GPS todavía no haya entregado la ubicación actual (antes esto
    // bloqueaba la búsqueda entera si _origin era null, dejando el buscador
    // sin mostrar nada sin ningún aviso).
    final provider = context.read<RouteProvider>();
    final results = await provider.searchDestination(
      text,
      focusLat: _origin?.latitude,
      focusLng: _origin?.longitude,
    );

    if (!mounted) return;
    setState(() {
      _searchResults = results;
      _searching = false;
    });
  }

  Future<void> _selectDestination(Map<String, dynamic> result) async {
    setState(() {
      _destination = GeoPoint(lat: (result['lat'] as num).toDouble(), lng: (result['lng'] as num).toDouble());
      _destinationLabel = result['label'] as String?;
      _searchResults = [];
      _searchController.text = result['label'] as String? ?? '';
    });
    FocusScope.of(context).unfocus();
    await _fetchDirections(alternatives: true);
  }

  Future<void> _fetchDirections({required bool alternatives}) async {
    if (_origin == null || _destination == null) return;

    setState(() {
      _loadingDirections = true;
      _directionsError = null;
      _routeOptions = [];
    });

    final provider = context.read<RouteProvider>();
    final options = await provider.getDirections(
      originLat: _origin!.latitude,
      originLng: _origin!.longitude,
      destLat: _destination!.lat,
      destLng: _destination!.lng,
      activityType: _activityType,
      alternatives: alternatives,
    );

    if (!mounted) return;
    setState(() {
      _routeOptions = options;
      _selectedOptionIndex = 0;
      _loadingDirections = false;
      if (options.isEmpty) {
        _directionsError = 'No se pudo calcular una ruta hasta ahí.';
      }
    });
  }

  /// Descarga los tiles del corredor de la opción elegida para poder ver
  /// el mapa sin conexión durante el recorrido. Muestra progreso en un
  /// diálogo mientras dura.
  Future<void> _downloadForOffline() async {
    if (_routeOptions.isEmpty) return;
    final geometry = _routeOptions[_selectedOptionIndex].geometry;
    final line = geometry.map((p) => LatLng(p.lat, p.lng)).toList();

    final progressNotifier = ValueNotifier<({int downloaded, int total})>((downloaded: 0, total: 0));

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Descargando mapa'),
        content: ValueListenableBuilder(
          valueListenable: progressNotifier,
          builder: (_, value, __) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              LinearProgressIndicator(
                value: value.total > 0 ? value.downloaded / value.total : null,
              ),
              const SizedBox(height: 12),
              Text(value.total > 0 ? 'Tiles ${value.downloaded}/${value.total}' : 'Calculando...'),
            ],
          ),
        ),
      ),
    );

    try {
      final download = OfflineMapService.downloadCorridor(routeLine: line);
      await for (final progress in download.downloadProgress) {
        progressNotifier.value = (downloaded: progress.attemptedTilesCount, total: progress.maxTilesCount);
      }

      if (!mounted) return;
      Navigator.of(context, rootNavigator: true).pop(); // cierra el diálogo
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mapa descargado para uso sin conexión')),
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.of(context, rootNavigator: true).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No se pudo descargar el mapa: $e')),
      );
    }
  }

  void _startRecording() {
    List<TrackPoint> reference;
    if (widget.mode == PlanRouteMode.fixed && widget.referenceTrackPoints != null) {
      reference = widget.referenceTrackPoints!;
    } else if (_routeOptions.isNotEmpty) {
      final geometry = _routeOptions[_selectedOptionIndex].geometry;
      reference = geometry
          .asMap()
          .entries
          .map((e) => TrackPoint(lat: e.value.lat, lng: e.value.lng, timestamp: e.key))
          .toList();
    } else {
      reference = [];
    }

    Navigator.of(context).pushReplacementNamed('/record-route', arguments: {
      'activityType': _activityType,
      'referenceTrackPoints': reference,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppTheme.ink,
        title: Text(widget.mode == PlanRouteMode.search ? 'Planear ruta' : 'Cómo llegar al inicio'),
      ),
      body: _originError != null
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(_originError!, textAlign: TextAlign.center),
              ),
            )
          : _origin == null
              ? const Center(child: CircularProgressIndicator())
              : Column(
                  children: [
                    if (widget.mode == PlanRouteMode.search) ...[
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
                                onTap: () {
                                  setState(() => _activityType = value);
                                  if (_destination != null) _fetchDirections(alternatives: true);
                                },
                                child: Container(
                                  width: 72,
                                  margin: const EdgeInsets.only(right: 10),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 44,
                                        height: 44,
                                        decoration: BoxDecoration(
                                          color: selected ? Theme.of(context).primaryColor : Colors.grey.shade100,
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(icon,
                                            color: selected ? Colors.white : Colors.grey.shade700, size: 20),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(label,
                                          textAlign: TextAlign.center,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 11)),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: TextField(
                          controller: _searchController,
                          onChanged: _onSearchChanged,
                          decoration: InputDecoration(
                            hintText: 'Buscar destino...',
                            prefixIcon: const Icon(Icons.search),
                            suffixIcon: _searching
                                ? const Padding(
                                    padding: EdgeInsets.all(12),
                                    child: SizedBox(
                                        width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)))
                                : null,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      if (_searchResults.isNotEmpty)
                        Expanded(
                          child: ListView.builder(
                            itemCount: _searchResults.length,
                            itemBuilder: (context, index) {
                              final result = _searchResults[index];
                              return ListTile(
                                leading: const Icon(Icons.place_outlined),
                                title: Text(result['label'] as String? ?? ''),
                                onTap: () => _selectDestination(result),
                              );
                            },
                          ),
                        ),
                    ],
                    if (_searchResults.isEmpty) ...[
                      if (_loadingDirections)
                        const Expanded(child: Center(child: CircularProgressIndicator()))
                      else if (_directionsError != null)
                        Expanded(
                          child: Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Text(_directionsError!, textAlign: TextAlign.center),
                            ),
                          ),
                        )
                      else if (_routeOptions.isNotEmpty && _destination != null)
                        Expanded(
                          child: RouteOptionsMap(
                            options: _routeOptions,
                            selectedIndex: _selectedOptionIndex,
                            onSelect: (i) => setState(() => _selectedOptionIndex = i),
                            origin: GeoPoint(lat: _origin!.latitude, lng: _origin!.longitude),
                            destination: _destination!,
                            destinationLabel: _destinationLabel ?? 'Destino',
                          ),
                        )
                      else if (widget.mode == PlanRouteMode.search)
                        const Expanded(
                          child: Center(
                            child: Padding(
                              padding: EdgeInsets.all(24),
                              child: Text(
                                'Busca un destino para ver la ruta recomendada.',
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                        ),
                      if (_routeOptions.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                          child: Column(
                            children: [
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton.icon(
                                  onPressed: _downloadForOffline,
                                  icon: const Icon(Icons.download_outlined),
                                  label: const Text('Descargar para uso sin conexión'),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: _startRecording,
                                  icon: const Icon(Icons.play_arrow),
                                  label: Text(widget.mode == PlanRouteMode.fixed
                                      ? 'Ya llegué / Empezar a grabar'
                                      : 'Empezar a grabar'),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ],
                ),
    );
  }
}
