import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../providers/route_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/gps_route.dart';
import '../../models/social_post.dart' show Comment;
import '../../core/theme/app_theme.dart';
import 'plan_route_screen.dart';
import 'widgets/milestone_capture_sheet.dart';
import '../../core/services/route_tracking_service.dart' show RouteMilestoneDraft;
import '../../core/services/offline_map_service.dart';

const _activityLabels = {
  'trekking': 'Trekking',
  'walking': 'Caminata',
  'cycling': 'Ciclismo',
  'running': 'Running',
  'mountaineering': 'Montañismo',
  'climbing': 'Escalada',
  'kayaking': 'Kayak',
  'horseback': 'Cabalgata',
};

class RouteDetailScreen extends StatefulWidget {
  final String routeId;

  const RouteDetailScreen({super.key, required this.routeId});

  @override
  State<RouteDetailScreen> createState() => _RouteDetailScreenState();
}

class _RouteDetailScreenState extends State<RouteDetailScreen> {
  GpsRoute? _route;
  bool _loading = true;
  bool _pickingMilestoneLocation = false;
  bool _mapExpanded = false;
  List<Comment> _comments = [];
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final provider = Provider.of<RouteProvider>(context, listen: false);
    final route = await provider.getRouteDetail(widget.routeId);
    final comments = await provider.loadComments(widget.routeId);
    if (!mounted) return;
    setState(() {
      _route = route;
      _comments = comments;
      _loading = false;
    });
  }

  Future<void> _submitComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      Navigator.of(context).pushNamed('/login');
      return;
    }

    final provider = Provider.of<RouteProvider>(context, listen: false);
    final ok = await provider.addComment(widget.routeId, text);
    if (ok) {
      _commentController.clear();
      final comments = await provider.loadComments(widget.routeId);
      if (mounted) setState(() => _comments = comments);
    }
  }

  Future<void> _toggleLike() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      Navigator.of(context).pushNamed('/login');
      return;
    }
    final provider = Provider.of<RouteProvider>(context, listen: false);
    final ok = await provider.toggleLikeRoute(widget.routeId);
    if (ok && _route != null) {
      setState(() {
        _route = _route!.copyWith(
          isLiked: !_route!.isLiked,
          likesCount: _route!.isLiked ? _route!.likesCount - 1 : _route!.likesCount + 1,
        );
      });
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  /// Siempre muestra primero el camino desde donde está el usuario hasta el
  /// punto de partida real de la ruta (plan-route en modo fijo, que ya
  /// calcula y dibuja la ruta con ORS) - antes se saltaba este paso si ya
  /// estaba "cerca" según un umbral de distancia, pero eso dejaba al
  /// usuario sin ver el camino incluso cuando lo necesitaba.
  Future<void> _handleDoThisRoute(GpsRoute route) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      Navigator.of(context).pushNamed('/login');
      return;
    }

    if (route.startPoint == null) {
      Navigator.of(context).pushNamed('/record-route', arguments: {
        'activityType': route.activityType,
        'referenceTrackPoints': route.trackPoints,
      });
      return;
    }

    Navigator.of(context).pushNamed('/plan-route', arguments: {
      'mode': PlanRouteMode.fixed,
      'activityType': route.activityType,
      'fixedDestination': route.startPoint,
      'fixedDestinationLabel': 'Inicio de "${route.title}"',
      'referenceTrackPoints': route.trackPoints,
    });
  }

  bool _isOwner(GpsRoute route) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    return authProvider.user?.id != null && authProvider.user!.id == route.userId;
  }

  Future<void> _handleEditRoute(GpsRoute route) async {
    final updated = await Navigator.of(context).pushNamed('/edit-route', arguments: route);
    if (updated is GpsRoute && mounted) {
      setState(() => _route = updated);
    }
  }

  Future<void> _handleDeleteRoute(GpsRoute route) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar ruta'),
        content: const Text('Esta acción no se puede deshacer. ¿Eliminar esta ruta?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Eliminar', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    final provider = Provider.of<RouteProvider>(context, listen: false);
    final ok = await provider.deleteRoute(route.id);
    if (!mounted) return;

    if (ok) {
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.error ?? 'No se pudo eliminar la ruta')),
      );
    }
  }

  Future<void> _refreshRoute() async {
    final provider = Provider.of<RouteProvider>(context, listen: false);
    final route = await provider.getRouteDetail(widget.routeId);
    if (mounted && route != null) setState(() => _route = route);
  }

  /// Activa el modo "toca el mapa para elegir dónde va el hito" - evita
  /// esperar un fix de GPS (lo que antes tardaba varios segundos) ya que el
  /// punto lo elige el usuario directo sobre el trazado.
  void _startPickingMilestoneLocation() {
    setState(() => _pickingMilestoneLocation = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Toca un punto del mapa para colocar el hito ahí')),
    );
  }

  Future<void> _handleMapTapForMilestone(GpsRoute route, LatLng point) async {
    setState(() => _pickingMilestoneLocation = false);

    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => const MilestoneCaptureSheet(),
    );
    if (result == null || !mounted) return;

    final provider = Provider.of<RouteProvider>(context, listen: false);
    final ok = await provider.addMilestone(
      route.id,
      RouteMilestoneDraft(
        photoPath: result['photoPath'] as String?,
        comment: result['comment'] as String?,
        lat: point.latitude,
        lng: point.longitude,
        recordedAt: DateTime.now(),
      ),
    );
    if (ok) await _refreshRoute();
  }

  Future<void> _handleEditMilestone(GpsRoute route, RouteMilestone milestone) async {
    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => MilestoneCaptureSheet(
        milestoneId: milestone.id,
        existingPhotoUrl: milestone.photoUrl,
        existingComment: milestone.comment,
      ),
    );
    if (result == null || !mounted) return;

    final provider = Provider.of<RouteProvider>(context, listen: false);
    final ok = await provider.updateMilestone(
      route.id,
      milestone.id,
      comment: result['comment'] as String?,
      photoPath: result['photoPath'] as String?,
      removePhoto: result['removePhoto'] as bool? ?? false,
    );
    if (ok) await _refreshRoute();
  }

  Future<void> _handleDeleteMilestone(GpsRoute route, RouteMilestone milestone) async {
    final provider = Provider.of<RouteProvider>(context, listen: false);
    final ok = await provider.deleteMilestone(route.id, milestone.id);
    if (ok && mounted) {
      Navigator.of(context).pop(); // cierra el bottom sheet
      await _refreshRoute();
    }
  }

  Future<void> _handleDeleteComment(Comment comment) async {
    final provider = Provider.of<RouteProvider>(context, listen: false);
    final ok = await provider.deleteComment(comment.id);
    if (ok && mounted) {
      setState(() => _comments.removeWhere((c) => c.id == comment.id));
    }
  }

  void _showMilestone(GpsRoute route, RouteMilestone milestone) {
    final isOwner = _isOwner(route);
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (milestone.photoUrl != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: CachedNetworkImage(
                  imageUrl: milestone.photoUrl!,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
            if (milestone.photoUrl != null && milestone.comment != null) const SizedBox(height: 12),
            if (milestone.comment != null) Text(milestone.comment!, style: const TextStyle(fontSize: 15)),
            if (isOwner) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.of(sheetContext).pop();
                        _handleEditMilestone(route, milestone);
                      },
                      icon: const Icon(Icons.edit_outlined),
                      label: const Text('Editar'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _handleDeleteMilestone(route, milestone),
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      label: const Text('Eliminar', style: TextStyle(color: Colors.red)),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_route == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Ruta no encontrada')),
      );
    }

    final route = _route!;
    final points = route.trackPoints ?? [];
    final isOwner = _isOwner(route);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppTheme.ink,
        title: Text(route.title, overflow: TextOverflow.ellipsis),
        actions: [
          if (isOwner)
            PopupMenuButton<String>(
              onSelected: (value) {
                if (value == 'edit') _handleEditRoute(route);
                if (value == 'delete') _handleDeleteRoute(route);
              },
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'edit', child: Text('Editar ruta')),
                PopupMenuItem(value: 'delete', child: Text('Eliminar ruta')),
              ],
            ),
        ],
      ),
      body: ListView(
        children: [
          Stack(
            children: [
              SizedBox(
                height: _mapExpanded ? 480 : 320,
                child: points.isEmpty
                    ? Container(color: Colors.grey[300])
                    : FlutterMap(
                        options: MapOptions(
                          initialCameraFit: CameraFit.coordinates(
                            coordinates: points.map((p) => LatLng(p.lat, p.lng)).toList(),
                            padding: const EdgeInsets.all(24),
                          ),
                          onTap: _pickingMilestoneLocation
                              ? (_, point) => _handleMapTapForMilestone(route, point)
                              : null,
                        ),
                        children: [
                          OfflineMapService.buildTileLayer(),
                          PolylineLayer(
                            polylines: [
                              Polyline(
                                points: points.map((p) => LatLng(p.lat, p.lng)).toList(),
                                strokeWidth: 4,
                                color: Theme.of(context).primaryColor,
                              ),
                            ],
                          ),
                          MarkerLayer(
                            markers: [
                              if (route.startPoint != null)
                                Marker(
                                  point: LatLng(route.startPoint!.lat, route.startPoint!.lng),
                                  width: 24,
                                  height: 24,
                                  child: const Icon(Icons.flag, color: Colors.green),
                                ),
                              if (route.endPoint != null)
                                Marker(
                                  point: LatLng(route.endPoint!.lat, route.endPoint!.lng),
                                  width: 24,
                                  height: 24,
                                  child: const Icon(Icons.flag, color: Colors.red),
                                ),
                              ...(route.milestones ?? []).map((milestone) {
                                return Marker(
                                  point: LatLng(milestone.point.lat, milestone.point.lng),
                                  width: 36,
                                  height: 36,
                                  child: GestureDetector(
                                    onTap: () => _showMilestone(route, milestone),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: Colors.orange,
                                        shape: BoxShape.circle,
                                        border: Border.all(color: Colors.white, width: 2),
                                        boxShadow: [
                                          BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 4),
                                        ],
                                      ),
                                      child: milestone.photoUrl != null
                                          ? ClipOval(
                                              child: CachedNetworkImage(
                                                imageUrl: milestone.photoUrl!,
                                                fit: BoxFit.cover,
                                                width: 32,
                                                height: 32,
                                                errorWidget: (_, __, ___) =>
                                                    const Icon(Icons.comment, color: Colors.white, size: 16),
                                              ),
                                            )
                                          : const Icon(Icons.comment, color: Colors.white, size: 16),
                                    ),
                                  ),
                                );
                              }),
                            ],
                          ),
                        ],
                      ),
              ),
              if (_pickingMilestoneLocation)
                Positioned(
                  top: 8,
                  left: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black87,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'Toca el mapa para elegir dónde va el hito',
                            style: TextStyle(color: Colors.white, fontSize: 13),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white, size: 18),
                          onPressed: () => setState(() => _pickingMilestoneLocation = false),
                        ),
                      ],
                    ),
                  ),
                ),
              if (points.isNotEmpty)
                Positioned(
                  bottom: 8,
                  right: 8,
                  child: FloatingActionButton.small(
                    heroTag: 'expandMap',
                    backgroundColor: Colors.white,
                    onPressed: () => setState(() => _mapExpanded = !_mapExpanded),
                    child: Icon(
                      _mapExpanded ? Icons.close_fullscreen : Icons.open_in_full,
                      color: AppTheme.ink,
                      size: 18,
                    ),
                  ),
                ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GestureDetector(
                  onTap: () {
                    final userId = route.user?.id ?? route.userId;
                    Navigator.of(context).pushNamed('/user-profile', arguments: userId);
                  },
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundImage: route.user?.profilePicture != null
                            ? CachedNetworkImageProvider(route.user!.profilePicture!)
                            : null,
                        child: route.user?.profilePicture == null ? const Icon(Icons.person) : null,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        route.user?.name ?? 'Usuario',
                        style: const TextStyle(fontWeight: FontWeight.w600, decoration: TextDecoration.underline),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text(_activityLabels[route.activityType] ?? route.activityType,
                    style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                if (route.description != null) ...[
                  const SizedBox(height: 8),
                  Text(route.description!),
                ],
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.sand,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _Stat(label: 'Distancia', value: route.distanceKm != null ? '${route.distanceKm!.toStringAsFixed(1)} km' : '-'),
                      _Stat(label: 'Duración', value: route.durationSeconds != null ? '${(route.durationSeconds! / 60).round()} min' : '-'),
                      _Stat(label: 'Elevación', value: route.elevationGainM != null ? '${route.elevationGainM!.toStringAsFixed(0)} m' : '-'),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _handleDoThisRoute(route),
                    icon: const Icon(Icons.directions_run),
                    label: const Text('Hacer esta ruta'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    ),
                  ),
                ),
                if (isOwner) ...[
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _pickingMilestoneLocation ? null : _startPickingMilestoneLocation,
                      icon: const Icon(Icons.add_a_photo_outlined),
                      label: Text(_pickingMilestoneLocation
                          ? 'Toca el mapa arriba para elegir el punto...'
                          : 'Agregar hito'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    IconButton(
                      icon: Icon(route.isLiked ? Icons.favorite : Icons.favorite_border,
                          color: route.isLiked ? Colors.red : null),
                      onPressed: _toggleLike,
                    ),
                    Text('${route.likesCount} likes'),
                  ],
                ),
                const Divider(),
                Text('Comentarios (${_comments.length})',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ..._comments.map((c) {
                  final authProvider = Provider.of<AuthProvider>(context, listen: false);
                  final canDelete = authProvider.user?.id == c.userId;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(c.user?.name ?? 'Usuario', style: const TextStyle(fontWeight: FontWeight.w600)),
                              Text(c.text),
                            ],
                          ),
                        ),
                        if (canDelete)
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 18, color: Colors.grey),
                            onPressed: () => _handleDeleteComment(c),
                          ),
                      ],
                    ),
                  );
                }),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _commentController,
                        decoration: const InputDecoration(hintText: 'Escribe un comentario...'),
                      ),
                    ),
                    IconButton(icon: const Icon(Icons.send), onPressed: _submitComment),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;

  const _Stat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ],
    );
  }
}
