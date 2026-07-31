import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:ionicons/ionicons.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/favorites_provider.dart';
import 'package:provider/provider.dart';
import '../../models/property.dart';

class PropertyGridCard extends StatelessWidget {
  final Property property;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final int? adults;
  final int? children;

  const PropertyGridCard({
    super.key,
    required this.property,
    this.checkIn,
    this.checkOut,
    this.adults,
    this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.of(context).pushNamed(
            '/property-detail',
            arguments: {
              'propertyId': property.id,
              'checkIn': checkIn,
              'checkOut': checkOut,
              'adults': adults,
              'children': children,
            },
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen
            Expanded(
              flex: 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (property.rooms.isNotEmpty &&
                      property.rooms.first.images.isNotEmpty)
                    CachedNetworkImage(
                      imageUrl: property.rooms.first.images.first,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: AppTheme.sand,
                        child: const Center(
                          child: CircularProgressIndicator(),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: AppTheme.sand,
                        child: const Icon(Ionicons.bed_outline,
                            size: 40, color: AppTheme.mute),
                      ),
                    )
                  else
                    Container(
                      color: AppTheme.sand,
                      child: const Icon(Ionicons.bed_outline,
                          size: 40, color: AppTheme.mute),
                    ),

                  // Corazón de favorito (arriba derecha)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Consumer<FavoritesProvider>(
                      builder: (context, favoritesProvider, _) {
                        final isFav = favoritesProvider.isFavorite(property.id);
                        return GestureDetector(
                          onTap: () => favoritesProvider.toggleFavorite(property.id),
                          child: Container(
                            width: 26,
                            height: 26,
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.32),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              isFav ? Ionicons.heart : Ionicons.heart_outline,
                              size: 14,
                              color: Colors.white,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            // Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Title
                    Text(
                      property.displayName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: AppTheme.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),

                    // Ubicación
                    Row(
                      children: [
                        const Icon(
                          Ionicons.location_outline,
                          size: 13,
                          color: AppTheme.mute,
                        ),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            property.addressCity,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.mute,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Precio
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: CurrencyFormatter.format(property.minPrice),
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                          const TextSpan(
                            text: '/noche',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppTheme.mute,
                            ),
                          ),
                        ],
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
}
