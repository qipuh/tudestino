import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/properties_provider.dart';
import '../../models/property.dart';
import '../../models/attraction.dart';
import '../properties/property_grid_card.dart';
import '../properties/business_result_card.dart';
import '../properties/attraction_result_card.dart';

const _categoryTitles = {
  'all': 'Buscar todo',
  'hotel': 'Buscar alojamiento',
  'restaurant': 'Buscar restaurantes',
  'tours': 'Buscar tours',
  'entertainment': 'Buscar entretenimiento',
  'spa': 'Buscar spa y bienestar',
  'attractions': 'Buscar atractivos turísticos',
};

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
  DateTime? _checkIn;
  DateTime? _checkOut;
  int _adults = 2;
  int _children = 0;
  double _minPrice = 0;
  double _maxPrice = 1000;
  String? _propertyType;
  bool _showMap = false;
  String? _hoveredResultId;

  bool get _isHotelSearch => widget.category == 'hotel';
  bool get _isAttractionSearch => widget.category == 'attractions';
  bool get _isAllSearch => widget.category == 'all';
  bool get _supportsMap => _isHotelSearch || _isAttractionSearch;

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
    super.dispose();
  }

  Future<void> _performSearch() async {
    final propertiesProvider =
        Provider.of<PropertiesProvider>(context, listen: false);

    final location = _locationController.text.trim().isNotEmpty
        ? _locationController.text.trim()
        : null;

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

  @override
  Widget build(BuildContext context) {
    final propertiesProvider = Provider.of<PropertiesProvider>(context);
    final dateFormat = DateFormat('dd MMM', 'es');

    final hasDates = _checkIn != null && _checkOut != null;
    final datesGuestsLabel = _isHotelSearch
        ? (hasDates
            ? '${dateFormat.format(_checkIn!)} - ${dateFormat.format(_checkOut!)} · ${_adults + _children}'
            : 'Fechas · Huéspedes')
        : null;

    return Scaffold(
      appBar: AppBar(
        title: Text(_categoryTitles[widget.category] ?? 'Buscar'),
        actions: [
          if (_supportsMap)
            IconButton(
              icon: Icon(_showMap ? Icons.view_list_outlined : Icons.map_outlined),
              tooltip: _showMap ? 'Ver lista' : 'Ver mapa',
              onPressed: () => setState(() => _showMap = !_showMap),
            ),
          if (_isHotelSearch)
            IconButton(
              icon: const Icon(Icons.filter_alt_outlined),
              tooltip: 'Filtros',
              onPressed: _openFiltersPanel,
            ),
        ],
      ),
      body: Column(
        children: [
          // Barra de búsqueda en una sola línea
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppTheme.sand,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.search, size: 20, color: AppTheme.mute),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _locationController,
                            decoration: const InputDecoration(
                              hintText: 'Destino',
                              border: InputBorder.none,
                              isDense: true,
                            ),
                            onSubmitted: (_) => _performSearch(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (_isHotelSearch) ...[
                  const SizedBox(width: 8),
                  Material(
                    color: AppTheme.sand,
                    borderRadius: BorderRadius.circular(24),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(24),
                      onTap: _openDatesGuestsPanel,
                      child: Container(
                        height: 48,
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        alignment: Alignment.center,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.calendar_month_outlined, size: 20, color: AppTheme.ink),
                            if (hasDates) ...[
                              const SizedBox(width: 6),
                              Text(
                                datesGuestsLabel!,
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
                const SizedBox(width: 8),
                Material(
                  color: AppTheme.primaryColor,
                  borderRadius: BorderRadius.circular(24),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(24),
                    onTap: propertiesProvider.isLoading ? null : _performSearch,
                    child: Container(
                      height: 48,
                      width: 48,
                      alignment: Alignment.center,
                      child: propertiesProvider.isLoading
                          ? const SizedBox(
                              width: 18, height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.search, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Resultados
          Expanded(
            child: _showMap && _supportsMap
                ? _buildMapView(propertiesProvider)
                : _buildResults(propertiesProvider),
          ),
        ],
      ),
    );
  }

  List<Marker> _buildPropertyMarkers(List<Property> properties) {
    return properties.where((p) => p.addressLatitude != null && p.addressLongitude != null).map((property) {
      final isHovered = _hoveredResultId == property.id;
      return Marker(
        width: isHovered ? 90 : 76,
        height: isHovered ? 42 : 36,
        point: LatLng(property.addressLatitude!, property.addressLongitude!),
        child: GestureDetector(
          onTap: () => Navigator.of(context).pushNamed(
            '/property-detail',
            arguments: {
              'propertyId': property.id,
              'checkIn': _checkIn,
              'checkOut': _checkOut,
              'adults': _adults,
              'children': _children,
            },
          ),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: isHovered ? AppTheme.primaryColor : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isHovered ? AppTheme.primaryColor : Colors.grey.shade300),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 4, offset: const Offset(0, 2))],
            ),
            alignment: Alignment.center,
            child: Text(
              CurrencyFormatter.format(property.minPrice),
              style: TextStyle(
                color: isHovered ? Colors.white : AppTheme.ink,
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
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 4)],
            ),
            child: const Icon(Icons.landscape, color: Colors.white, size: 18),
          ),
        ),
      );
    }).toList();
  }

  Widget _buildMapView(PropertiesProvider provider) {
    final markers = _isHotelSearch
        ? _buildPropertyMarkers(provider.searchResults)
        : _buildAttractionMarkers(provider.attractionResults);

    final center = markers.isNotEmpty ? markers.first.point : const LatLng(-7.1619, -78.5128);

    return Stack(
      children: [
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
        if (markers.isEmpty && !provider.isLoading)
          const Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Card(
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Text('No hay resultados con ubicación para mostrar en el mapa'),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildResults(PropertiesProvider provider) {
    if (provider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (provider.error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 60, color: Colors.grey),
            const SizedBox(height: 16),
            Text(provider.error!),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _performSearch, child: const Text('Reintentar')),
          ],
        ),
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

    if (cards.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 60, color: Colors.grey),
            SizedBox(height: 16),
            Text('No se encontraron resultados'),
            SizedBox(height: 8),
            Text(
              'Intenta modificar tus criterios de búsqueda',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.68,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: cards.length,
      itemBuilder: (context, index) => cards[index],
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
