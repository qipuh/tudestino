import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/auth_provider.dart';
import '../../providers/properties_provider.dart';
import '../../providers/social_provider.dart';
import '../../models/property.dart';
import '../../models/social_post.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // Search state
  String? _selectedLocation;
  double? _selectedLat;
  double? _selectedLng;
  DateTime? _checkInDate;
  DateTime? _checkOutDate;
  int _adults = 2;
  int _children = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PropertiesProvider>(context, listen: false)
          .loadFeaturedProperties();
      Provider.of<SocialProvider>(context, listen: false)
          .loadFeed();
    });
  }

  Future<void> _startSearchFlow() async {
    // Step 1: Location Search
    final locationResult = await Navigator.of(context).pushNamed('/location-search');

    if (locationResult == null) return; // User cancelled

    final location = locationResult as Map<String, dynamic>;
    setState(() {
      _selectedLocation = location['name'] as String?;
      _selectedLat = location['lat'] as double?;
      _selectedLng = location['lng'] as double?;
    });

    // Step 2: Date Selection
    final dateResult = await Navigator.of(context).pushNamed(
      '/date-selector',
      arguments: {
        'checkIn': _checkInDate,
        'checkOut': _checkOutDate,
      },
    );

    if (dateResult == null) return; // User cancelled

    final dates = dateResult as Map<String, DateTime?>;
    setState(() {
      _checkInDate = dates['checkIn'];
      _checkOutDate = dates['checkOut'];
    });

    // Step 3: Guests Selection
    final guestsResult = await Navigator.of(context).pushNamed(
      '/guests-selector',
      arguments: {
        'adults': _adults,
        'children': _children,
      },
    );

    if (guestsResult == null) return; // User cancelled

    final guests = guestsResult as Map<String, int>;
    setState(() {
      _adults = guests['adults']!;
      _children = guests['children']!;
    });

    // Step 4: Navigate to Results
    Navigator.of(context).pushNamed(
      '/search-results',
      arguments: {
        'location': _selectedLocation,
        'lat': _selectedLat,
        'lng': _selectedLng,
        'checkIn': _checkInDate,
        'checkOut': _checkOutDate,
        'adults': _adults,
        'children': _children,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final propertiesProvider = Provider.of<PropertiesProvider>(context);
    final socialProvider = Provider.of<SocialProvider>(context);
    final theme = Theme.of(context);
    final screenHeight = MediaQuery.of(context).size.height;
    final headerHeight = screenHeight * 0.6;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Hero Header with Background Image
          SliverAppBar(
            expandedHeight: headerHeight,
            floating: false,
            pinned: true,
            backgroundColor: const Color(0xFF16BED8),
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Background Image
                  Image.asset(
                    'assets/images/bg.png',
                    fit: BoxFit.cover,
                  ),
                  // Gradient Overlay
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withOpacity(0.3),
                          Colors.black.withOpacity(0.5),
                          const Color(0xFF16BED8).withOpacity(0.7),
                          const Color(0xFF16BED8),
                        ],
                        stops: const [0.0, 0.3, 0.7, 1.0],
                      ),
                    ),
                  ),
                  // Content
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Top Bar
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Logo
                              Container(
                                height: 40,
                                width: 140,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.9),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                child: Image.asset(
                                  'assets/images/tudestino-logo.png',
                                  fit: BoxFit.contain,
                                ),
                              ),
                              // Auth Button
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: Colors.white.withOpacity(0.3)),
                                ),
                                child: authProvider.isAuthenticated
                                    ? IconButton(
                                        icon: const Icon(Icons.person, color: Colors.white),
                                        onPressed: () => Navigator.of(context).pushNamed('/profile'),
                                      )
                                    : TextButton(
                                        onPressed: () => Navigator.of(context).pushNamed('/login'),
                                        child: const Text(
                                          'Ingresar',
                                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                                        ),
                                      ),
                              ),
                            ],
                          ),

                          const Spacer(),

                          // Welcome Text
                          Text(
                            '¡Descubre tu próximo',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.w300,
                              shadows: [
                                Shadow(
                                  offset: const Offset(0, 2),
                                  blurRadius: 4,
                                  color: Colors.black.withOpacity(0.3),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            'destino!',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              shadows: [
                                Shadow(
                                  offset: const Offset(0, 2),
                                  blurRadius: 4,
                                  color: Colors.black.withOpacity(0.3),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 32),

                          // Search Bar with Transparency
                          GestureDetector(
                            onTap: _startSearchFlow,
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.95),
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 20,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF16BED8).withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Icon(
                                          Icons.search,
                                          color: Color(0xFF16BED8),
                                          size: 24,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      const Expanded(
                                        child: Text(
                                          '¿A dónde quieres ir?',
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.w600,
                                            color: Color(0xFF1a1a1a),
                                          ),
                                        ),
                                      ),
                                      Icon(
                                        Icons.arrow_forward_ios,
                                        size: 16,
                                        color: Colors.grey[400],
                                      ),
                                    ],
                                  ),

                                  if (_selectedLocation != null ||
                                      _checkInDate != null ||
                                      _adults != 2 ||
                                      _children != 0) ...[
                                    const SizedBox(height: 16),
                                    const Divider(),
                                    const SizedBox(height: 12),

                                    // Search Summary
                                    if (_selectedLocation != null)
                                      _buildSearchDetail(
                                        Icons.location_on,
                                        _selectedLocation!,
                                      ),
                                    if (_checkInDate != null && _checkOutDate != null)
                                      _buildSearchDetail(
                                        Icons.calendar_today,
                                        '${DateFormat('d MMM').format(_checkInDate!)} - ${DateFormat('d MMM').format(_checkOutDate!)}',
                                      ),
                                    _buildSearchDetail(
                                      Icons.people,
                                      '$_adults ${_adults == 1 ? "adulto" : "adultos"}${_children > 0 ? ", $_children ${_children == 1 ? "niño" : "niños"}" : ""}',
                                    ),
                                  ] else ...[
                                    const SizedBox(height: 12),
                                    Text(
                                      'Busca destinos increíbles para tus vacaciones',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),

                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Social Feed Section
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: theme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(Icons.photo_camera, color: theme.primaryColor, size: 20),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Experiencias',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pushNamed('/feed'),
                    child: Row(
                      children: [
                        Text('Ver todo', style: TextStyle(color: theme.primaryColor)),
                        Icon(Icons.arrow_forward_ios, size: 12, color: theme.primaryColor),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Horizontal Social Posts
          if (socialProvider.feedPosts.isNotEmpty)
            SliverToBoxAdapter(
              child: SizedBox(
                height: 260,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: socialProvider.feedPosts.take(5).length,
                  itemBuilder: (context, index) {
                    final post = socialProvider.feedPosts[index];
                    return _buildCompactSocialCard(context, post, theme);
                  },
                ),
              ),
            ),

          const SliverToBoxAdapter(child: SizedBox(height: 32)),

          // Properties Section Title
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: theme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.home_work, color: theme.primaryColor, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Propiedades destacadas',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Properties List
          if (propertiesProvider.isLoading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (propertiesProvider.error != null)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 60, color: Colors.grey),
                    const SizedBox(height: 16),
                    Text(
                      propertiesProvider.error!,
                      style: theme.textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        propertiesProvider.loadFeaturedProperties();
                      },
                      child: const Text('Reintentar'),
                    ),
                  ],
                ),
              ),
            )
          else if (propertiesProvider.properties.isEmpty)
            const SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.hotel_outlined, size: 60, color: Colors.grey),
                    SizedBox(height: 16),
                    Text('No hay propiedades disponibles'),
                  ],
                ),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final property = propertiesProvider.properties[index];
                  return PropertyCard(property: property);
                },
                childCount: propertiesProvider.properties.length,
              ),
            ),

          // Bottom Spacing
          const SliverToBoxAdapter(
            child: SizedBox(height: 80),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNavBar(context, authProvider),
    );
  }

  Widget _buildSearchDetail(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: const Color(0xFF16BED8)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactSocialCard(BuildContext context, SocialPost post, ThemeData theme) {
    return Container(
      width: 180,
      margin: const EdgeInsets.only(right: 16),
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed('/feed'),
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Post Image
            Container(
              height: 180,
              width: 180,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: post.mediaUrls.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: post.mediaUrls.first,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: Colors.grey.shade300,
                          child: const Center(child: CircularProgressIndicator()),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: Colors.grey.shade300,
                          child: const Icon(Icons.image_not_supported, size: 40),
                        ),
                      )
                    : Container(
                        color: Colors.grey.shade300,
                        child: const Icon(Icons.photo, size: 40),
                      ),
              ),
            ),
            const SizedBox(height: 12),
            // User Info
            Row(
              children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: theme.primaryColor.withOpacity(0.2),
                  child: Text(
                    post.user?.name.substring(0, 1).toUpperCase() ?? 'U',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    post.user?.name ?? 'Usuario',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            if (post.caption.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                post.caption,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNavBar(BuildContext context, AuthProvider authProvider) {
    return BottomNavigationBar(
      currentIndex: 0,
      type: BottomNavigationBarType.fixed,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Inicio',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.search),
          label: 'Buscar',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.chat_bubble_outline),
          label: 'Mensajes',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.video_library),
          label: 'Reels',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Perfil',
        ),
      ],
      onTap: (index) {
        switch (index) {
          case 0:
            // Ya estamos en home
            break;
          case 1:
            // Trigger new search flow
            _startSearchFlow();
            break;
          case 2:
            // Navigate to Messages
            Navigator.of(context).pushNamed('/messages');
            break;
          case 3:
            // Permitir acceso a Reels sin autenticación
            Navigator.of(context).pushNamed('/reels');
            break;
          case 4:
            // Profile requiere autenticación
            if (authProvider.isAuthenticated) {
              Navigator.of(context).pushNamed('/profile');
            } else {
              Navigator.of(context).pushNamed('/login');
            }
            break;
        }
      },
    );
  }

}

