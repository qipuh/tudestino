import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/url_helper.dart';
import '../../core/config/app_config.dart';
import '../../providers/properties_provider.dart';
import '../../models/attraction.dart';

class AttractionDetailScreen extends StatefulWidget {
  final String attractionId;

  const AttractionDetailScreen({super.key, required this.attractionId});

  @override
  State<AttractionDetailScreen> createState() => _AttractionDetailScreenState();
}

class _AttractionDetailScreenState extends State<AttractionDetailScreen> {
  final PageController _pageController = PageController();
  int _currentImage = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PropertiesProvider>(context, listen: false)
          .loadAttractionDetail(widget.attractionId);
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _share(Attraction attraction) {
    final url = '${AppConfig.webUrl}/atractivos/${attraction.id}';
    Share.share('${attraction.title} en TuDestino\n$url', subject: attraction.title);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PropertiesProvider>();
    final attraction = provider.selectedAttraction;

    if (provider.isLoading && attraction == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (attraction == null || attraction.id != widget.attractionId) {
      return Scaffold(
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: Center(child: Text(provider.error ?? 'No se pudo cargar el atractivo')),
      );
    }

    final images = <String>[
      if (attraction.coverImage != null) attraction.coverImage!,
      ...attraction.galleryImages,
    ].map((img) => UrlHelper.getFullImageUrl(img, folder: 'attractions')).toList();

    final locationLabel = [attraction.city, attraction.region]
        .where((s) => s != null && s.isNotEmpty)
        .join(', ');

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            elevation: 0,
            backgroundColor: Colors.white,
            iconTheme: const IconThemeData(color: Colors.white),
            actions: [
              Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.black.withOpacity(0.3), shape: BoxShape.circle),
                child: IconButton(
                  icon: const Icon(Icons.share, color: Colors.white),
                  onPressed: () => _share(attraction),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: images.isEmpty
                  ? Container(
                      color: AppTheme.sand,
                      child: const Icon(Icons.landscape_outlined, size: 60, color: AppTheme.mute),
                    )
                  : Stack(
                      fit: StackFit.expand,
                      children: [
                        PageView.builder(
                          controller: _pageController,
                          itemCount: images.length,
                          onPageChanged: (i) => setState(() => _currentImage = i),
                          itemBuilder: (context, i) => CachedNetworkImage(
                            imageUrl: images[i],
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(
                              color: AppTheme.sand,
                              child: const Icon(Icons.landscape_outlined, size: 60, color: AppTheme.mute),
                            ),
                          ),
                        ),
                        if (images.length > 1)
                          Positioned(
                            bottom: 16,
                            left: 0,
                            right: 0,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                images.length,
                                (i) => Container(
                                  width: 6,
                                  height: 6,
                                  margin: const EdgeInsets.symmetric(horizontal: 3),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Colors.white.withOpacity(i == _currentImage ? 1 : 0.4),
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 8,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${attraction.categoryEmoji} ${attraction.categoryLabel}',
                          style: const TextStyle(color: AppTheme.primaryColor, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(attraction.title, style: Theme.of(context).textTheme.displayMedium),
                  if (locationLabel.isNotEmpty || attraction.address != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.place_outlined, size: 18, color: AppTheme.mute),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            attraction.address ?? locationLabel,
                            style: const TextStyle(color: AppTheme.mute),
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.visibility_outlined, size: 16, color: AppTheme.mute),
                      const SizedBox(width: 4),
                      Text('${attraction.views} vistas', style: const TextStyle(color: AppTheme.mute, fontSize: 13)),
                    ],
                  ),
                  const Divider(height: 40),
                  Text('Descripción', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Text(
                    attraction.description.isNotEmpty ? attraction.description : 'Sin descripción disponible.',
                    style: const TextStyle(height: 1.5),
                  ),
                  if (attraction.whatToDo != null && attraction.whatToDo!.isNotEmpty) ...[
                    const Divider(height: 40),
                    Text('Qué hacer', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text(attraction.whatToDo!, style: const TextStyle(height: 1.5)),
                  ],
                  if (attraction.recommendations != null && attraction.recommendations!.isNotEmpty) ...[
                    const Divider(height: 40),
                    Text('Recomendaciones', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text(attraction.recommendations!, style: const TextStyle(height: 1.5)),
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
