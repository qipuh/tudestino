import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../models/gps_route.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/offline_map_service.dart';

/// Mapa + tarjetas de distancia/duración para elegir entre una o varias
/// rutas calculadas (principal + alternas). Reusado por PlanRouteScreen en
/// sus dos modos (búsqueda de destino y "navegar al inicio de una ruta") -
/// en modo `fixed` simplemente le llega una lista de una sola opción, sin
/// ramas especiales acá adentro.
class RouteOptionsMap extends StatelessWidget {
  final List<RouteOption> options;
  final int selectedIndex;
  final ValueChanged<int> onSelect;
  final GeoPoint origin;
  final GeoPoint destination;
  final String destinationLabel;

  const RouteOptionsMap({
    super.key,
    required this.options,
    required this.selectedIndex,
    required this.onSelect,
    required this.origin,
    required this.destination,
    required this.destinationLabel,
  });

  @override
  Widget build(BuildContext context) {
    final allPoints = options
        .expand((o) => o.geometry)
        .map((p) => LatLng(p.lat, p.lng))
        .toList();

    return Column(
      children: [
        Expanded(
          child: FlutterMap(
            options: MapOptions(
              initialCameraFit: allPoints.length >= 2
                  ? CameraFit.coordinates(coordinates: allPoints, padding: const EdgeInsets.all(40))
                  : null,
              initialCenter: LatLng(origin.lat, origin.lng),
              initialZoom: 14,
            ),
            children: [
              OfflineMapService.buildTileLayer(),
              PolylineLayer(
                polylines: options.asMap().entries.map((entry) {
                  final isSelected = entry.key == selectedIndex;
                  return Polyline(
                    points: entry.value.geometry.map((p) => LatLng(p.lat, p.lng)).toList(),
                    strokeWidth: isSelected ? 5 : 4,
                    color: isSelected
                        ? Theme.of(context).primaryColor
                        : Colors.grey.withValues(alpha: 0.5),
                  );
                }).toList(),
              ),
              MarkerLayer(
                markers: [
                  Marker(
                    point: LatLng(origin.lat, origin.lng),
                    width: 22,
                    height: 22,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                      ),
                    ),
                  ),
                  Marker(
                    point: LatLng(destination.lat, destination.lng),
                    width: 28,
                    height: 28,
                    child: const Icon(Icons.flag, color: Colors.red, size: 28),
                  ),
                ],
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  destinationLabel,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 76,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: options.length,
                  itemBuilder: (context, index) {
                    final option = options[index];
                    final selected = index == selectedIndex;
                    return GestureDetector(
                      onTap: () => onSelect(index),
                      child: Container(
                        width: 140,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: selected ? AppTheme.primaryColor.withValues(alpha: 0.1) : Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: selected ? AppTheme.primaryColor : Colors.grey.shade300,
                            width: selected ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              option.isPrimary ? 'Ruta recomendada' : 'Alterna ${index + 1}',
                              style: const TextStyle(fontSize: 11, color: AppTheme.mute),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${option.distanceKm.toStringAsFixed(1)} km',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                            Text(
                              '${option.durationMinutes.round()} min',
                              style: const TextStyle(fontSize: 12, color: AppTheme.mute),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
