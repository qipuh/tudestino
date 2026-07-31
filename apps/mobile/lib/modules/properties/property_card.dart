import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/property.dart';

/// Card vertical de propiedad usada en resultados de búsqueda.
/// (Antes vivía dentro de home_screen.dart; extraída al reescribir el home.)
class PropertyCard extends StatelessWidget {
  final Property property;

  const PropertyCard({super.key, required this.property});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.of(context).pushNamed(
            '/property-detail',
            arguments: property.id,
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Property Image
            Stack(
              children: [
                SizedBox(
                  height: 200,
                  width: double.infinity,
                  child: property.rooms.isNotEmpty &&
                          property.rooms.first.images.isNotEmpty
                      ? CachedNetworkImage(
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
                            child: const Icon(Icons.hotel_outlined,
                                size: 48, color: AppTheme.mute),
                          ),
                        )
                      : Container(
                          color: AppTheme.sand,
                          child: const Icon(Icons.hotel_outlined,
                              size: 48, color: AppTheme.mute),
                        ),
                ),
                if (property.ratingAverage >= 4.5)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.star, size: 14, color: Colors.white),
                          SizedBox(width: 4),
                          Text(
                            'Destacado',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
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
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    property.displayName,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.place_outlined,
                          size: 16, color: AppTheme.mute),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${property.addressCity}, ${property.addressCountry}',
                          style: theme.textTheme.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (property.ratingCount > 0)
                        Row(
                          children: [
                            const Icon(Icons.star,
                                size: 16, color: Colors.amber),
                            const SizedBox(width: 4),
                            Text(
                              '${property.ratingAverage.toStringAsFixed(1)} (${property.ratingCount})',
                              style: theme.textTheme.bodySmall,
                            ),
                          ],
                        )
                      else
                        Text('Sin reseñas', style: theme.textTheme.bodySmall),
                      Text(
                        '${CurrencyFormatter.format(property.minPrice)}/noche',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primaryColor,
                        ),
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
