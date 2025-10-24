import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:intl/intl.dart';
import '../../providers/properties_provider.dart';
import '../../models/property.dart';
import '../properties/property_grid_card.dart';

class SearchResultsScreen extends StatefulWidget {
  final String? location;
  final double? lat;
  final double? lng;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final int adults;
  final int children;

  const SearchResultsScreen({
    super.key,
    this.location,
    this.lat,
    this.lng,
    this.checkIn,
    this.checkOut,
    this.adults = 2,
    this.children = 0,
  });

  @override
  State<SearchResultsScreen> createState() => _SearchResultsScreenState();
}

class _SearchResultsScreenState extends State<SearchResultsScreen> {
  final MapController _mapController = MapController();
  String? _hoveredPropertyId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _performSearch();
    });
  }

  Future<void> _performSearch() async {
    final propertiesProvider = Provider.of<PropertiesProvider>(context, listen: false);

    await propertiesProvider.searchProperties(
      location: widget.location,
      checkIn: widget.checkIn,
      checkOut: widget.checkOut,
      adults: widget.adults,
      children: widget.children,
    );
  }

  List<Marker> _buildMarkers(List<Property> properties) {
    return properties.where((p) =>
      p.addressLatitude != null && p.addressLongitude != null
    ).map((property) {
      final isHovered = _hoveredPropertyId == property.id;
      final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

      return Marker(
        width: isHovered ? 85 : 75,
        height: isHovered ? 42 : 38,
        point: LatLng(property.addressLatitude!, property.addressLongitude!),
        child: GestureDetector(
          onTap: () {
            Navigator.of(context).pushNamed(
              '/property-detail',
              arguments: {
                'propertyId': property.id,
                'checkIn': widget.checkIn,
                'checkOut': widget.checkOut,
                'adults': widget.adults,
                'children': widget.children,
              },
            );
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isHovered ? Colors.black87 : Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: isHovered ? Colors.black87 : Colors.grey.shade300,
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: isHovered
                      ? Colors.black.withAlpha(75)
                      : Colors.black.withAlpha(45),
                  blurRadius: isHovered ? 8 : 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              currencyFormat.format(property.minPrice),
              style: TextStyle(
                color: isHovered ? Colors.white : Colors.black87,
                fontWeight: FontWeight.bold,
                fontSize: isHovered ? 15 : 14,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final propertiesProvider = Provider.of<PropertiesProvider>(context);
    final theme = Theme.of(context);

    final center = widget.lat != null && widget.lng != null
        ? LatLng(widget.lat!, widget.lng!)
        : const LatLng(-7.1619, -78.5128); // Default: Cajamarca

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.location ?? 'Resultados',
              style: const TextStyle(fontSize: 16),
            ),
            if (widget.checkIn != null && widget.checkOut != null)
              Text(
                '${DateFormat('d MMM').format(widget.checkIn!)} - ${DateFormat('d MMM').format(widget.checkOut!)} • ${widget.adults + widget.children} huéspedes',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.normal,
                ),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // TODO: Mostrar filtros
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Mapa (40% de altura)
          Expanded(
            flex: 4,
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: center,
                initialZoom: 12,
                minZoom: 5,
                maxZoom: 18,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.tudestino.mobile',
                  tileDisplay: const TileDisplay.fadeIn(),
                ),
                MarkerLayer(
                  markers: _buildMarkers(propertiesProvider.properties),
                ),
              ],
            ),
          ),

          // Divider
          Container(
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(25),
                  blurRadius: 4,
                  offset: const Offset(0, -1),
                ),
              ],
            ),
          ),

          // Lista/Grid de propiedades (60% de altura)
          Expanded(
            flex: 6,
            child: propertiesProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : propertiesProvider.properties.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search_off,
                              size: 64,
                              color: Colors.grey.shade400,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No se encontraron propiedades',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey.shade600,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Intenta cambiar los filtros de búsqueda',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      )
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header con contador
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${propertiesProvider.properties.length} ${propertiesProvider.properties.length == 1 ? "propiedad encontrada" : "propiedades encontradas"}',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                TextButton.icon(
                                  onPressed: () {
                                    // TODO: Ordenar
                                  },
                                  icon: const Icon(Icons.sort, size: 18),
                                  label: const Text('Ordenar'),
                                  style: TextButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Grid de propiedades
                          Expanded(
                            child: GridView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2, // 2 propiedades por fila
                                childAspectRatio: 0.68, // Proporción ancho/alto
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                              itemCount: propertiesProvider.properties.length,
                              itemBuilder: (context, index) {
                                final property = propertiesProvider.properties[index];
                                return MouseRegion(
                                  onEnter: (_) {
                                    setState(() {
                                      _hoveredPropertyId = property.id;
                                    });
                                  },
                                  onExit: (_) {
                                    setState(() {
                                      _hoveredPropertyId = null;
                                    });
                                  },
                                  child: PropertyGridCard(
                                    property: property,
                                    checkIn: widget.checkIn,
                                    checkOut: widget.checkOut,
                                    adults: widget.adults,
                                    children: widget.children,
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }
}
