import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/url_helper.dart';
import '../../models/attraction.dart';

class AttractionResultCard extends StatelessWidget {
  final Attraction attraction;

  const AttractionResultCard({super.key, required this.attraction});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final imageUrl = attraction.coverImage != null
        ? UrlHelper.getFullImageUrl(attraction.coverImage, folder: 'attractions')
        : null;

    final location = [attraction.city, attraction.region]
        .where((s) => s != null && s.isNotEmpty)
        .join(', ');

    // Estructura Expanded 3/2 (igual que PropertyGridCard) para que el
    // contenido nunca desborde la altura fija que le da el GridView -
    // antes esto era un Card de alto libre (pensado para ListView) y
    // desbordaba al vivir dentro de una celda de grid de 2 columnas.
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppTheme.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed('/attraction-detail', arguments: attraction.id),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  imageUrl != null
                      ? CachedNetworkImage(
                          imageUrl: imageUrl,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => Container(
                            color: AppTheme.sand,
                            child: const Icon(Icons.landscape_outlined,
                                size: 40, color: AppTheme.mute),
                          ),
                        )
                      : Container(
                          color: AppTheme.sand,
                          child: const Icon(Icons.landscape_outlined,
                              size: 40, color: AppTheme.mute),
                        ),
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${attraction.categoryEmoji} ${attraction.categoryLabel}',
                        style: const TextStyle(color: Colors.white, fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ],
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
                      attraction.title,
                      style: theme.textTheme.titleMedium
                          ?.copyWith(fontSize: 14, fontWeight: FontWeight.w600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (location.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.place_outlined,
                              size: 14, color: AppTheme.mute),
                          const SizedBox(width: 3),
                          Expanded(
                            child: Text(
                              location,
                              style: theme.textTheme.bodySmall,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
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
}
