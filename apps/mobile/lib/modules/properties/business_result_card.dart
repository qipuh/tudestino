import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../models/business_result.dart';

/// Card genérica para resultados de /search/all (restaurantes, tours,
/// entretenimiento, spa) - no tienen habitaciones ni precio por noche
/// como Property, por eso no reusan PropertyCard.
class BusinessResultCard extends StatelessWidget {
  final BusinessResult business;

  const BusinessResultCard({super.key, required this.business});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Estructura Expanded 3/2 (igual que PropertyGridCard) para que el
    // contenido nunca desborde la altura fija que le da el GridView.
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.of(context)
            .pushNamed('/business-detail', arguments: business.id),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3,
              child: business.imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: business.imageUrl!,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorWidget: (_, __, ___) => Container(
                        color: AppTheme.sand,
                        child: const Icon(Icons.storefront_outlined,
                            size: 40, color: AppTheme.mute),
                      ),
                    )
                  : Container(
                      color: AppTheme.sand,
                      width: double.infinity,
                      child: const Icon(Icons.storefront_outlined,
                          size: 40, color: AppTheme.mute),
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
                      business.name,
                      style: theme.textTheme.titleMedium
                          ?.copyWith(fontSize: 14, fontWeight: FontWeight.w600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (business.city != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.place_outlined,
                              size: 14, color: AppTheme.mute),
                          const SizedBox(width: 3),
                          Expanded(
                            child: Text(
                              [business.city, business.country]
                                  .where((s) => s != null && s.isNotEmpty)
                                  .join(', '),
                              style: theme.textTheme.bodySmall,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                    if (business.rating > 0) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.star, size: 14, color: Colors.amber),
                          const SizedBox(width: 3),
                          Text(
                            '${business.rating.toStringAsFixed(1)} (${business.reviewCount})',
                            style: theme.textTheme.bodySmall,
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
}
