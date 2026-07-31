import 'package:flutter/material.dart';
import '../../businesses/models/business_model.dart';
import '../../businesses/services/businesses_service.dart';

class BusinessServicesScreen extends StatefulWidget {
  final String businessId;
  final String? businessName;

  const BusinessServicesScreen({
    super.key,
    required this.businessId,
    this.businessName,
  });

  @override
  State<BusinessServicesScreen> createState() =>
      _BusinessServicesScreenState();
}

class _BusinessServicesScreenState extends State<BusinessServicesScreen> {
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
      appBar: AppBar(
        title: const Text('Servicios'),
        elevation: 0,
      ),
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
          final services = business.services ?? [];

          if (services.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.room_service_outlined,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Sin servicios disponibles',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: services.length,
            itemBuilder: (context, index) {
              final service = services[index];
              return ServiceCard(service: service);
            },
          );
        },
      ),
    );
  }
}

class ServiceCard extends StatelessWidget {
  final ServiceModel service;

  const ServiceCard({
    super.key,
    required this.service,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
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
                        service.name,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.blue.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          service.type,
                          style:
                              Theme.of(context).textTheme.labelSmall?.copyWith(
                                    color: Colors.blue,
                                  ),
                        ),
                      ),
                    ],
                  ),
                ),
                if (service.price != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${service.currency} ${service.price!.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                            ),
                      ),
                    ],
                  ),
              ],
            ),
            if (service.description != null &&
                service.description!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                service.description!,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
