import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:ionicons/ionicons.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/properties_provider.dart';
import '../../models/property.dart';
import '../../models/attraction.dart';
import '../properties/property_grid_card.dart';
import '../properties/property_preview_card.dart';
import '../properties/business_result_card.dart';
import '../properties/attraction_result_card.dart';

/// Panel deslizante desde la derecha (sidebar), usado para fechas/huéspedes
/// y para filtros - reemplaza los paneles inline que antes ocupaban toda
/// la pantalla de búsqueda.
Future<T?> _showSidePanel<T>(BuildContext context, Widget child) {
  return showGeneralDialog<T>(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Cerrar',
    barrierColor: Colors.black38,
    transitionDuration: const Duration(milliseconds: 220),
    pageBuilder: (context, _, __) {
      return Align(
        alignment: Alignment.centerRight,
        child: SizedBox(
          width: MediaQuery.of(context).size.width * 0.85,
          height: double.infinity,
          child: Material(
            elevation: 8,
            child: SafeArea(child: child),
          ),
        ),
      );
    },
    transitionBuilder: (context, animation, _, child) {
      return SlideTransition(
        position: Tween<Offset>(begin: const Offset(1, 0), end: Offset.zero)
            .animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
        child: child,
      );
    },
  );
}

class SearchScreen extends StatefulWidget {
  final Map<String, dynamic>? initialLocation;
  final String category;

  const SearchScreen({super.key, this.initialLocation, this.category = 'hotel'});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _locationController = TextEditingController();
  final MapController _mapController = MapController();
  final DraggableScrollableController _sheetController =
      DraggableScrollableController();
  DateTime? _checkIn;
  DateTime? _checkOut;
  int _adults = 2;
  int _children = 0;
  double _minPrice = 0;
  double _maxPrice = 1000;
  String? _propertyType;
  Property? _previewProperty;

  bool get _isHotelSearch => widget.category == 'hotel';
  bool get _isAttractionSearch => widget.category == 'attractions';
  bool get _isAllSearch => widget.category == 'all';

  @override
  void initState() {
    super.initState();
    if (widget.initialLocation?['location'] != null) {
      _locationController.text = widget.initialLocation!['location'];
    }
    // Buscar siempre al entrar - antes solo buscaba si venía una ubicación
    // predefinida, así que elegir una categoría desde home abría la
    // pantalla vacía hasta tocar la lupa a mano.
    _performSearch();
  }

  @override
  void dispose() {
    _locationController.dispose();
    _mapController.dispose();
    _sheetController.dispose();
    super.dispose();
  }

  Future<void> _performSearch() async {
    final propertiesProvider =
        Provider.of<PropertiesProvider>(context, listen: false);

    final location = _locationController.text.trim().isNotEmpty
        ? _locationController.text.trim()
        : null;

    setState(() => _previewProperty = null);

    if (_isHotelSearch) {
      await propertiesProvider.searchProperties(
        location: location,
        checkIn: _checkIn,
        checkOut: _checkOut,
        adults: _adults,
        children: _children,
        minPrice: _minPrice > 0 ? _minPrice : null,
        maxPrice: _maxPrice < 1000 ? _maxPrice : null,
        propertyType: _propertyType,
      );
    } else if (_isAttractionSearch) {
      await propertiesProvider.searchAttractions(location: location);
    } else if (_isAllSearch) {
      // Secuencial (no Future.wait) para que el flag isLoading del provider
      // no titile al terminar cada llamada en momentos distintos.
      await propertiesProvider.searchProperties(location: location);
      await propertiesProvider.searchAttractions(location: location);
      await propertiesProvider.searchByCategory('all', location: location);
    } else {
      await propertiesProvider.searchByCategory(widget.category, location: location);
    }
  }

  Future<void> _openDatesGuestsPanel() async {
    await _showSidePanel(
      context,
      _DatesGuestsPanel(
        initialCheckIn: _checkIn,
        initialCheckOut: _checkOut,
        initialAdults: _adults,
        initialChildren: _children,
        onApply: (checkIn, checkOut, adults, children) {
          setState(() {
            _checkIn = checkIn;
            _checkOut = checkOut;
            _adults = adults;
            _children = children;
          });
          _performSearch();
        },
      ),
    );
  }

  Future<void> _openFiltersPanel() async {
    await _showSidePanel(
      context,
      _FiltersPanel(
        initialMinPrice: _minPrice,
        initialMaxPrice: _maxPrice,
        initialPropertyType: _propertyType,
        onApply: (minPrice, maxPrice, propertyType) {
          setState(() {
            _minPrice = minPrice;
            _maxPrice = maxPrice;
            _propertyType = propertyType;
          });
          _performSearch();
        },
      ),
    );
  }

