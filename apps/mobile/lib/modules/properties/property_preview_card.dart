import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:ionicons/ionicons.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../providers/favorites_provider.dart';
import '../../models/property.dart';

/// Card de vista previa que aparece sobre el mapa al tocar el pin de precio
/// de una propiedad - galería, título, precio y like; tocar la card (fuera
/// de los botones) navega al detalle completo. Compartida entre
/// search_results_screen.dart y search_screen.dart (mismo patrón mapa +
/// panel deslizable + preview en ambas).
class PropertyPreviewCard extends StatelessWidget {
  final Property property;
  final DateTime? checkIn;
  final DateTime? checkOut;
  final int adults;
  final int children;
  final VoidCallback onHide;

  const PropertyPreviewCard({
    super.key,
    required this.property,
    required this.checkIn,
    required this.checkOut,
    required this.adults,
    required this.children,
    required this.onHide,
  });

  @override
  Widget build(BuildContext context) {
    final images = property.rooms.expand((r) => r.images).toList();
    final maxHeight = MediaQuery.of(context).size.height * 0.5;

    return Align(
      alignment: Alignment.bottomCenter,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxHeight: maxHeight),
        child: Container(
          margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: GestureDetector(
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
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  height: 160,
                  width: double.infinity,
                  child: images.isEmpty
                      ? Container(
                          color: AppTheme.sand,
                          child: const Icon(Ionicons.image_outline,
                              size: 40, color: AppTheme.mute),
                        )
                      : PageView.builder(
                          itemCount: images.length,
                          itemBuilder: (context, i) => CachedNetworkImage(
                            imageUrl: images[i],
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(
                              color: AppTheme.sand,
                              child: const Icon(Ionicons.image_outline,
                                  size: 40, color: AppTheme.mute),
                            ),
                          ),
                        ),
                ),
                Flexible(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          property.displayName,
                          style: const TextStyle(
                              fontSize: 17, fontWeight: FontWeight.w600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          property.fullAddress,
                          style: TextStyle(
                              fontSize: 13, color: Colors.grey.shade600),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: RichText(
                                text: TextSpan(
                                  children: [
                                    TextSpan(
                                      text: CurrencyFormatter.format(property.minPrice),
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 17,
                                        color: Theme.of(context).primaryColor,
                                      ),
                                    ),
                                    TextSpan(
                                      text: '/noche',
                                      style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey.shade600),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            Consumer<FavoritesProvider>(
                              builder: (context, favoritesProvider, _) {
                                final isFav = favoritesProvider.isFavorite(property.id);
                                return IconButton(
                                  icon: Icon(
                                    isFav ? Ionicons.heart : Ionicons.heart_outline,
                                    color: isFav ? Colors.red : AppTheme.mute,
                                  ),
                                  onPressed: () =>
                                      favoritesProvider.toggleFavorite(property.id),
                                );
                              },
                            ),
                            TextButton(
                              onPressed: onHide,
                              child: const Text('Ocultar'),
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
        ),
      ),
    );
  }
}
