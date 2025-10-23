import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/properties_provider.dart';
import '../home/home_screen.dart';

class SearchScreen extends StatefulWidget {
  final Map<String, dynamic>? initialLocation;

  const SearchScreen({super.key, this.initialLocation});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _locationController = TextEditingController();
  DateTime? _checkIn;
  DateTime? _checkOut;
  int _adults = 2;
  int _children = 0;
  double _minPrice = 0;
  double _maxPrice = 1000;
  String? _propertyType;
  bool _showFilters = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialLocation != null &&
        widget.initialLocation!['location'] != null) {
      _locationController.text = widget.initialLocation!['location'];
      _performSearch();
    }
  }

  @override
  void dispose() {
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _performSearch() async {
    final propertiesProvider =
        Provider.of<PropertiesProvider>(context, listen: false);

    await propertiesProvider.searchProperties(
      location: _locationController.text.trim().isNotEmpty
          ? _locationController.text.trim()
          : null,
      checkIn: _checkIn,
      checkOut: _checkOut,
      adults: _adults,
      children: _children,
      minPrice: _minPrice > 0 ? _minPrice : null,
      maxPrice: _maxPrice < 1000 ? _maxPrice : null,
      propertyType: _propertyType,
    );
  }

  Future<void> _selectDate(BuildContext context, bool isCheckIn) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isCheckIn
          ? (_checkIn ?? DateTime.now())
          : (_checkOut ?? DateTime.now().add(const Duration(days: 1))),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      locale: const Locale('es', 'ES'),
    );

    if (picked != null) {
      setState(() {
        if (isCheckIn) {
          _checkIn = picked;
          // Si check-out es antes del nuevo check-in, ajustarlo
          if (_checkOut != null && _checkOut!.isBefore(picked)) {
            _checkOut = picked.add(const Duration(days: 1));
          }
        } else {
          _checkOut = picked;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final propertiesProvider = Provider.of<PropertiesProvider>(context);
    final theme = Theme.of(context);
    final dateFormat = DateFormat('dd MMM', 'es');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Buscar Alojamiento'),
        actions: [
          IconButton(
            icon: Icon(_showFilters ? Icons.filter_alt : Icons.filter_alt_outlined),
            onPressed: () {
              setState(() {
                _showFilters = !_showFilters;
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey.shade50,
            child: Column(
              children: [
                // Location
                TextField(
                  controller: _locationController,
                  decoration: InputDecoration(
                    hintText: 'Destino',
                    prefixIcon: const Icon(Icons.location_on),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                ),
                const SizedBox(height: 12),

                // Dates
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => _selectDate(context, true),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: Colors.grey.shade300),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.calendar_today, size: 20),
                              const SizedBox(width: 8),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Entrada',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                  Text(
                                    _checkIn != null
                                        ? dateFormat.format(_checkIn!)
                                        : 'Fecha',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: InkWell(
                        onTap: () => _selectDate(context, false),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: Colors.grey.shade300),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.calendar_today, size: 20),
                              const SizedBox(width: 8),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Salida',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                  Text(
                                    _checkOut != null
                                        ? dateFormat.format(_checkOut!)
                                        : 'Fecha',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Guests
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.people),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '$_adults ${_adults == 1 ? "adulto" : "adultos"}${_children > 0 ? ", $_children ${_children == 1 ? "niño" : "niños"}" : ""}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit, size: 20),
                        onPressed: () => _showGuestsDialog(context),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Search Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: propertiesProvider.isLoading
                        ? null
                        : _performSearch,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: propertiesProvider.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Buscar'),
                  ),
                ),
              ],
            ),
          ),

          // Filters (expandible)
          if (_showFilters)
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.blue.shade50,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Filtros adicionales',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Price Range
                  Text('Rango de precio: \$${_minPrice.toInt()} - \$${_maxPrice.toInt()}'),
                  RangeSlider(
                    values: RangeValues(_minPrice, _maxPrice),
                    min: 0,
                    max: 1000,
                    divisions: 20,
                    onChanged: (values) {
                      setState(() {
                        _minPrice = values.start;
                        _maxPrice = values.end;
                      });
                    },
                  ),

                  // Property Type
                  DropdownButtonFormField<String>(
                    value: _propertyType,
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
                    onChanged: (value) {
                      setState(() {
                        _propertyType = value;
                      });
                    },
                  ),
                ],
              ),
            ),

          // Results
          Expanded(
            child: propertiesProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : propertiesProvider.error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline,
                                size: 60, color: Colors.grey),
                            const SizedBox(height: 16),
                            Text(propertiesProvider.error!),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _performSearch,
                              child: const Text('Reintentar'),
                            ),
                          ],
                        ),
                      )
                    : propertiesProvider.searchResults.isEmpty
                        ? const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.search_off,
                                    size: 60, color: Colors.grey),
                                SizedBox(height: 16),
                                Text('No se encontraron resultados'),
                                SizedBox(height: 8),
                                Text(
                                  'Intenta modificar tus criterios de búsqueda',
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: propertiesProvider.searchResults.length,
                            itemBuilder: (context, index) {
                              return PropertyCard(
                                property:
                                    propertiesProvider.searchResults[index],
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }

  Future<void> _showGuestsDialog(BuildContext context) async {
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Huéspedes'),
        content: StatefulBuilder(
          builder: (context, setStateDialog) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildGuestCounter(
                  'Adultos',
                  _adults,
                  (value) => setStateDialog(() => _adults = value),
                ),
                const SizedBox(height: 16),
                _buildGuestCounter(
                  'Niños',
                  _children,
                  (value) => setStateDialog(() => _children = value),
                ),
              ],
            );
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {}); // Update parent state
              Navigator.pop(context);
            },
            child: const Text('Aplicar'),
          ),
        ],
      ),
    );
  }

  Widget _buildGuestCounter(
    String label,
    int value,
    Function(int) onChanged,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 16)),
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.remove_circle_outline),
              onPressed: value > 0 ? () => onChanged(value - 1) : null,
            ),
            SizedBox(
              width: 40,
              child: Text(
                '$value',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.add_circle_outline),
              onPressed: value < 10 ? () => onChanged(value + 1) : null,
            ),
          ],
        ),
      ],
    );
  }
}