  void _closePreview() => setState(() => _previewProperty = null);

  List<Marker> _buildPropertyMarkers(List<Property> properties) {
    return properties.where((p) => p.addressLatitude != null && p.addressLongitude != null).map((property) {
      final isSelected = _previewProperty?.id == property.id;
      return Marker(
        width: isSelected ? 90 : 76,
        height: isSelected ? 42 : 36,
        point: LatLng(property.addressLatitude!, property.addressLongitude!),
        child: GestureDetector(
          onTap: () => setState(() => _previewProperty = property),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: isSelected ? AppTheme.primaryColor : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isSelected ? AppTheme.primaryColor : AppTheme.line),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 4, offset: const Offset(0, 2))],
            ),
            alignment: Alignment.center,
            child: Text(
              CurrencyFormatter.format(property.minPrice),
              style: TextStyle(
                color: isSelected ? Colors.white : AppTheme.ink,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ),
      );
    }).toList();
  }

  List<Marker> _buildAttractionMarkers(List<Attraction> attractions) {
    return attractions.where((a) => a.latitude != null && a.longitude != null).map((attraction) {
      return Marker(
        width: 36,
        height: 36,
        point: LatLng(attraction.latitude!, attraction.longitude!),
        child: GestureDetector(
          onTap: () => Navigator.of(context).pushNamed('/attraction-detail', arguments: attraction.id),
          child: Container(
            decoration: BoxDecoration(
              color: AppTheme.secondaryColor,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 4)],
            ),
            child: const Icon(Icons.landscape, color: Colors.white, size: 18),
          ),
        ),
      );
    }).toList();
  }

  List<Marker> _buildMarkers(PropertiesProvider provider) {
    final markers = <Marker>[];
    // Restaurantes/tours/entretenimiento/spa (BusinessResult) no traen
    // lat/lng desde /search/all - solo distrito - así que no tienen pin
    // propio; siguen listados en el panel de abajo igual.
    if (_isHotelSearch || _isAllSearch) {
      markers.addAll(_buildPropertyMarkers(provider.searchResults));
    }
    if (_isAttractionSearch || _isAllSearch) {
      markers.addAll(_buildAttractionMarkers(provider.attractionResults));
    }
    return markers;
  }

  @override
  Widget build(BuildContext context) {
    final propertiesProvider = Provider.of<PropertiesProvider>(context);
    final markers = _buildMarkers(propertiesProvider);
    final center = markers.isNotEmpty
        ? markers.first.point
        : const LatLng(-7.1619, -78.5128); // Default: Cajamarca

    return Scaffold(
      body: Stack(
        children: [
          // Mapa de fondo, ocupa toda la pantalla
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(initialCenter: center, initialZoom: 12, minZoom: 4, maxZoom: 18),
            children: [
              TileLayer(
                // Estilo claro gris/azul (CartoDB Positron) en vez del OSM
                // crudo, que sale beige/amarillento y no combina con la marca.
                urlTemplate:
                    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
                userAgentPackageName: 'com.adapptika.tudestino',
                tileDisplay: const TileDisplay.fadeIn(),
              ),
              MarkerLayer(markers: markers),
            ],
          ),

          // Barra de búsqueda flotante sobre el mapa
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  Material(
                    color: Colors.white,
                    shape: const CircleBorder(),
                    elevation: 3,
                    child: InkWell(
                      customBorder: const CircleBorder(),
                      onTap: () => Navigator.of(context).maybePop(),
                      child: const SizedBox(
                        width: 40,
                        height: 40,
                        child: Icon(Icons.arrow_back, size: 20, color: AppTheme.ink),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Material(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      elevation: 3,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: SizedBox(
                          height: 40,
                          child: Row(
                            children: [
                              const Icon(Icons.search, size: 18, color: AppTheme.mute),
                              const SizedBox(width: 6),
                              Expanded(
                                child: TextField(
                                  controller: _locationController,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                  decoration: const InputDecoration(
                                    hintText: 'Destino',
                                    hintStyle: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.ink),
                                    border: InputBorder.none,
                                    isDense: true,
                                  ),
                                  onSubmitted: (_) => _performSearch(),
                                ),
                              ),
                              propertiesProvider.isLoading
                                  ? const SizedBox(
                                      width: 16, height: 16,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                  : InkWell(
                                      onTap: _performSearch,
                                      child: const Icon(Icons.search, size: 18, color: AppTheme.primaryColor),
                                    ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (_isHotelSearch) ...[
                    const SizedBox(width: 8),
                    Material(
                      color: Colors.white,
                      shape: const CircleBorder(),
                      elevation: 3,
                      child: InkWell(
                        customBorder: const CircleBorder(),
                        onTap: _openDatesGuestsPanel,
                        child: const SizedBox(
                          width: 40,
                          height: 40,
                          child: Icon(Icons.calendar_month_outlined, size: 18, color: AppTheme.ink),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Material(
                      color: Colors.white,
                      shape: const CircleBorder(),
                      elevation: 3,
                      child: InkWell(
                        customBorder: const CircleBorder(),
                        onTap: _openFiltersPanel,
                        child: const SizedBox(
                          width: 40,
                          height: 40,
                          child: Icon(Icons.filter_alt_outlined, size: 18, color: AppTheme.ink),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
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
              checkIn: _checkIn,
              checkOut: _checkOut,
              adults: _adults,
              children: _children,
              onHide: _closePreview,
            )
          else
            _buildResultsSheet(propertiesProvider),
        ],
      ),
    );
  }

  Widget _buildResultsSheet(PropertiesProvider provider) {
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
              BoxShadow(color: Colors.black26, blurRadius: 16, offset: Offset(0, -4)),
            ],
          ),
          child: _buildSheetContent(provider, scrollController),
        );
      },
    );
  }

  Widget _buildSheetContent(PropertiesProvider provider, ScrollController scrollController) {
    if (provider.error != null) {
      return ListView(
        controller: scrollController,
        children: [
          const SizedBox(height: 40),
          Icon(Icons.error_outline, size: 48, color: Colors.grey.shade400),
          const SizedBox(height: 12),
          Center(child: Text(provider.error!, textAlign: TextAlign.center)),
          const SizedBox(height: 16),
          Center(
            child: ElevatedButton(onPressed: _performSearch, child: const Text('Reintentar')),
          ),
        ],
      );
    }

    final List<Widget> cards;
    if (_isHotelSearch) {
      cards = provider.searchResults
          .map((p) => PropertyGridCard(
                property: p,
                checkIn: _checkIn,
                checkOut: _checkOut,
                adults: _adults,
                children: _children,
              ))
          .toList();
    } else if (_isAttractionSearch) {
      cards = provider.attractionResults
          .map((a) => AttractionResultCard(attraction: a))
          .toList();
    } else if (_isAllSearch) {
      // Hoteles y atractivos ya vienen como objetos completos de sus propios
      // endpoints - de /search/all (category=all) solo se usan las entradas
      // que NO son 'property' (esas ya están cubiertas y con más detalle
      // por searchProperties, que sí trae precio/habitaciones reales).
      cards = [
        ...provider.searchResults.map((p) => PropertyGridCard(
              property: p,
              checkIn: _checkIn,
              checkOut: _checkOut,
              adults: _adults,
              children: _children,
            )),
        ...provider.attractionResults.map((a) => AttractionResultCard(attraction: a)),
        ...provider.businessResults
            .where((b) => b.type != 'property')
            .map((b) => BusinessResultCard(business: b)),
      ];
    } else {
      cards = provider.businessResults
          .map((b) => BusinessResultCard(business: b))
          .toList();
    }

    return CustomScrollView(
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
                      provider.isLoading
                          ? 'Buscando...'
                          : '${cards.length} ${cards.length == 1 ? "resultado encontrado" : "resultados encontrados"}',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    if (_isHotelSearch)
                      TextButton.icon(
                        onPressed: () {
                          // TODO: Ordenar
                        },
                        icon: const Icon(Ionicons.swap_vertical_outline, size: 18),
                        label: const Text('Ordenar'),
                        style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        if (provider.isLoading)
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: 48),
              child: Center(child: CircularProgressIndicator()),
            ),
          )
        else if (cards.isEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 48),
              child: Column(
                children: [
                  Icon(Icons.search_off, size: 56, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  Text(
                    'No se encontraron resultados',
                    style: TextStyle(fontSize: 15, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Intenta modificar tus criterios de búsqueda',
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                  ),
                ],
              ),
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.68,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) => cards[index],
                childCount: cards.length,
              ),
            ),
          ),
      ],
    );
  }
}

class _DatesGuestsPanel extends StatefulWidget {
  final DateTime? initialCheckIn;
  final DateTime? initialCheckOut;
  final int initialAdults;
  final int initialChildren;
  final void Function(DateTime? checkIn, DateTime? checkOut, int adults, int children) onApply;

  const _DatesGuestsPanel({
    required this.initialCheckIn,
    required this.initialCheckOut,
    required this.initialAdults,
    required this.initialChildren,
    required this.onApply,
  });

  @override
  State<_DatesGuestsPanel> createState() => _DatesGuestsPanelState();
}

class _DatesGuestsPanelState extends State<_DatesGuestsPanel> {
  late DateTime? _checkIn = widget.initialCheckIn;
  late DateTime? _checkOut = widget.initialCheckOut;
  late int _adults = widget.initialAdults;
  late int _children = widget.initialChildren;

  Future<void> _selectDate(bool isCheckIn) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isCheckIn
          ? (_checkIn ?? DateTime.now())
          : (_checkOut ?? (_checkIn?.add(const Duration(days: 1)) ?? DateTime.now().add(const Duration(days: 1)))),
      firstDate: isCheckIn ? DateTime.now() : (_checkIn ?? DateTime.now()),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      locale: const Locale('es', 'ES'),
    );

    if (picked == null) return;

    setState(() {
      if (isCheckIn) {
        _checkIn = picked;
        if (_checkOut != null && !_checkOut!.isAfter(picked)) {
          _checkOut = picked.add(const Duration(days: 1));
        }
      } else {
        if (_checkIn != null && !picked.isAfter(_checkIn!)) return;
        _checkOut = picked;
      }
    });
  }

  Widget _counter(String label, int value, ValueChanged<int> onChanged, {int min = 0}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 16)),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline),
                onPressed: value > min ? () => onChanged(value - 1) : null,
              ),
              SizedBox(
                width: 32,
                child: Text('$value', textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle_outline),
                onPressed: value < 10 ? () => onChanged(value + 1) : null,
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd MMM yyyy', 'es');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(child: Text('Fechas y huéspedes', style: Theme.of(context).textTheme.titleLarge)),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(context).pop()),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            children: [
              Text('Fechas', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _selectDate(true),
                      child: Text(_checkIn != null ? dateFormat.format(_checkIn!) : 'Entrada'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _selectDate(false),
                      child: Text(_checkOut != null ? dateFormat.format(_checkOut!) : 'Salida'),
                    ),
                  ),
                ],
              ),
              const Divider(height: 40),
              Text('Huéspedes', style: Theme.of(context).textTheme.titleMedium),
              _counter('Adultos', _adults, (v) => setState(() => _adults = v), min: 1),
              _counter('Niños', _children, (v) => setState(() => _children = v)),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(20),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                widget.onApply(_checkIn, _checkOut, _adults, _children);
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
              child: const Text('Aplicar'),
            ),
          ),
        ),
      ],
    );
  }
}

