import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:ionicons/ionicons.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/url_helper.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/auth_provider.dart';
import '../../providers/properties_provider.dart';
import '../../providers/social_provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/notification_provider.dart';
import '../../models/property.dart';
import '../../models/business_result.dart';
import '../../models/attraction.dart';
import '../../models/tour.dart';
import '../../models/social_post.dart';
import '../../models/gps_route.dart';
import '../properties/property_grid_card.dart';
import '../properties/business_result_card.dart';
import '../properties/attraction_result_card.dart';

const _homeActivityIcons = {
  'trekking': Icons.hiking,
  'walking': Icons.directions_walk,
  'cycling': Icons.directions_bike,
  'running': Icons.directions_run,
  'mountaineering': Icons.terrain,
  'climbing': Icons.landscape,
  'kayaking': Icons.kayaking,
  'horseback': Icons.pets,
};

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // null = home completa (carruseles); si no, filtra todo a una sola
  // categoría en la misma pantalla, sin navegar a otra ventana.
  String? _selectedCategory;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final propertiesProvider =
          Provider.of<PropertiesProvider>(context, listen: false);
      propertiesProvider.loadFeaturedProperties();
      propertiesProvider.loadAttractions();
      propertiesProvider.loadTours();
      propertiesProvider.searchByCategory('restaurant');
      Provider.of<SocialProvider>(context, listen: false).loadFeed();
      Provider.of<RouteProvider>(context, listen: false)
          .loadFeed(refresh: true);
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.isAuthenticated) {
        Provider.of<NotificationProvider>(context, listen: false)
            .loadUnreadCount();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final propertiesProvider = Provider.of<PropertiesProvider>(context);
    final socialProvider = Provider.of<SocialProvider>(context);
    final routeProvider = Provider.of<RouteProvider>(context);
    final notificationProvider = Provider.of<NotificationProvider>(context);

    final firstName = authProvider.isAuthenticated
        ? (authProvider.user?.name.split(' ').first ?? 'viajero')
        : 'viajero';

    return Scaffold(
      backgroundColor: Colors.white,
      extendBody: true,
      drawer: _buildDrawer(context, authProvider),
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            // Top bar: hamburguesa | buscar + campana
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Row(
                  children: [
                    Builder(
                      builder: (ctx) => _CircleButton(
                        icon: Ionicons.menu_outline,
                        onTap: () => Scaffold.of(ctx).openDrawer(),
                      ),
                    ),
                    const Spacer(),
                    _CircleButton(
                      icon: Ionicons.search_outline,
                      onTap: () => Navigator.of(context).pushNamed('/search'),
                    ),
                    const SizedBox(width: 10),
                    _CircleButton(
                      icon: Ionicons.notifications_outline,
                      showDot: notificationProvider.unreadCount > 0,
                      onTap: () {
                        if (authProvider.isAuthenticated) {
                          Navigator.of(context).pushNamed('/notifications');
                        } else {
                          Navigator.of(context).pushNamed('/login');
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),

            // Saludo
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                child: Text(
                  'Hola, $firstName 👋',
                  style: GoogleFonts.bricolageGrotesque(
                    fontSize: 26,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.ink,
                  ),
                ),
              ),
            ),

            // Chips de categoría
            SliverToBoxAdapter(
              child: SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    _CategoryChip(
                      icon: Ionicons.apps_outline,
                      label: 'Todo',
                      active: _selectedCategory == 'all',
                      onTap: () => setState(() =>
                          _selectedCategory = _selectedCategory == 'all' ? null : 'all'),
                    ),
                    _CategoryChip(
                      icon: Ionicons.bed_outline,
                      label: 'Hoteles',
                      active: _selectedCategory == 'hotel',
                      onTap: () => setState(() =>
                          _selectedCategory = _selectedCategory == 'hotel' ? null : 'hotel'),
                    ),
                    _CategoryChip(
                      icon: Ionicons.restaurant_outline,
                      label: 'Restaurantes',
                      active: _selectedCategory == 'restaurant',
                      onTap: () => setState(() => _selectedCategory =
                          _selectedCategory == 'restaurant' ? null : 'restaurant'),
                    ),
                    _CategoryChip(
                      icon: Ionicons.compass_outline,
                      label: 'Tours',
                      active: _selectedCategory == 'tours',
                      onTap: () => setState(() =>
                          _selectedCategory = _selectedCategory == 'tours' ? null : 'tours'),
                    ),
                    _CategoryChip(
                      icon: Ionicons.trail_sign_outline,
                      label: 'Rutas',
                      onTap: () =>
                          Navigator.of(context).pushNamed('/routes-feed'),
                    ),
                    _CategoryChip(
                      icon: Ionicons.image_outline,
                      label: 'Atractivos',
                      active: _selectedCategory == 'attractions',
                      onTap: () => setState(() => _selectedCategory =
                          _selectedCategory == 'attractions' ? null : 'attractions'),
                    ),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 20)),

            if (_selectedCategory != null)
              ..._buildFilteredSlivers(context, propertiesProvider)
            else ...[
              // Hoteles destacados: carrusel horizontal, 2 tarjetas por vista
              // (antes eran cards grandes verticales, una por fila)
              if (propertiesProvider.isLoading &&
                  propertiesProvider.properties.isEmpty)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(48),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                )
              else if (propertiesProvider.properties.isNotEmpty) ...[
                _sectionHeader('Hoteles destacados', Ionicons.bed_outline),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 210,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: propertiesProvider.properties.take(8).length,
                      itemBuilder: (context, index) {
                        final property = propertiesProvider.properties[index];
                        return _buildPropertyCompactCard(context, property);
                      },
                    ),
                  ),
                ),
              ],

              // Restaurantes cerca de ti
              if (propertiesProvider.businessResults.isNotEmpty) ...[
                _sectionHeader('Restaurantes cerca de ti', Ionicons.restaurant_outline),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 190,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: propertiesProvider.businessResults.take(8).length,
                      itemBuilder: (context, index) {
                        final business = propertiesProvider.businessResults[index];
                        return _buildRestaurantCompactCard(context, business);
                      },
                    ),
                  ),
                ),
              ],

              // Tours: carrusel horizontal, 2 tarjetas por vista
              if (propertiesProvider.tours.isNotEmpty) ...[
                _sectionHeader('Tours y excursiones', Ionicons.compass_outline),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 210,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: propertiesProvider.tours.length,
                      itemBuilder: (context, index) {
                        final tour = propertiesProvider.tours[index];
                        return _buildTourCard(context, tour);
                      },
                    ),
                  ),
                ),
              ],

              // Atractivos turísticos: carrusel horizontal, 2 tarjetas por vista
              // (antes eran cards grandes verticales, una por fila)
              if (propertiesProvider.attractions.isNotEmpty) ...[
                _sectionHeader('Atractivos turísticos', Ionicons.image_outline),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 190,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: propertiesProvider.attractions.take(8).length,
                      itemBuilder: (context, index) {
                        final attraction = propertiesProvider.attractions[index];
                        return _buildAttractionCompactCard(context, attraction);
                      },
                    ),
                  ),
                ),
              ],

              // Rutas de la comunidad
              if (routeProvider.feedRoutes.isNotEmpty) ...[
                _sectionHeader('Rutas de la comunidad', Ionicons.trail_sign_outline),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 190,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: routeProvider.feedRoutes.length,
                      itemBuilder: (context, index) {
                        final route = routeProvider.feedRoutes[index];
                        return _buildRouteCard(context, route);
                      },
                    ),
                  ),
                ),
              ],

              // Experiencias de viajeros
              if (socialProvider.feedPosts.isNotEmpty) ...[
                _sectionHeader('Experiencias de viajeros', Ionicons.people_outline),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 200,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: socialProvider.feedPosts.take(5).length,
                      itemBuilder: (context, index) {
                        final post = socialProvider.feedPosts[index];
                        return _buildExperienceCard(context, post);
                      },
                    ),
                  ),
                ),
              ],
            ],

            // Aire para el nav flotante
            const SliverToBoxAdapter(child: SizedBox(height: 110)),
          ],
        ),
      ),
      bottomNavigationBar: _buildFloatingNavBar(context, authProvider),
    );
  }

  // ==================== FILTRO INLINE POR CATEGORÍA ====================
  //
  // Al tocar un chip de categoría (Hoteles/Restaurantes/Tours/Atractivos/
  // Todo) el filtro se aplica en la misma pantalla, sin navegar a otra
  // ventana - reusa los datos que ya se cargaron en initState.

  static const _filteredCategoryTitles = {
    'all': 'Todo',
    'hotel': 'Hoteles',
    'restaurant': 'Restaurantes',
    'tours': 'Tours y excursiones',
    'attractions': 'Atractivos turísticos',
  };

  static const _filteredCategoryIcons = {
    'all': Ionicons.apps_outline,
    'hotel': Ionicons.bed_outline,
    'restaurant': Ionicons.restaurant_outline,
    'tours': Ionicons.compass_outline,
    'attractions': Ionicons.image_outline,
  };

  List<Widget> _buildFilteredSlivers(
      BuildContext context, PropertiesProvider propertiesProvider) {
    final category = _selectedCategory!;

    List<Widget> cards;
    switch (category) {
      case 'hotel':
        cards = propertiesProvider.properties
            .map((p) => PropertyGridCard(property: p))
            .toList();
        break;
      case 'restaurant':
        cards = propertiesProvider.businessResults
            .map((b) => BusinessResultCard(business: b))
            .toList();
        break;
      case 'tours':
        cards = propertiesProvider.tours
            .map((t) => _buildTourGridCard(context, t))
            .toList();
        break;
      case 'attractions':
        cards = propertiesProvider.attractions
            .map((a) => AttractionResultCard(attraction: a))
            .toList();
        break;
      case 'all':
      default:
        cards = [
          ...propertiesProvider.properties.map((p) => PropertyGridCard(property: p)),
          ...propertiesProvider.businessResults.map((b) => BusinessResultCard(business: b)),
          ...propertiesProvider.tours.map((t) => _buildTourGridCard(context, t)),
          ...propertiesProvider.attractions.map((a) => AttractionResultCard(attraction: a)),
        ];
    }

    return [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(_filteredCategoryIcons[category] ?? Ionicons.apps_outline,
                      size: 20, color: AppTheme.primaryColor),
                  const SizedBox(width: 8),
                  Text(
                    _filteredCategoryTitles[category] ?? '',
                    style: GoogleFonts.bricolageGrotesque(
                      fontSize: 19,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => setState(() => _selectedCategory = null),
                child: Container(
                  padding: const EdgeInsets.all(7),
                  decoration: const BoxDecoration(
                    color: AppTheme.sand,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Ionicons.close, size: 16, color: AppTheme.ink),
                ),
              ),
            ],
          ),
        ),
      ),
      if (propertiesProvider.isLoading && cards.isEmpty)
        const SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.all(48),
            child: Center(child: CircularProgressIndicator()),
          ),
        )
      else if (cards.isEmpty)
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 48),
            child: Center(
              child: Column(
                children: [
                  const Icon(Ionicons.search_outline, size: 48, color: AppTheme.mute),
                  const SizedBox(height: 12),
                  Text('Sin resultados en esta categoría',
                      style: GoogleFonts.inter(color: AppTheme.mute)),
                ],
              ),
            ),
          ),
        )
      else
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
              (context, index) => cards[index],
              childCount: cards.length,
            ),
          ),
        ),
    ];
  }

  Widget _buildTourGridCard(BuildContext context, Tour tour) {
    final imageUrl = tour.coverImage != null
        ? UrlHelper.getFullImageUrl(tour.coverImage!, folder: 'tours')
        : tour.business?.logo != null
            ? UrlHelper.getFullImageUrl(tour.business!.logo!, folder: 'business')
            : null;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed('/tour-detail', arguments: tour.id),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3,
              child: imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorWidget: (_, __, ___) => Container(
                        color: AppTheme.sand,
                        child: const Icon(Ionicons.compass_outline, color: AppTheme.mute),
                      ),
                    )
                  : Container(
                      color: AppTheme.sand,
                      width: double.infinity,
                      child: const Icon(Ionicons.compass_outline, color: AppTheme.mute),
                    ),
            ),
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      tour.name,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Ionicons.location_outline, size: 13, color: AppTheme.mute),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            tour.mainDestination,
                            style: GoogleFonts.inter(fontSize: 12, color: AppTheme.mute),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Text(
                      tour.formattedPrice,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
        child: Row(
          children: [
            Icon(icon, size: 20, color: AppTheme.primaryColor),
            const SizedBox(width: 8),
            Text(
              title,
              style: GoogleFonts.bricolageGrotesque(
                fontSize: 19,
                fontWeight: FontWeight.w600,
                color: AppTheme.primaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==================== CARDS COMPACTAS (2 por vista) ====================

  double _compactCardWidth(BuildContext context) =>
      (MediaQuery.of(context).size.width - 16 * 2 - 12) / 2;

  Widget _buildPropertyCompactCard(BuildContext context, Property property) {
    final imageUrl = property.rooms.isNotEmpty &&
            property.rooms.first.images.isNotEmpty
        ? property.rooms.first.images.first
        : null;

    return GestureDetector(
      onTap: () => Navigator.of(context).pushNamed(
        '/property-detail',
        arguments: {'propertyId': property.id},
      ),
      child: Container(
        width: _compactCardWidth(context),
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppTheme.line),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 110,
              width: double.infinity,
              child: imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        color: AppTheme.sand,
                        child:
                            const Icon(Ionicons.bed_outline, color: AppTheme.mute),
                      ),
                    )
                  : Container(
                      color: AppTheme.sand,
                      child:
                          const Icon(Ionicons.bed_outline, color: AppTheme.mute),
                    ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      property.displayName,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      property.addressCity,
                      style: GoogleFonts.inter(fontSize: 11, color: AppTheme.mute),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (property.minPrice > 0) ...[
                      const SizedBox(height: 4),
                      Text(
                        '${CurrencyFormatter.format(property.minPrice)}/noche',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRestaurantCompactCard(BuildContext context, BusinessResult business) {
    return GestureDetector(
      onTap: () => Navigator.of(context)
          .pushNamed('/business-detail', arguments: business.id),
      child: Container(
        width: _compactCardWidth(context),
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppTheme.line),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 110,
              width: double.infinity,
              child: business.imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: business.imageUrl!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        color: AppTheme.sand,
                        child: const Icon(Ionicons.restaurant_outline,
                            color: AppTheme.mute),
                      ),
                    )
                  : Container(
                      color: AppTheme.sand,
                      child: const Icon(Ionicons.restaurant_outline,
                          color: AppTheme.mute),
                    ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      business.name,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (business.city != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        business.city!,
                        style: GoogleFonts.inter(fontSize: 11, color: AppTheme.mute),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    if (business.rating > 0) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Ionicons.star, size: 13, color: AppTheme.accentColor),
                          const SizedBox(width: 3),
                          Text(
                            business.rating.toStringAsFixed(1),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.ink,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAttractionCompactCard(BuildContext context, Attraction attraction) {
    final imageUrl = attraction.coverImage != null
        ? UrlHelper.getFullImageUrl(attraction.coverImage, folder: 'attractions')
        : null;
    final location = [attraction.city, attraction.region]
        .where((s) => s != null && s.isNotEmpty)
        .join(', ');

    return GestureDetector(
      onTap: () => Navigator.of(context)
          .pushNamed('/attraction-detail', arguments: attraction.id),
      child: Container(
        width: _compactCardWidth(context),
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppTheme.line),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 110,
              width: double.infinity,
              child: imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        color: AppTheme.sand,
                        child: const Icon(Ionicons.image_outline,
                            color: AppTheme.mute),
                      ),
                    )
                  : Container(
                      color: AppTheme.sand,
                      child: const Icon(Ionicons.image_outline,
                          color: AppTheme.mute),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    attraction.title,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.ink,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  if (location.isNotEmpty)
                    Text(
                      location,
                      style:
                          GoogleFonts.inter(fontSize: 12, color: AppTheme.mute),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRouteCard(BuildContext context, GpsRoute route) {
    return GestureDetector(
      onTap: () => Navigator.of(context)
          .pushNamed('/route-detail', arguments: {'routeId': route.id}),
      child: Container(
        width: 200,
        margin: const EdgeInsets.only(right: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppTheme.line),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 100,
              width: double.infinity,
              child: route.coverImage != null
                  ? CachedNetworkImage(
                      imageUrl: route.coverImage!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        color: AppTheme.sand,
                        child: Icon(
                            _homeActivityIcons[route.activityType] ??
                                Icons.route_outlined,
                            color: AppTheme.mute),
                      ),
                    )
                  : Container(
                      color: AppTheme.sand,
                      child: Icon(
                          _homeActivityIcons[route.activityType] ??
                              Icons.route_outlined,
                          color: AppTheme.mute),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    route.title,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.ink,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (route.distanceKm != null)
                        Text('${route.distanceKm!.toStringAsFixed(1)} km',
                            style: GoogleFonts.inter(
                                fontSize: 11, color: AppTheme.mute)),
                      const Spacer(),
                      Icon(Icons.favorite, size: 12, color: Colors.red.shade300),
                      const SizedBox(width: 2),
                      Text('${route.likesCount}',
                          style: GoogleFonts.inter(
                              fontSize: 11, color: AppTheme.mute)),
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

  Widget _buildTourCard(BuildContext context, Tour tour) {
    final imageUrl = tour.coverImage != null
        ? UrlHelper.getFullImageUrl(tour.coverImage!, folder: 'tours')
        : tour.business?.logo != null
            ? UrlHelper.getFullImageUrl(tour.business!.logo!,
                folder: 'business')
            : null;

    return GestureDetector(
      onTap: () => Navigator.of(context).pushNamed('/tour-detail', arguments: tour.id),
      child: Container(
      width: _compactCardWidth(context),
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppTheme.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 110,
            width: double.infinity,
            child: imageUrl != null
                ? CachedNetworkImage(
                    imageUrl: imageUrl,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(
                      color: AppTheme.sand,
                      child: const Icon(Icons.tour_outlined,
                          color: AppTheme.mute),
                    ),
                  )
                : Container(
                    color: AppTheme.sand,
                    child: const Icon(Icons.tour_outlined,
                        color: AppTheme.mute),
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tour.name,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.ink,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Text(
                  tour.mainDestination,
                  style: GoogleFonts.inter(
                      fontSize: 12, color: AppTheme.mute),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Text(
                  tour.formattedPrice,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      ),
    );
  }

  Widget _buildExperienceCard(BuildContext context, SocialPost post) {
    return GestureDetector(
      // Ver el feed es público; login solo hace falta para publicar/comentar/dar me gusta.
      onTap: () => Navigator.of(context).pushNamed('/feed'),
      child: Container(
        width: 160,
        margin: const EdgeInsets.only(right: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(22),
          color: AppTheme.sand,
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (post.mediaUrls.isNotEmpty)
              CachedNetworkImage(
                imageUrl: post.mediaUrls.first,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => const Center(
                  child: Icon(Icons.image_outlined,
                      size: 28, color: AppTheme.mute),
                ),
              )
            else
              const Center(
                child: Icon(Icons.image_outlined,
                    size: 28, color: AppTheme.mute),
              ),
            // Scrim inferior para legibilidad del texto sobre foto
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.fromLTRB(10, 24, 10, 10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withValues(alpha: 0.55),
                    ],
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      post.authorName,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.favorite,
                            size: 12, color: Colors.white),
                        const SizedBox(width: 3),
                        Text(
                          '${post.likesCount}',
                          style: GoogleFonts.inter(
                              fontSize: 11, color: Colors.white),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==================== NAV FLOTANTE (estilo referencia) ====================

  Widget _buildFloatingNavBar(
      BuildContext context, AuthProvider authProvider) {
    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Container(
        height: 68,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(34),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _NavItem(
              icon: Ionicons.home,
              label: 'Inicio',
              active: true,
              onTap: () {},
            ),
            _NavItem(
              icon: Ionicons.bed_outline,
              label: 'Reserva',
              onTap: () => Navigator.of(context).pushNamed('/search-results',
                  arguments: {'category': 'hotel'}),
            ),
            // Rutas destacado al centro
            GestureDetector(
              onTap: () =>
                  Navigator.of(context).pushNamed('/routes-feed'),
              child: Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(
                  color: AppTheme.primaryColor,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Ionicons.trail_sign_outline,
                    color: Colors.white, size: 24),
              ),
            ),
            _NavItem(
              icon: Ionicons.compass_outline,
              label: 'Descubre',
              onTap: () => Navigator.of(context).pushNamed('/search-results',
                  arguments: {'category': 'attractions'}),
            ),
            _NavItem(
              icon: Ionicons.play_circle_outline,
              label: 'Reels',
              // Ver reels es público; login solo hace falta para publicar/comentar/dar me gusta.
              onTap: () => Navigator.of(context).pushNamed('/reels'),
            ),
          ],
        ),
      ),
    );
  }

  // ==================== DRAWER ====================

  Widget _buildDrawer(BuildContext context, AuthProvider authProvider) {
    final user = authProvider.user;

    void goto(String route, [Object? arguments]) {
      Navigator.of(context).pop();
      Navigator.of(context).pushNamed(route, arguments: arguments);
    }

    void gotoAuthed(String route) {
      Navigator.of(context).pop();
      Navigator.of(context)
          .pushNamed(authProvider.isAuthenticated ? route : '/login');
    }

    // Navegación general - visible para cualquiera, con o sin sesión.
    final navItems = <_DrawerMenuItem>[
      _DrawerMenuItem(Ionicons.home_outline, 'Inicio',
          () => Navigator.of(context).pop()),
      _DrawerMenuItem(Ionicons.bed_outline, 'Hoteles',
          () => goto('/search', {'category': 'hotel'})),
      _DrawerMenuItem(Ionicons.restaurant_outline, 'Restaurantes',
          () => goto('/search', {'category': 'restaurant'})),
      _DrawerMenuItem(Ionicons.compass_outline, 'Tours',
          () => goto('/search', {'category': 'tours'})),
      _DrawerMenuItem(Ionicons.image_outline, 'Atractivos',
          () => goto('/search', {'category': 'attractions'})),
      _DrawerMenuItem(
          Ionicons.trail_sign_outline, 'Rutas', () => goto('/routes-feed')),
      _DrawerMenuItem(
          Ionicons.play_circle_outline, 'Reels', () => goto('/reels')),
    ];

    // Sección de cuenta - requiere sesión, separada visualmente de la
    // navegación general.
    final accountItems = <_DrawerMenuItem>[
      _DrawerMenuItem(
          Ionicons.person_outline, 'Perfil', () => gotoAuthed('/profile')),
      _DrawerMenuItem(Ionicons.heart_outline, 'Favoritos',
          () => gotoAuthed('/favorites')),
      _DrawerMenuItem(Ionicons.receipt_outline, 'Mis reservas',
          () => gotoAuthed('/bookings')),
      _DrawerMenuItem(Ionicons.chatbubble_outline, 'Mensajes',
          () => gotoAuthed('/messages')),
      _DrawerMenuItem(Ionicons.notifications_outline, 'Notificaciones',
          () => gotoAuthed('/notifications')),
    ];

    Widget buildGrid(List<_DrawerMenuItem> items) {
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          mainAxisSpacing: 16,
          crossAxisSpacing: 8,
          childAspectRatio: 0.85,
        ),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return GestureDetector(
            onTap: item.onTap,
            behavior: HitTestBehavior.opaque,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: const BoxDecoration(
                    color: AppTheme.sand,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(item.icon,
                      color: AppTheme.primaryColor, size: 22),
                ),
                const SizedBox(height: 8),
                Text(
                  item.label,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.ink,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        },
      );
    }

    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
              child: SvgPicture.asset(
                'assets/images/logo.svg',
                height: 64,
                alignment: Alignment.center,
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: AppTheme.sand,
                    backgroundImage: user?.profilePicture != null
                        ? NetworkImage(user!.profilePicture!)
                        : null,
                    child: user?.profilePicture == null
                        ? const Icon(Ionicons.person_outline,
                            color: AppTheme.mute)
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      authProvider.isAuthenticated
                          ? (user?.name ?? 'Usuario')
                          : 'Invitado',
                      style: GoogleFonts.bricolageGrotesque(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(top: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    buildGrid(navItems),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Divider(height: 1),
                    ),
                    buildGrid(accountItems),
                    if (!authProvider.isAuthenticated) ...[
                      const SizedBox(height: 24),
                      Padding(
                        padding:
                            const EdgeInsets.symmetric(horizontal: 20),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => goto('/login'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                  vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(100),
                              ),
                            ),
                            child: const Text('Iniciar sesión'),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
            if (authProvider.isAuthenticated) ...[
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Ionicons.log_out_outline,
                    color: AppTheme.ink),
                title: Text('Cerrar sesión',
                    style: GoogleFonts.inter(
                        fontWeight: FontWeight.w400, color: AppTheme.ink)),
                onTap: () async {
                  Navigator.of(context).pop();
                  await authProvider.logout();
                },
              ),
              const SizedBox(height: 8),
            ],
          ],
        ),
      ),
    );
  }
}

class _DrawerMenuItem {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  _DrawerMenuItem(this.icon, this.label, this.onTap);
}

// ==================== WIDGETS DE APOYO ====================

/// Botón circular blanco con sombra suave (top bar, estilo referencia)
class _CircleButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool showDot;

  const _CircleButton(
      {required this.icon, required this.onTap, this.showDot = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Icon(icon, size: 21, color: AppTheme.ink),
            if (showDot)
              Positioned(
                top: 11,
                right: 11,
                child: Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryColor,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Chip de categoría: píldora blanca con ícono circular + etiqueta
class _CategoryChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.icon,
    required this.label,
    this.active = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.fromLTRB(6, 6, 16, 6),
        decoration: BoxDecoration(
          color: active ? AppTheme.primaryColor : Colors.white,
          borderRadius: BorderRadius.circular(26),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: active ? Colors.white : AppTheme.sand,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 18, color: AppTheme.primaryColor),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: active ? Colors.white : AppTheme.ink,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Ítem del nav flotante
class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    this.active = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? AppTheme.primaryColor : AppTheme.mute;
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 22, color: color),
          const SizedBox(height: 3),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: active ? FontWeight.w600 : FontWeight.w400,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
