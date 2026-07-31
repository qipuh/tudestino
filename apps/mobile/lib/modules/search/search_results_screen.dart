import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:intl/intl.dart';
import 'package:ionicons/ionicons.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/properties_provider.dart';
import '../../models/property.dart';
import '../properties/property_grid_card.dart';
import '../properties/property_preview_card.dart';

class SearchResultsScreen extends StatefulWidget {
  final String? location;
  final double? lat;
  final double? lng;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final int adults;
  final int children;
  final String? category;

  const SearchResultsScreen({
    super.key,
    this.location,
    this.lat,
    this.lng,
    this.checkIn,
    this.checkOut,
    this.adults = 2,
    this.children = 0,
    this.category,
  });

  @override
  State<SearchResultsScreen> createState() => _SearchResultsScreenState();
}

class _SearchResultsScreenState extends State<SearchResultsScreen> {
  final MapController _mapController = MapController();
  final DraggableScrollableController _sheetController =
      DraggableScrollableController();
  String? _hoveredPropertyId;
  Property? _previewProperty;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _performSearch();
    });
  }

  Future<void> _performSearch() async {
    final propertiesProvider = Provider.of<PropertiesProvider>(context, listen: false);

    if (widget.category != null) {
      // Búsqueda por categoría (sin ubicación específica)
      await propertiesProvider.searchByCategory(widget.category!,
          location: widget.location);
    } else {
      // Búsqueda avanzada con ubicación, fechas, huéspedes
      await propertiesProvider.searchProperties(
        location: widget.location,
        checkIn: widget.checkIn,
        checkOut: widget.checkOut,
        adults: widget.adults,
        children: widget.children,
      );
    }
  }

  List<Marker> _buildMarkers(List<Property> properties) {
    return properties.where((p) =>
      p.addressLatitude != null && p.addressLongitude != null
    ).map((property) {
      final isHovered = _hoveredPropertyId == property.id;

      return Marker(
        width: isHovered ? 85 : 75,
        height: isHovered ? 42 : 38,
        point: LatLng(property.addressLatitude!, property.addressLongitude!),
        child: GestureDetector(
          onTap: () {
            setState(() {
              _hoveredPropertyId = property.id;
              _previewProperty = property;
            });
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isHovered ? AppTheme.primaryColor : Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: isHovered ? AppTheme.primaryColor : AppTheme.line,
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: isHovered
                      ? AppTheme.primaryColor.withValues(alpha: 0.35)
                      : Colors.black.withAlpha(45),
                  blurRadius: isHovered ? 8 : 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              CurrencyFormatter.format(property.minPrice),
              style: TextStyle(
                color: isHovered ? Colors.white : AppTheme.ink,
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

  void _closePreview() {
    setState(() {
      _previewProperty = null;
      _hoveredPropertyId = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final propertiesProvider = Provider.of<PropertiesProvider>(context);

    final center = widget.lat != null && widget.lng != null
        ? LatLng(widget.lat!, widget.lng!)
        : const LatLng(-7.1619, -78.5128); // Default: Cajamarca

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.white.withValues(alpha: 0.9),
        elevation: 0,
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
            icon: const Icon(Ionicons.filter_outline),
            onPressed: () {
              // TODO: Mostrar filtros
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Mapa de fondo, ocupa toda la pantalla
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: center,
              initialZoom: 12,
              minZoom: 5,
              maxZoom: 18,
            ),
            children: [
              TileLayer(
                // Estilo claro gris/azul (CartoDB Positron) en vez del OSM
                // crudo, que sale beige/amarillento y no combina con la marca.
                urlTemplate:
                    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.tudestino.mobile',
                tileDisplay: const TileDisplay.fadeIn(),
              ),
              MarkerLayer(
                markers: _buildMarkers(propertiesProvider.properties),
              ),
            ],
          ),

          if (propertiesProvider.isLoading)
            const Positioned(
              top: 120,
              left: 0,
              right: 0,
              child: Center(child: CircularProgressIndicator()),
            ),

          if (_previewProperty != null)
            PropertyPreviewCard(
              property: _previewProperty!,
              checkIn: widget.checkIn,
              checkOut: widget.checkOut,
              adults: widget.adults,
              children: widget.children,
              onHide: _closePreview,
            )
          else
            _buildResultsSheet(propertiesProvider),
        ],
      ),
    );
  }

  Widget _buildResultsSheet(PropertiesProvider propertiesProvider) {
    return DraggableScrollableSheet(
      controller: _sheetController,
      initialChildSize: 0.32,
      minChildSize: 0.14,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 16,
                offset: Offset(0, -4),
              ),
            ],
          ),
          child: propertiesProvider.properties.isEmpty && !propertiesProvider.isLoading
              ? _buildEmptyState(scrollController)
              : CustomScrollView(
                  controller: scrollController,
                  slivers: [
                    SliverToBoxAdapter(
                      child: Column(
                        children: [
                          const SizedBox(height: 10),
                          Container(
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: Colors.grey.shade300,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
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
                                  icon: const Icon(Ionicons.swap_vertical_outline, size: 18),
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
                        ],
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(12, 0, 12, 24),
                      sliver: SliverGrid(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.68,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final property = propertiesProvider.properties[index];
                            return MouseRegion(
                              onEnter: (_) => setState(() => _hoveredPropertyId = property.id),
                              onExit: (_) => setState(() => _hoveredPropertyId = null),
                              child: PropertyGridCard(
                                property: property,
                                checkIn: widget.checkIn,
                                checkOut: widget.checkOut,
                                adults: widget.adults,
                                children: widget.children,
                              ),
                            );
                          },
                          childCount: propertiesProvider.properties.length,
                        ),
                      ),
                    ),
                  ],
                ),
        );
      },
    );
  }

  Widget _buildEmptyState(ScrollController scrollController) {
    return ListView(
      controller: scrollController,
      children: [
        const SizedBox(height: 10),
        Center(
          child: Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 48),
          child: Column(
            children: [
              Icon(Ionicons.search_outline, size: 64, color: Colors.grey.shade400),
              const SizedBox(height: 16),
              Text(
                'No se encontraron propiedades',
                style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
              ),
              const SizedBox(height: 8),
              Text(
                'Intenta cambiar los filtros de búsqueda',
                style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _mapController.dispose();
    _sheetController.dispose();
    super.dispose();
  }
}