class PropertyCard extends StatelessWidget {
  final Property property;

  const PropertyCard({super.key, required this.property});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return Container(
      margin: const EdgeInsets.only(bottom: 20, left: 20, right: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          Navigator.of(context).pushNamed(
            '/property-detail',
            arguments: property.id,
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Property Image
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  child: SizedBox(
                    height: 220,
                    width: double.infinity,
                    child: property.rooms.isNotEmpty &&
                            property.rooms.first.images.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: property.rooms.first.images.first,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => Container(
                              color: Colors.grey.shade200,
                              child: const Center(
                                child: CircularProgressIndicator(),
                              ),
                            ),
                            errorWidget: (context, url, error) => Container(
                              color: Colors.grey.shade200,
                              child: const Icon(Icons.image_not_supported,
                                  size: 60, color: Colors.grey),
                            ),
                          )
                        : Container(
                            color: Colors.grey.shade200,
                            child: const Icon(Icons.hotel, size: 60, color: Colors.grey),
                          ),
                  ),
                ),
                // Badge
                if (property.ratingAverage >= 4.5)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: theme.primaryColor,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: theme.primaryColor.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.star, size: 14, color: Colors.white),
                          SizedBox(width: 4),
                          Text(
                            'Destacado',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),

            // Property Info
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    property.displayName,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),

                  // Location
                  Row(
                    children: [
                      Icon(Icons.location_on,
                          size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          '${property.addressCity}, ${property.addressCountry}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Rating and Price
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (property.ratingCount > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.amber.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star,
                                  size: 14, color: Colors.amber),
                              const SizedBox(width: 4),
                              Text(
                                '${property.ratingAverage.toStringAsFixed(1)} (${property.ratingCount})',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        Text(
                          'Sin reseñas',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[500],
                          ),
                        ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            currencyFormat.format(property.minPrice),
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: theme.primaryColor,
                            ),
                          ),
                          Text(
                            'por noche',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
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
}

