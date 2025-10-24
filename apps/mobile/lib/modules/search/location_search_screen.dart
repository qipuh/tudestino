import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';

class LocationSearchScreen extends StatefulWidget {
  const LocationSearchScreen({super.key});

  @override
  State<LocationSearchScreen> createState() => _LocationSearchScreenState();
}

class _LocationSearchScreenState extends State<LocationSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Map<String, dynamic>> _suggestions = [];
  bool _isLoading = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _searchLocation(String query) async {
    if (query.isEmpty) {
      setState(() {
        _suggestions = [];
      });
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Buscar ubicaciones usando geocoding
      final locations = await locationFromAddress(query);

      if (locations.isNotEmpty) {
        final placemarks = await placemarkFromCoordinates(
          locations.first.latitude,
          locations.first.longitude,
        );

        if (placemarks.isNotEmpty) {
          setState(() {
            _suggestions = [
              {
                'name': query,
                'description': '${placemarks.first.locality}, ${placemarks.first.country}',
                'lat': locations.first.latitude,
                'lng': locations.first.longitude,
              }
            ];
          });
        }
      }
    } catch (e) {
      print('Error searching location: $e');
      // Agregar sugerencias predefinidas como fallback
      setState(() {
        _suggestions = _getDefaultSuggestions(query);
      });
    }

    setState(() {
      _isLoading = false;
    });
  }

  List<Map<String, dynamic>> _getDefaultSuggestions(String query) {
    final defaultPlaces = [
      {'name': 'Cajamarca, Perú', 'lat': -7.163, 'lng': -78.5008},
      {'name': 'Lima, Perú', 'lat': -12.0464, 'lng': -77.0428},
      {'name': 'Cusco, Perú', 'lat': -13.5319, 'lng': -71.9675},
      {'name': 'Arequipa, Perú', 'lat': -16.4090, 'lng': -71.5375},
      {'name': 'Trujillo, Perú', 'lat': -8.1116, 'lng': -79.0288},
    ];

    return defaultPlaces
        .where((place) => (place['name'] as String).toLowerCase().contains(query.toLowerCase()))
        .map((place) => {
              'name': place['name'],
              'description': 'Perú',
              'lat': place['lat'],
              'lng': place['lng'],
            })
        .toList();
  }

  void _selectLocation(Map<String, dynamic> location) {
    Navigator.pop(context, location);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('¿A dónde quieres ir?'),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.shade200,
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextField(
              controller: _searchController,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'Buscar destino...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _suggestions = [];
                          });
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.grey.shade100,
              ),
              onChanged: (value) {
                _searchLocation(value);
              },
              onSubmitted: (value) {
                _searchLocation(value);
              },
            ),
          ),

          // Suggestions List
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(32),
              child: CircularProgressIndicator(),
            )
          else if (_suggestions.isEmpty && _searchController.text.isEmpty)
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  const Padding(
                    padding: EdgeInsets.only(bottom: 16),
                    child: Text(
                      'Destinos populares',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  ..._getDefaultSuggestions('').map((location) =>
                      _buildLocationTile(location)),
                ],
              ),
            )
          else if (_suggestions.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.search_off, size: 64, color: Colors.grey.shade400),
                    const SizedBox(height: 16),
                    Text(
                      'No se encontraron resultados',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                itemCount: _suggestions.length,
                itemBuilder: (context, index) {
                  return _buildLocationTile(_suggestions[index]);
                },
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildLocationTile(Map<String, dynamic> location) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Theme.of(context).primaryColor.withAlpha(25),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          Icons.location_on,
          color: Theme.of(context).primaryColor,
        ),
      ),
      title: Text(
        location['name'] ?? '',
        style: const TextStyle(fontWeight: FontWeight.w500),
      ),
      subtitle: location['description'] != null
          ? Text(location['description'])
          : null,
      onTap: () => _selectLocation(location),
    );
  }
}
