import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/business_model.dart';
import '../services/businesses_service.dart';

class BusinessDetailScreen extends StatefulWidget {
  final String businessId;

  const BusinessDetailScreen({
    super.key,
    required this.businessId,
  });

  @override
  State<BusinessDetailScreen> createState() => _BusinessDetailScreenState();
}

class _BusinessDetailScreenState extends State<BusinessDetailScreen> {
  final BusinessesService _service = BusinessesService();
  late Future<BusinessModel> _businessFuture;

  @override
  void initState() {
    super.initState();
    _businessFuture = _service.getBusinessById(widget.businessId, include: true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder<BusinessModel>(
        future: _businessFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Error: ${snapshot.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Volver'),
                  ),
                ],
              ),
            );
          }

          final business = snapshot.data!;
          return CustomScrollView(
            slivers: [
              _buildAppBar(context, business),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(business),
                      const SizedBox(height: 24),
                      if (business.description != null &&
                          business.description!.isNotEmpty) ...[
                        _buildSection(
                          title: 'Descripción',
                          child: Text(
                            business.description!,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                      if (business.address != null) ...[
                        _buildSection(
                          title: 'Ubicación',
                          child: _buildLocationInfo(business.address!),
                        ),
                        const SizedBox(height: 24),
                      ],
                      _buildSection(
                        title: 'Contacto',
                        child: _buildContactInfo(business),
                      ),
                      const SizedBox(height: 24),
                      _buildActionButtons(context, business),
                      const SizedBox(height: 24),
                      if (business.images.isNotEmpty) ...[
                        _buildSection(
                          title: 'Galería',
                          child: _buildGallery(business.images),
                        ),
                        const SizedBox(height: 24),
                      ],
                      if (business.services != null &&
                          business.services!.isNotEmpty) ...[
                        _buildSection(
                          title: 'Servicios',
                          child: _buildServicesList(business.services!),
                        ),
                        const SizedBox(height: 24),
                      ],
                      if (business.menu != null && business.menu!.isNotEmpty) ...[
                        _buildSection(
                          title: 'Menú',
                          child: _buildMenuList(business.menu!),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  SliverAppBar _buildAppBar(BuildContext context, BusinessModel business) {
    return SliverAppBar(
      expandedHeight: 200,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: business.coverImage != null
            ? Image.network(
                business.coverImage!,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: Colors.grey[300],
                    child: const Icon(Icons.image_not_supported),
                  );
                },
              )
            : Container(
                color: Colors.grey[300],
                child: const Icon(Icons.store),
              ),
      ),
    );
  }

  Widget _buildHeader(BusinessModel business) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    business.name,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    business.type.toUpperCase(),
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: Colors.blue,
                        ),
                  ),
                ],
              ),
            ),
            if (business.rating != null)
              Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 20),
                      const SizedBox(width: 4),
                      Text(
                        business.rating!.toStringAsFixed(1),
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                  if (business.reviewCount != null)
                    Text(
                      '${business.reviewCount} reseñas',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                ],
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildSection({
    required String title,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 12),
        child,
      ],
    );
  }

  Widget _buildLocationInfo(AddressModel address) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (address.fullAddress.isNotEmpty)
          Text(
            address.fullAddress,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
      ],
    );
  }

  Widget _buildContactInfo(BusinessModel business) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (business.phoneNumber != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                const Icon(Icons.phone, size: 20, color: Colors.grey),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () => _launchPhone(business.phoneNumber!),
                    child: Text(
                      business.phoneNumber!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.blue,
                            decoration: TextDecoration.underline,
                          ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        if (business.email != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                const Icon(Icons.email, size: 20, color: Colors.grey),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () => _launchEmail(business.email!),
                    child: Text(
                      business.email!,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.blue,
                            decoration: TextDecoration.underline,
                          ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
            ),
          ),
        if (business.website != null)
          Row(
            children: [
              const Icon(Icons.language, size: 20, color: Colors.grey),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () => _launchUrl(business.website!),
                  child: Text(
                    business.website!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.blue,
                          decoration: TextDecoration.underline,
                        ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildGallery(List<String> images) {
    return SizedBox(
      height: 150,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: images.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                images[index],
                width: 150,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 150,
                    color: Colors.grey[300],
                    child: const Icon(Icons.image_not_supported),
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildServicesList(List<ServiceModel> services) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: services.length,
      itemBuilder: (context, index) {
        final service = services[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          service.name,
                          style:
                              Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                      ),
                      if (service.price != null)
                        Text(
                          '${service.currency} ${service.price!.toStringAsFixed(2)}',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.blue,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                    ],
                  ),
                  if (service.description != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      service.description!,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildMenuList(List<MenuItemModel> menu) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: menu.length,
      itemBuilder: (context, index) {
        final item = menu[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.name,
                          style:
                              Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                        if (item.description != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            item.description!,
                            style: Theme.of(context).textTheme.bodySmall,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '${item.currency} ${item.price.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _launchPhone(String phoneNumber) async {
    final uri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _launchEmail(String email) async {
    final uri = Uri(scheme: 'mailto', path: email);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _launchUrl(String url) async {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // ignore: prefer_interpolation_to_compose_strings
      url = 'https://' + url;
    }
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Widget _buildActionButtons(BuildContext context, BusinessModel business) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.pushNamed(
                context,
                '/create-reservation',
                arguments: {
                  'businessId': business.id,
                  'businessName': business.name,
                  'businessType': business.type,
                  'serviceIds':
                      business.services?.map((s) => s.id).toList() ?? [],
                },
              );
            },
            icon: const Icon(Icons.calendar_today),
            label: const Text('Hacer Reserva'),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    '/business-services',
                    arguments: {
                      'businessId': business.id,
                      'businessName': business.name,
                    },
                  );
                },
                icon: const Icon(Icons.room_service),
                label: const Text('Servicios'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    '/business-offers',
                    arguments: {
                      'businessId': business.id,
                      'businessName': business.name,
                    },
                  );
                },
                icon: const Icon(Icons.local_offer),
                label: const Text('Ofertas'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
