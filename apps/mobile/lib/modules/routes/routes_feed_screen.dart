import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../providers/route_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/gps_route.dart';
import 'plan_route_screen.dart';
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

const _activityIcons = {
  'trekking': Icons.hiking,
  'walking': Icons.directions_walk,
  'cycling': Icons.directions_bike,
  'running': Icons.directions_run,
  'mountaineering': Icons.terrain,
  'climbing': Icons.landscape,
  'kayaking': Icons.kayaking,
  'horseback': Icons.pets,
};

class RoutesFeedScreen extends StatefulWidget {
  const RoutesFeedScreen({super.key});

  @override
  State<RoutesFeedScreen> createState() => _RoutesFeedScreenState();
}

class _RoutesFeedScreenState extends State<RoutesFeedScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<RouteProvider>(context, listen: false).loadFeed(refresh: true);
    });
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      final provider = Provider.of<RouteProvider>(context, listen: false);
      if (!provider.isLoading && provider.hasMoreRoutes) {
        provider.loadFeed();
      }
    }
  }

  Future<void> _onRefresh() async {
    await Provider.of<RouteProvider>(context, listen: false).loadFeed(refresh: true);
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<RouteProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rutas de la comunidad'),
        actions: [
          IconButton(
            icon: const Icon(Icons.map_outlined),
            tooltip: 'Planear ruta',
            onPressed: () {
              if (authProvider.isAuthenticated) {
                Navigator.of(context).pushNamed('/plan-route', arguments: {
                  'mode': PlanRouteMode.search,
                });
              } else {
                Navigator.of(context).pushNamed('/login');
              }
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          if (authProvider.isAuthenticated) {
            Navigator.of(context).pushNamed('/record-route');
          } else {
            Navigator.of(context).pushNamed('/login');
          }
        },
        icon: const Icon(Icons.add_location_alt),
        label: const Text('Grabar ruta'),
      ),
      body: Column(
        children: [
          if (provider.pendingRoutesCount > 0)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              color: Colors.orange.shade50,
              child: Row(
                children: [
                  const Icon(Icons.cloud_off, size: 18, color: Colors.orange),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      provider.pendingRoutesCount == 1
                          ? '1 ruta pendiente de subir - se sube sola al tener señal'
                          : '${provider.pendingRoutesCount} rutas pendientes de subir - se suben solas al tener señal',
                      style: const TextStyle(fontSize: 13),
                    ),
                  ),
                  TextButton(
                    onPressed: () => provider.syncPendingRoutesNow(),
                    child: const Text('Reintentar'),
                  ),
                ],
              ),
            ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _onRefresh,
              child: provider.feedRoutes.isEmpty && provider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : provider.feedRoutes.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.route_outlined, size: 80, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Text('Todavía no hay rutas compartidas',
                            style: TextStyle(fontSize: 18, color: Colors.grey)),
                        const SizedBox(height: 8),
                        const Text('Sé el primero en grabar y compartir un recorrido'),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    itemCount: provider.feedRoutes.length + 1,
                    itemBuilder: (context, index) {
                      if (index == provider.feedRoutes.length) {
                        return provider.isLoading
                            ? const Padding(
                                padding: EdgeInsets.all(16.0),
                                child: Center(child: CircularProgressIndicator()),
                              )
                            : const SizedBox(height: 80);
                      }
                      return RouteCard(route: provider.feedRoutes[index]);
                    },
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class RouteCard extends StatelessWidget {
  final GpsRoute route;

  const RouteCard({super.key, required this.route});

  String _formatDuration(int? seconds) {
    if (seconds == null) return '';
    final minutes = (seconds / 60).round();
    if (minutes < 60) return '$minutes min';
    return '${(minutes / 60).floor()}h ${minutes % 60}min';
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<RouteProvider>(context, listen: false);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed('/route-detail', arguments: {'routeId': route.id}),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 160,
              width: double.infinity,
              child: route.coverImage != null
                  ? CachedNetworkImage(
                      imageUrl: route.coverImage!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => _staticMapPreview(),
                    )
                  : _staticMapPreview(),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 14,
                        backgroundImage: route.user?.profilePicture != null
                            ? CachedNetworkImageProvider(route.user!.profilePicture!)
                            : null,
                        child: route.user?.profilePicture == null
                            ? const Icon(Icons.person, size: 14)
                            : null,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(route.user?.name ?? 'Usuario',
                            style: const TextStyle(fontWeight: FontWeight.w600)),
                      ),
                      Icon(_activityIcons[route.activityType] ?? Icons.route, size: 18),
                      const SizedBox(width: 4),
                      Text(_activityLabels[route.activityType] ?? route.activityType,
                          style: const TextStyle(fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(route.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  if (route.city != null) Text(route.city!, style: TextStyle(color: Colors.grey[600])),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (route.distanceKm != null)
                        Text('${route.distanceKm!.toStringAsFixed(1)} km',
                            style: const TextStyle(fontSize: 12)),
                      const SizedBox(width: 12),
                      Text(_formatDuration(route.durationSeconds),
                          style: const TextStyle(fontSize: 12)),
                      const Spacer(),
                      Text(timeago.format(route.createdAt, locale: 'es'),
                          style: const TextStyle(fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      IconButton(
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        icon: Icon(route.isLiked ? Icons.favorite : Icons.favorite_border,
                            color: route.isLiked ? Colors.red : null, size: 20),
                        onPressed: () => provider.toggleLikeRoute(route.id),
                      ),
                      const SizedBox(width: 4),
                      Text('${route.likesCount}'),
                      const SizedBox(width: 16),
                      const Icon(Icons.mode_comment_outlined, size: 20),
                      const SizedBox(width: 4),
                      Text('${route.commentsCount}'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _staticMapPreview() {
    if (route.startPoint == null) {
      return Container(color: Colors.grey[300], child: const Icon(Icons.map, size: 48));
    }
    return IgnorePointer(
      child: FlutterMap(
        options: MapOptions(
          initialCenter: LatLng(route.startPoint!.lat, route.startPoint!.lng),
          initialZoom: 12,
          interactionOptions: const InteractionOptions(flags: InteractiveFlag.none),
        ),
        children: [
          OfflineMapService.buildTileLayer(),
        ],
      ),
    );
  }
}
