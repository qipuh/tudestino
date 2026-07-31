import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:ionicons/ionicons.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/properties_provider.dart';

const _businessTypeLabels = {
  'restaurant': 'Restaurante',
  'entertainment': 'Entretenimiento',
  'spa': 'Spa',
  'tours': 'Tours',
  'events': 'Eventos',
};

class BusinessDetailScreen extends StatefulWidget {
  final String businessId;

  const BusinessDetailScreen({super.key, required this.businessId});

  @override
  State<BusinessDetailScreen> createState() => _BusinessDetailScreenState();
}

class _BusinessDetailScreenState extends State<BusinessDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PropertiesProvider>(context, listen: false)
          .loadBusinessDetail(widget.businessId);
    });
  }

  Future<void> _call(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PropertiesProvider>();
    final business = provider.selectedBusiness;

    if (provider.isLoading && business == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (business == null || business.id != widget.businessId) {
      return Scaffold(
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: Center(child: Text(provider.error ?? 'No se pudo cargar el negocio')),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 260,
            pinned: true,
            elevation: 0,
            backgroundColor: Colors.white,
            iconTheme: const IconThemeData(color: Colors.white),
            flexibleSpace: FlexibleSpaceBar(
              background: business.coverImageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: business.coverImageUrl!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        color: AppTheme.sand,
                        child: const Icon(Ionicons.storefront_outline,
                            size: 60, color: AppTheme.mute),
                      ),
                    )
                  : Container(
                      color: AppTheme.sand,
                      child: const Icon(Ionicons.storefront_outline,
                          size: 60, color: AppTheme.mute),
                    ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_businessTypeLabels[business.businessType] != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _businessTypeLabels[business.businessType]!,
                        style: const TextStyle(
                          color: AppTheme.primaryColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  const SizedBox(height: 12),
                  Text(business.name,
                      style: Theme.of(context).textTheme.displayMedium),
                  if (business.locationLabel.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Ionicons.location_outline,
                            size: 18, color: AppTheme.mute),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            business.street ?? business.locationLabel,
                            style: const TextStyle(color: AppTheme.mute),
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (business.ratingAverage > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Ionicons.star,
                            size: 16, color: AppTheme.accentColor),
                        const SizedBox(width: 4),
                        Text(
                          '${business.ratingAverage.toStringAsFixed(1)} (${business.reviewCount})',
                          style: const TextStyle(
                              color: AppTheme.mute, fontSize: 13),
                        ),
                      ],
                    ),
                  ],
                  if (business.contactPhone != null &&
                      business.contactPhone!.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    OutlinedButton.icon(
                      onPressed: () => _call(business.contactPhone!),
                      icon: const Icon(Ionicons.call_outline, size: 18),
                      label: Text('Llamar · ${business.contactPhone}'),
                    ),
                  ],
                  if (business.description != null &&
                      business.description!.isNotEmpty) ...[
                    const Divider(height: 40),
                    Text('Descripción',
                        style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text(business.description!,
                        style: const TextStyle(height: 1.5)),
                  ],
                  if (provider.businessMenu.isNotEmpty) ...[
                    const Divider(height: 40),
                    Text('Menú', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 12),
                    ...provider.businessMenu.map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (item.imageUrl != null) ...[
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: CachedNetworkImage(
                                    imageUrl: item.imageUrl!,
                                    width: 56,
                                    height: 56,
                                    fit: BoxFit.cover,
                                    errorWidget: (_, __, ___) => Container(
                                      width: 56,
                                      height: 56,
                                      color: AppTheme.sand,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                              ],
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(item.name,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.w600)),
                                    if (item.description != null &&
                                        item.description!.isNotEmpty)
                                      Text(item.description!,
                                          style: const TextStyle(
                                              color: AppTheme.mute,
                                              fontSize: 13)),
                                  ],
                                ),
                              ),
                              Text(
                                'S/ ${item.price.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.primaryColor,
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                  if (provider.businessPhotos.isNotEmpty) ...[
                    const Divider(height: 40),
                    Text('Fotos', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 100,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: provider.businessPhotos.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final photo = provider.businessPhotos[index];
                          return ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: CachedNetworkImage(
                              imageUrl: photo.url,
                              width: 100,
                              height: 100,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => Container(
                                width: 100,
                                height: 100,
                                color: AppTheme.sand,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