class _FiltersPanel extends StatefulWidget {
  final double initialMinPrice;
  final double initialMaxPrice;
  final String? initialPropertyType;
  final void Function(double minPrice, double maxPrice, String? propertyType) onApply;

  const _FiltersPanel({
    required this.initialMinPrice,
    required this.initialMaxPrice,
    required this.initialPropertyType,
    required this.onApply,
  });

  @override
  State<_FiltersPanel> createState() => _FiltersPanelState();
}

class _FiltersPanelState extends State<_FiltersPanel> {
  late double _minPrice = widget.initialMinPrice;
  late double _maxPrice = widget.initialMaxPrice;
  late String? _propertyType = widget.initialPropertyType;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(child: Text('Filtros', style: Theme.of(context).textTheme.titleLarge)),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(context).pop()),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            children: [
              Text('Rango de precio: S/ ${_minPrice.toInt()} - S/ ${_maxPrice.toInt()}'),
              RangeSlider(
                values: RangeValues(_minPrice, _maxPrice),
                min: 0,
                max: 1000,
                divisions: 20,
                onChanged: (values) => setState(() {
                  _minPrice = values.start;
                  _maxPrice = values.end;
                }),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _propertyType,
                decoration: const InputDecoration(
                  labelText: 'Tipo de alojamiento',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: null, child: Text('Todos')),
                  DropdownMenuItem(value: 'apartment', child: Text('Apartamento')),
                  DropdownMenuItem(value: 'house', child: Text('Casa')),
                  DropdownMenuItem(value: 'villa', child: Text('Villa')),
                  DropdownMenuItem(value: 'hotel', child: Text('Hotel')),
                  DropdownMenuItem(value: 'room', child: Text('Habitación')),
                ],
                onChanged: (value) => setState(() => _propertyType = value),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(20),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                widget.onApply(_minPrice, _maxPrice, _propertyType);
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
              child: const Text('Aplicar filtros'),
            ),
          ),
        ),
      ],
    );
  }
}
