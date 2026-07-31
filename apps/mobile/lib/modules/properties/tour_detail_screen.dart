import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/url_helper.dart';
import '../../core/config/app_config.dart';
import '../../providers/properties_provider.dart';
import '../../models/tour.dart';

class TourDetailScreen extends StatefulWidget {
  final String tourId;

  const TourDetailScreen({super.key, required this.tourId});

  @override
  State<TourDetailScreen> createState() => _TourDetailScreenState();
}

class _TourDetailScreenState extends State<TourDetailScreen> {
  final PageController _pageController = PageController();
  int _currentImage = 0;

  static const _difficultyLabels = {
    'low': 'Fácil',
    'medium': 'Moderada',
    'high': 'Exigente',
  };

  static const _categoryLabels = {
    'adventure': 'Aventura',
    'cultural': 'Cultural',
    'beach': 'Playa',
    'romantic': 'Romántico',
    'family': 'Familiar',
    'nature': 'Naturaleza',
    'gastronomic': 'Gastronómico',
    'religious': 'Religioso',
    'sports': 'Deportivo',
    'other': 'Otro',
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PropertiesProvider>(context, listen: false)
          .loadTourDetail(widget.tourId);
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _shareTour(Tour tour) {
    final url = '${AppConfig.webUrl}/tours/${tour.id}';
    Share.share('${tour.name} en TuDestino\n$url', subject: tour.name);
  }

  Future<void> _callPhone(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    await launchUrl(uri);
  }

  Future<void> _emailBusiness(String email, String tourName) async {
    final uri = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=${Uri.encodeComponent('Consulta sobre $tourName')}',
    );
    await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PropertiesProvider>();
    final tour = provider.selectedTour;

    if (provider.isLoading && tour == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (tour == null || tour.id != widget.tourId) {
      return Scaffold(
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: Center(
          child: Text(provider.error ?? 'No se pudo cargar el tour'),
        ),
      );
    }

    final images = tour.allImages;

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
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
                  onPressed: () => _shareTour(tour),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: images.isEmpty
                  ? Container(
                      color: AppTheme.sand,
                      child: const Icon(Icons.tour_outlined, size: 60, color: AppTheme.mute),
                    )
                  : Stack(
                      fit: StackFit.expand,
                      children: [
                        PageView.builder(
                          controller: _pageController,
                          itemCount: images.length,
                          onPageChanged: (i) => setState(() => _currentImage = i),
                          itemBuilder: (context, i) => CachedNetworkImage(
                            imageUrl: UrlHelper.getFullImageUrl(images[i], folder: 'tours'),
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(
                              color: AppTheme.sand,
                              child: const Icon(Icons.tour_outlined, size: 60, color: AppTheme.mute),
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
                    runSpacing: 8,
                    children: [
                      _tag(_categoryLabels[tour.category] ?? tour.category, AppTheme.primaryColor),
                      _tag(_difficultyLabels[tour.difficultyLevel] ?? tour.difficultyLevel, AppTheme.secondaryColor),
                      _tag(tour.duration, AppTheme.mute),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(tour.name, style: Theme.of(context).textTheme.displayMedium),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.place_outlined, size: 18, color: AppTheme.mute),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          tour.destinations.isNotEmpty
                              ? '${tour.mainDestination} · ${tour.destinations.join(', ')}'
                              : tour.mainDestination,
                          style: const TextStyle(color: AppTheme.mute),
                        ),
                      ),
                    ],
                  ),
                  if (tour.ratingAverage > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 18, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text('${tour.ratingAverage.toStringAsFixed(1)} (${tour.reviewCount})'),
                      ],
                    ),
                  ],
                  const Divider(height: 40),
                  Text('Descripción', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Text(
                    tour.description.isNotEmpty ? tour.description : 'Sin descripción disponible.',
                    style: const TextStyle(height: 1.5),
                  ),
                  if (tour.itinerary.isNotEmpty) ...[
                    const Divider(height: 40),
                    Text('Itinerario', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 12),
                    ...tour.itinerary.map((day) => _buildItineraryDay(day)),
                  ],
                  if (tour.included.isNotEmpty) ...[
                    const Divider(height: 40),
                    Text('Incluye', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    ...tour.included.map((item) => _buildListItem(item, Icons.check_circle, AppTheme.secondaryColor)),
                  ],
                  if (tour.notIncluded.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text('No incluye', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    ...tour.notIncluded.map((item) => _buildListItem(item, Icons.cancel_outlined, AppTheme.mute)),
                  ],
                  if (tour.meetingPointAddress != null) ...[
                    const Divider(height: 40),
                    Text('Punto de encuentro', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, color: AppTheme.mute),
                        const SizedBox(width: 8),
                        Expanded(child: Text(tour.meetingPointAddress!)),
                      ],
                    ),
                  ],
                  const SizedBox(height: 140),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(tour),
    );
  }

  Widget _tag(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildItineraryDay(TourItineraryDay day) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.sand,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Día ${day.day}${day.title.isNotEmpty ? ' · ${day.title}' : ''}',
              style: const TextStyle(fontWeight: FontWeight.w600)),
          if (day.description.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(day.description, style: const TextStyle(color: AppTheme.mute)),
          ],
          if (day.activities.isNotEmpty) ...[
            const SizedBox(height: 8),
            ...day.activities.map((a) => Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('•  '),
                      Expanded(child: Text(a)),
                    ],
                  ),
                )),
          ],
        ],
      ),
    );
  }

  Widget _buildListItem(String label, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 8),
          Expanded(child: Text(label)),
        ],
      ),
    );
  }

  Widget _buildBottomBar(Tour tour) {
    final business = tour.business;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, -4))],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tour.formattedPrice, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                  const Text('por persona', style: TextStyle(fontSize: 12, color: AppTheme.mute)),
                ],
              ),
            ),
            if (business?.contactPhone != null)
              IconButton.filled(
                onPressed: () => _callPhone(business!.contactPhone!),
                icon: const Icon(Icons.call),
                style: IconButton.styleFrom(backgroundColor: AppTheme.secondaryColor),
              )
            else if (business?.contactEmail != null)
              IconButton.filled(
                onPressed: () => _emailBusiness(business!.contactEmail!, tour.name),
                icon: const Icon(Icons.email_outlined),
                style: IconButton.styleFrom(backgroundColor: AppTheme.secondaryColor),
              ),
            const SizedBox(width: 12),
            ElevatedButton(
              onPressed: (business?.contactPhone != null || business?.contactEmail != null)
                  ? () {
                      if (business!.contactPhone != null) {
                        _callPhone(business.contactPhone!);
                      } else {
                        _emailBusiness(business.contactEmail!, tour.name);
                      }
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              ),
              child: const Text('Consultar disponibilidad'),
            ),
          ],
        ),
      ),
    );
  }
}
