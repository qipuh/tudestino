import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/properties_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/favorites_provider.dart';
import '../../core/config/app_config.dart';
import '../../models/room.dart';
import '../../models/property.dart';

class PropertyDetailScreen extends StatefulWidget {
  final String propertyId;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final int? adults;
  final int? children;

  const PropertyDetailScreen({
    super.key,
    required this.propertyId,
    this.checkIn,
    this.checkOut,
    this.adults,
    this.children,
  });

  @override
  State<PropertyDetailScreen> createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen> {
  DateTime? _checkIn;
  DateTime? _checkOut;
  int _adults = 2;
  int _children = 0;
  Room? _selectedRoom;
  int _currentImageIndex = 0;

  @override
  void initState() {
    super.initState();
    // Usar datos de búsqueda si existen
    _checkIn = widget.checkIn;
    _checkOut = widget.checkOut;
    _adults = widget.adults ?? 2;
    _children = widget.children ?? 0;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PropertiesProvider>(context, listen: false)
          .loadPropertyDetail(widget.propertyId);
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.isAuthenticated) {
        Provider.of<FavoritesProvider>(context, listen: false)
            .checkStatus(widget.propertyId);
      }
    });
  }

  void _shareProperty(Property property) {
    final url = '${AppConfig.webUrl}/properties/${property.id}';
    Share.share(
      '${property.displayName} en TuDestino\n$url',
      subject: property.displayName,
    );
  }

  Future<void> _openDateSelector() async {
    final result = await Navigator.of(context).pushNamed(
      '/date-selector',
      arguments: {
        'checkIn': _checkIn,
        'checkOut': _checkOut,
      },
    );

    if (result != null && result is Map<String, DateTime?>) {
      setState(() {
        _checkIn = result['checkIn'];
        _checkOut = result['checkOut'];
      });
    }
  }

  Future<void> _openGuestsSelector() async {
    final result = await Navigator.of(context).pushNamed(
      '/guests-selector',
      arguments: {
        'adults': _adults,
        'children': _children,
      },
    );

    if (result != null && result is Map<String, int>) {
      setState(() {
        _adults = result['adults']!;
        _children = result['children']!;
      });
    }
  }

  void _proceedToCheckout() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (!authProvider.isAuthenticated) {
      Navigator.of(context).pushNamed('/login');
      return;
    }

    if (_checkIn == null || _checkOut == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Selecciona las fechas de entrada y salida'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (_selectedRoom == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Selecciona una habitación'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Navegar al checkout
    Navigator.of(context).pushNamed('/checkout', arguments: {
      'propertyId': widget.propertyId,
      'roomId': _selectedRoom!.id,
      'checkIn': _checkIn,
      'checkOut': _checkOut,
      'adults': _adults,
      'children': _children,
    });
  }

  @override
  Widget build(BuildContext context) {
    final propertiesProvider = Provider.of<PropertiesProvider>(context);
    final property = propertiesProvider.selectedProperty;
    final theme = Theme.of(context);

    if (propertiesProvider.isLoading || property == null) {
      return Scaffold(
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // Modern image gallery header
          _buildImageGallery(property, theme),

          // Content
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header con título y rating
                _buildHeader(property, theme),

                const Divider(height: 32),

                // Host profile
                _buildHostSection(property, theme),

                const Divider(height: 32),

                // Descripción
                _buildDescription(property, theme),

                const Divider(height: 32),

                // Amenidades
                if (property.propertyAmenities.isNotEmpty)
                  _buildAmenities(property, theme),

                if (property.propertyAmenities.isNotEmpty)
                  const Divider(height: 32),

                // Check-in/out times
                _buildCheckInOut(property, theme),

                const Divider(height: 32),

                // Booking card
                _buildBookingSection(property, theme),

                const SizedBox(height: 120),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(property, theme),
    );
  }

  Widget _buildImageGallery(Property property, ThemeData theme) {
    final images = property.rooms.isNotEmpty && property.rooms.first.images.isNotEmpty
        ? property.rooms.first.images
        : <String>[];

    return SliverAppBar(
      expandedHeight: 350,
      pinned: true,
      elevation: 0,
      backgroundColor: Colors.white,
      iconTheme: const IconThemeData(color: Colors.white),
      actions: [
        Consumer<FavoritesProvider>(
          builder: (context, favoritesProvider, _) {
            final isFavorite = favoritesProvider.isFavorite(property.id);
            return Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.3),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: Icon(
                  isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: isFavorite ? Colors.redAccent : Colors.white,
                ),
                onPressed: () {
                  final authProvider = Provider.of<AuthProvider>(context, listen: false);
                  if (!authProvider.isAuthenticated) {
                    Navigator.of(context).pushNamed('/login');
                    return;
                  }
                  favoritesProvider.toggleFavorite(property.id);
                },
              ),
            );
          },
        ),
        Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.3),
            shape: BoxShape.circle,
          ),
          child: IconButton(
            icon: const Icon(Icons.share, color: Colors.white),
            onPressed: () => _shareProperty(property),
          ),
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            if (images.isNotEmpty)
              PageView.builder(
                itemCount: images.length,
                onPageChanged: (index) {
                  setState(() {
                    _currentImageIndex = index;
                  });
                },
                itemBuilder: (context, index) {
                  return CachedNetworkImage(
                    imageUrl: images[index],
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(
                      color: Colors.grey.shade300,
                      child: const Center(child: CircularProgressIndicator()),
                    ),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.grey.shade300,
                      child: const Icon(Icons.error, size: 60),
                    ),
                  );
                },
              )
            else
              Container(
                color: Colors.grey.shade300,
                child: const Icon(Icons.hotel, size: 80),
              ),
            // Gradient overlay
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                height: 100,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.7),
                    ],
                  ),
                ),
              ),
            ),
            // Image counter
            if (images.length > 1)
              Positioned(
                bottom: 20,
                right: 20,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_currentImageIndex + 1} / ${images.length}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(Property property, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  property.displayName,
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    fontSize: 24,
                  ),
                ),
              ),
              if (property.ratingCount > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: theme.primaryColor,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: theme.primaryColor.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star, size: 18, color: Colors.white),
                      const SizedBox(width: 4),
                      Text(
                        property.ratingAverage.toStringAsFixed(1),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.location_on, size: 18, color: theme.primaryColor),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  property.fullAddress,
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    fontSize: 15,
                  ),
                ),
              ),
            ],
          ),
          if (property.ratingCount > 0) ...[
            const SizedBox(height: 8),
            Text(
              '${property.ratingCount} ${property.ratingCount == 1 ? "reseña" : "reseñas"}',
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 14,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildHostSection(Property property, ThemeData theme) {
    // Obtener información del host desde la propiedad
    final hostName = property.host?.name ?? 'Anfitrión';
    final hostAvatar = property.host?.profilePicture;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: InkWell(
        onTap: () {
          if (property.host?.id != null) {
            Navigator.of(context).pushNamed('/host-profile', arguments: property.host!.id);
          }
        },
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade200),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              // Avatar
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: theme.primaryColor.withOpacity(0.1),
                  image: hostAvatar != null
                      ? DecorationImage(
                          image: CachedNetworkImageProvider(hostAvatar),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: hostAvatar == null
                    ? Icon(Icons.person, size: 32, color: theme.primaryColor)
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Anfitrión: $hostName',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Ver perfil del anfitrión',
                      style: TextStyle(
                        color: theme.primaryColor,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey.shade400),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDescription(Property property, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Acerca de este lugar',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            property.description,
            style: TextStyle(
              fontSize: 15,
              height: 1.6,
              color: Colors.grey.shade800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmenities(Property property, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Servicios disponibles',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 3.5,
            children: property.propertyAmenities.take(6).map((amenity) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: theme.primaryColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: theme.primaryColor.withOpacity(0.2),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _getAmenityIcon(amenity),
                      size: 20,
                      color: theme.primaryColor,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _translateAmenity(amenity),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade800,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckInOut(Property property, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Horarios',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        theme.primaryColor.withOpacity(0.1),
                        theme.primaryColor.withOpacity(0.05),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: theme.primaryColor.withOpacity(0.3)),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.login, size: 32, color: theme.primaryColor),
                      const SizedBox(height: 8),
                      const Text(
                        'Check-in',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        property.checkInTime,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 17,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.orange.withOpacity(0.1),
                        Colors.orange.withOpacity(0.05),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.orange.withOpacity(0.3)),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.logout, size: 32, color: Colors.orange),
                      const SizedBox(height: 8),
                      const Text(
                        'Check-out',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        property.checkOutTime,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 17,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBookingSection(Property property, ThemeData theme) {
    final dateFormat = DateFormat('d MMM', 'es');

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tu reserva',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 16),

          // Fechas y huéspedes card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                // Fechas
                InkWell(
                  onTap: _openDateSelector,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.calendar_today, color: theme.primaryColor, size: 22),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _checkIn != null && _checkOut != null
                              ? Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Fechas',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${dateFormat.format(_checkIn!)} - ${dateFormat.format(_checkOut!)}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 15,
                                      ),
                                    ),
                                  ],
                                )
                              : const Text(
                                  'Seleccionar fechas',
                                  style: TextStyle(fontSize: 15),
                                ),
                        ),
                        Icon(Icons.edit, size: 18, color: Colors.grey.shade600),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Huéspedes
                InkWell(
                  onTap: _openGuestsSelector,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.people, color: theme.primaryColor, size: 22),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Huéspedes',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '$_adults ${_adults == 1 ? "adulto" : "adultos"}${_children > 0 ? ", $_children ${_children == 1 ? "niño" : "niños"}" : ""}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.edit, size: 18, color: Colors.grey.shade600),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Habitaciones
          Text(
            'Selecciona una habitación',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 12),
          ...property.rooms.map((room) => _buildRoomCard(room, theme)),
        ],
      ),
    );
  }

  Widget _buildRoomCard(Room room, ThemeData theme) {
    final isSelected = _selectedRoom?.id == room.id;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected ? theme.primaryColor : Colors.grey.shade300,
          width: isSelected ? 2.5 : 1,
        ),
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: theme.primaryColor.withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Material(
        color: isSelected ? theme.primaryColor.withOpacity(0.05) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: () {
            setState(() {
              _selectedRoom = room;
            });
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                // Room image
                if (room.images.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CachedNetworkImage(
                      imageUrl: room.images.first,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        width: 80,
                        height: 80,
                        color: Colors.grey.shade300,
                      ),
                      errorWidget: (context, url, error) => Container(
                        width: 80,
                        height: 80,
                        color: Colors.grey.shade300,
                        child: const Icon(Icons.bed),
                      ),
                    ),
                  )
                else
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.bed, size: 32),
                  ),
                const SizedBox(width: 16),

                // Room info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        room.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.people_outline,
                              size: 16, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(
                            'Hasta ${room.guestCapacity} huéspedes',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${CurrencyFormatter.format(room.pricePerNight)}/noche',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: theme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),

                // Checkmark
                if (isSelected)
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: theme.primaryColor,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check, color: Colors.white, size: 20),
                  )
                else
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.grey.shade400, width: 2),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomBar(Property property, ThemeData theme) {
    final nights =
        _checkIn != null && _checkOut != null ? _checkOut!.difference(_checkIn!).inDays : 0;
    final totalPrice = _selectedRoom != null && nights > 0
        ? _selectedRoom!.pricePerNight * nights
        : null;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (totalPrice != null) ...[
                    Text(
                      CurrencyFormatter.format(totalPrice),
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.primaryColor,
                        fontSize: 22,
                      ),
                    ),
                    Text(
                      '$nights ${nights == 1 ? "noche" : "noches"}',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ] else ...[
                    Text(
                      'Desde ${CurrencyFormatter.format(property.minPrice)}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.primaryColor,
                      ),
                    ),
                    Text(
                      'por noche',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            ElevatedButton(
              onPressed: _proceedToCheckout,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
              ),
              child: const Text(
                'Reservar ahora',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getAmenityIcon(String amenity) {
    const icons = {
      'wifi': Icons.wifi,
      'parking': Icons.local_parking,
      'pool': Icons.pool,
      'gym': Icons.fitness_center,
      'restaurant': Icons.restaurant,
      'bar': Icons.local_bar,
      'spa': Icons.spa,
      'ac': Icons.ac_unit,
      'heating': Icons.whatshot,
      'kitchen': Icons.kitchen,
      'tv': Icons.tv,
      'washer': Icons.local_laundry_service,
      'dryer': Icons.dry_cleaning,
    };
    return icons[amenity] ?? Icons.check_circle;
  }

  String _translateAmenity(String amenity) {
    const translations = {
      'wifi': 'WiFi',
      'parking': 'Estacionamiento',
      'pool': 'Piscina',
      'gym': 'Gimnasio',
      'restaurant': 'Restaurante',
      'bar': 'Bar',
      'spa': 'Spa',
      'ac': 'Aire acondicionado',
      'heating': 'Calefacción',
      'kitchen': 'Cocina',
      'tv': 'TV',
      'washer': 'Lavadora',
      'dryer': 'Secadora',
    };
    return translations[amenity] ?? amenity;
  }
}
